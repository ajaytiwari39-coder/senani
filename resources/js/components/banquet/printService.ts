/**
 * Senani Banquet & Hotel Print & PDF Export Engine
 */

/**
 * Robust print element implementation using an isolated iframe.
 * Avoids any parent modal clipping, CSS visibility issues, or scroll constraints.
 */
export function printElement(elementId: string, customTitle: string = 'Senani Hotel Pleasant View - Banquet Voucher'): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const sourceEl = document.getElementById(elementId);
    if (!sourceEl) {
        console.error(`Print error: Element with ID #${elementId} not found.`);
        return;
    }

    // Create a temporary hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.id = 'senani-print-iframe';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
        console.error('Print error: Could not access iframe document.');
        return;
    }

    // Collect all active stylesheets and style tags
    let stylesHtml = '';
    document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
        stylesHtml += node.outerHTML;
    });

    // Write complete isolated document
    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${customTitle}</title>
            ${stylesHtml}
            <style>
                @page {
                    size: A4 portrait;
                    margin: 6mm 8mm 6mm 8mm;
                }
                html, body {
                    margin: 0 !important;
                    padding: 0 !important;
                    background: #ffffff !important;
                    color: #0f172a !important;
                    font-family: inherit;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .print-hidden, .no-print, .pdf-page-break {
                    display: none !important;
                    height: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    border: none !important;
                }
                .print-avoid-break {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                .page-1 {
                    page-break-after: always !important;
                    break-after: page !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    margin-bottom: 0 !important;
                    box-shadow: none !important;
                    border: none !important;
                }
                .page-2 {
                    page-break-before: auto !important;
                    break-before: auto !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    margin-top: 0 !important;
                    box-shadow: none !important;
                    border: none !important;
                }
                table {
                    border-collapse: collapse !important;
                    width: 100% !important;
                }
                * {
                    box-sizing: border-box !important;
                }
            </style>
        </head>
        <body>
            <div style="width: 100%; max-width: 100%; margin: 0; padding: 0;">
                ${sourceEl.outerHTML}
            </div>
        </body>
        </html>
    `);
    doc.close();

    // Allow resources (fonts, SVGs, images) to render, then print
    setTimeout(() => {
        try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
        } catch (err) {
            console.error('Error invoking iframe print:', err);
        } finally {
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
            }, 1500);
        }
    }, 450);
}

/**
 * Walks a cloned DOM tree and neutralizes ALL oklch()/oklab()/lch()/lab()/color()
 * CSS color values so html2canvas (which only supports rgb/rgba/hsl/hsla/#hex)
 * can render without crashing.
 *
 * Two-pronged approach:
 * 1. Walk all <style> elements and replace oklch(...) patterns in the raw CSS text
 *    with Canvas-2D-resolved rgb() values.
 * 2. Walk all elements and inline computed style overrides for any properties that
 *    the browser resolved from oklch.
 */
function sanitizeColorsForHtml2Canvas(clonedDoc: Document): void {
    // ── Phase 1: Rewrite raw CSS text in all <style> tags ──
    const oklchPatternGlobal = /oklch\([^)]*\)/gi;

    clonedDoc.querySelectorAll('style').forEach((styleEl) => {
        if (styleEl.textContent && oklchPatternGlobal.test(styleEl.textContent)) {
            styleEl.textContent = styleEl.textContent.replace(
                /oklch\([^)]*\)/gi,
                (match) => resolveToRgb(match, clonedDoc)
            );
        }
    });

    // Also handle oklab, lch, lab, color() functions
    const allModernPatterns = [
        /oklab\([^)]*\)/gi,
        /\blch\([^)]*\)/gi,
        /\blab\([^)]*\)/gi,
        /\bcolor\([^)]*\)/gi,
    ];
    clonedDoc.querySelectorAll('style').forEach((styleEl) => {
        if (!styleEl.textContent) return;
        for (const pat of allModernPatterns) {
            if (pat.test(styleEl.textContent)) {
                styleEl.textContent = styleEl.textContent.replace(
                    pat,
                    (match) => resolveToRgb(match, clonedDoc)
                );
            }
        }
    });

    // ── Phase 2: Inline computed color overrides on each element ──
    const colorProps = [
        'color', 'background-color', 'border-color',
        'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
        'outline-color', 'text-decoration-color', 'box-shadow', 'text-shadow',
        'fill', 'stroke', 'caret-color', 'column-rule-color',
        'accent-color', 'scrollbar-color',
    ];

    const modernColorRe = /\b(oklch|oklab|lch|lab|color)\s*\(/i;

    const allEls = clonedDoc.querySelectorAll('*');
    allEls.forEach((el) => {
        if (!(el instanceof HTMLElement)) return;
        const cs = clonedDoc.defaultView?.getComputedStyle(el);
        if (!cs) return;

        for (const prop of colorProps) {
            try {
                const val = cs.getPropertyValue(prop);
                if (val && modernColorRe.test(val)) {
                    const resolved = resolveToRgb(val, clonedDoc);
                    el.style.setProperty(prop, resolved, 'important');
                }
            } catch (_) { /* skip inaccessible props */ }
        }
    });
}

/**
 * Resolves a CSS color string (possibly oklch/oklab/etc.) to an rgb() string
 * using the browser's Canvas 2D context.
 */
function resolveToRgb(colorStr: string, doc: Document): string {
    try {
        const cvs = doc.createElement('canvas');
        cvs.width = 1;
        cvs.height = 1;
        const ctx = cvs.getContext('2d');
        if (!ctx) return colorStr;
        ctx.fillStyle = colorStr;
        ctx.fillRect(0, 0, 1, 1);
        const d = ctx.getImageData(0, 0, 1, 1).data;
        return d[3] < 255
            ? `rgba(${d[0]}, ${d[1]}, ${d[2]}, ${(d[3] / 255).toFixed(3)})`
            : `rgb(${d[0]}, ${d[1]}, ${d[2]})`;
    } catch (_) {
        return colorStr;
    }
}

/**
 * Downloads a DOM element as a high-quality PDF using native jsPDF + html2canvas.
 * Guarantees direct .pdf file download and strictly avoids opening the browser print dialog.
 *
 * Uses html2canvas's `onclone` callback to sanitize modern CSS color functions
 * (oklch, oklab, lch, lab) to rgb equivalents BEFORE html2canvas parses styles.
 * This completely bypasses the "unsupported color function" crash in html2canvas v1.x.
 */
export async function downloadElementAsPdf(
    elementId: string,
    filename: string = 'Senani-Banquet-Voucher.pdf'
): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const sourceEl = document.getElementById(elementId);
    if (!sourceEl) {
        console.error(`PDF error: Element with ID #${elementId} not found.`);
        return false;
    }

    try {
        const jsPdfModule = await import('jspdf');
        const jsPDF = jsPdfModule.jsPDF || (jsPdfModule as any).default || jsPdfModule;
        const html2canvasModule = await import('html2canvas');
        const html2canvas = (html2canvasModule as any).default || html2canvasModule;

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
        });

        // A4 Dimensions: 210mm x 297mm
        const pdfWidth = 210;
        const pdfHeight = 297;
        const marginX = 6;
        const marginY = 6;
        const printWidth = pdfWidth - marginX * 2; // 198mm
        const maxPageHeight = pdfHeight - marginY * 2; // 285mm

        const page1El = sourceEl.querySelector('.page-1') as HTMLElement;
        const page2El = sourceEl.querySelector('.page-2') as HTMLElement;

        const h2cOptions = {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 1024,
            ignoreElements: (el: Element) =>
                el.classList.contains('print-hidden') || el.classList.contains('no-print'),
            onclone: (_doc: Document, _el: HTMLElement) => {
                // Sanitize ALL modern color functions to rgb before html2canvas parses them
                sanitizeColorsForHtml2Canvas(_doc);
                // Strip outer modal borders and shadows for crisp professional PDF output
                _doc.querySelectorAll('.page-1, .page-2').forEach((p) => {
                    if (p instanceof HTMLElement) {
                        p.style.border = 'none';
                        p.style.boxShadow = 'none';
                        p.style.borderRadius = '0';
                        p.style.margin = '0';
                    }
                });
            },
        };

        if (page1El) {
            // Dedicated multi-page dossier export (.page-1 and .page-2)
            const canvas1 = await html2canvas(page1El, h2cOptions);

            const imgData1 = canvas1.toDataURL('image/jpeg', 0.96);
            const imgHeight1 = (canvas1.height * printWidth) / canvas1.width;
            doc.addImage(imgData1, 'JPEG', marginX, marginY, printWidth, Math.min(imgHeight1, maxPageHeight));

            if (page2El) {
                doc.addPage('a4', 'portrait');
                const canvas2 = await html2canvas(page2El, h2cOptions);

                const imgData2 = canvas2.toDataURL('image/jpeg', 0.96);
                const imgHeight2 = (canvas2.height * printWidth) / canvas2.width;
                doc.addImage(imgData2, 'JPEG', marginX, marginY, printWidth, Math.min(imgHeight2, maxPageHeight));
            }
        } else {
            // Generic single/multi-page element fallback (e.g. GuestMenuSelection)
            const canvas = await html2canvas(sourceEl, h2cOptions);

            const imgData = canvas.toDataURL('image/jpeg', 0.96);
            const imgHeight = (canvas.height * printWidth) / canvas.width;

            if (imgHeight <= maxPageHeight) {
                doc.addImage(imgData, 'JPEG', marginX, marginY, printWidth, imgHeight);
            } else {
                // Multi-page slicing
                let remainingHeight = imgHeight;
                let positionY = 0;

                while (remainingHeight > 0) {
                    if (positionY > 0) {
                        doc.addPage('a4', 'portrait');
                    }
                    doc.addImage(imgData, 'JPEG', marginX, marginY - positionY, printWidth, imgHeight);
                    positionY += maxPageHeight;
                    remainingHeight -= maxPageHeight;
                }
            }
        }

        // Direct file download trigger - NEVER opens print dialog
        doc.save(filename);
        return true;
    } catch (e: any) {
        console.error('Error generating and downloading PDF:', e);
        const errMsg = e?.message || (typeof e === 'string' ? e : 'Unknown error');
        alert(`Could not download PDF file (${errMsg}). Please try again or use the Print button.`);
        return false;
    }
}
