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
                    margin: 5mm 7mm;
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
                    zoom: 1.0 !important;
                }
                .page-2 {
                    page-break-before: auto !important;
                    break-before: auto !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    margin-top: 0 !important;
                    box-shadow: none !important;
                    border: none !important;
                    zoom: 1.0 !important;
                }
                table {
                    border-collapse: collapse !important;
                    width: 100% !important;
                }
                * {
                    box-sizing: border-box !important;
                }

                /* Print Typography Enhancement: Crisp, Larger & Highly-Legible Font Scale */
                #printable-guest-selection {
                    font-size: 13px !important;
                    line-height: 1.45 !important;
                }
                #printable-guest-selection .text-\[11px\] {
                    font-size: 12.5px !important;
                    line-height: 1.35 !important;
                }
                #printable-guest-selection .text-\[10px\] {
                    font-size: 11.5px !important;
                }
                #printable-guest-selection .text-xs {
                    font-size: 13px !important;
                }
                #printable-guest-selection .text-sm {
                    font-size: 14.5px !important;
                }
                #printable-guest-selection .text-base {
                    font-size: 16px !important;
                }
                #printable-guest-selection label span {
                    font-size: 13px !important;
                    font-weight: 600 !important;
                }

                #printable-voucher {
                    font-size: 11.5px !important;
                    line-height: 1.4 !important;
                }
                #printable-voucher .text-\[7px\],
                #printable-voucher .text-\[7\.5px\],
                #printable-voucher .text-\[8px\],
                #printable-voucher .text-\[8\.5px\] {
                    font-size: 10.5px !important;
                    line-height: 1.35 !important;
                }
                #printable-voucher .text-\[9px\],
                #printable-voucher .text-\[9\.5px\] {
                    font-size: 11.5px !important;
                    line-height: 1.4 !important;
                }
                #printable-voucher .text-\[10px\],
                #printable-voucher .text-\[11px\],
                #printable-voucher .text-xs {
                    font-size: 13px !important;
                    line-height: 1.4 !important;
                }
                #printable-voucher .text-sm {
                    font-size: 14.5px !important;
                }
                #printable-voucher .text-base {
                    font-size: 16.5px !important;
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

        // Standard A4 Dimensions in mm: 210mm x 297mm
        const pdfWidth = 210;
        const pdfHeight = 297;
        const marginX = 8;
        const marginY = 8;
        const printWidth = pdfWidth - marginX * 2; // 194mm printable width
        const maxPageHeight = pdfHeight - marginY * 2; // 281mm printable height

        const page1El = sourceEl.querySelector('.page-1') as HTMLElement;
        const page2El = sourceEl.querySelector('.page-2') as HTMLElement;

        const h2cOptions = {
            scale: 2.5, // 240+ DPI crystal-clear print quality without memory blowout
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: '#ffffff',
            width: 794,
            windowWidth: 1024,
            imageTimeout: 15000,
            ignoreElements: (el: Element) =>
                el.classList.contains('print-hidden') || el.classList.contains('no-print'),
            onclone: (_doc: Document, clonedTarget: HTMLElement) => {
                // 1. Sanitize ALL modern CSS color functions (oklch, oklab, lch, lab, color()) to rgb
                sanitizeColorsForHtml2Canvas(_doc);

                // 2. Unconstrain cloned document body and ancestors so modal constraints don't squash layouts
                if (_doc.body) {
                    _doc.body.style.width = '1024px';
                    _doc.body.style.maxWidth = 'none';
                    _doc.body.style.minWidth = '0';
                    _doc.body.style.margin = '0';
                    _doc.body.style.padding = '0';
                    _doc.body.style.overflow = 'visible';
                    _doc.body.style.background = '#ffffff';
                }

                let curr: HTMLElement | null = clonedTarget.parentElement;
                while (curr && curr !== _doc.body) {
                    curr.style.maxWidth = 'none';
                    curr.style.maxHeight = 'none';
                    curr.style.overflow = 'visible';
                    curr.style.transform = 'none';
                    curr.style.position = 'static';
                    curr.style.padding = '0';
                    curr.style.margin = '0';
                    curr = curr.parentElement;
                }

                // 3. Force exact standard A4 width (794px) and pristine container styling
                const pages = _doc.querySelectorAll('.page-1, .page-2');
                if (pages.length > 0) {
                    pages.forEach((p) => {
                        if (p instanceof HTMLElement) {
                            p.style.width = '794px';
                            p.style.minWidth = '794px';
                            p.style.maxWidth = '794px';
                            p.style.boxSizing = 'border-box';
                            p.style.margin = '0';
                            p.style.padding = '18px 22px';
                            p.style.border = '1px solid #cbd5e1';
                            p.style.borderRadius = '0';
                            p.style.boxShadow = 'none';
                            p.style.background = '#ffffff';
                            p.style.overflow = 'visible';
                            p.style.zoom = '1.0';
                        }
                    });
                } else {
                    const root = _doc.getElementById(elementId) || clonedTarget;
                    if (root instanceof HTMLElement) {
                        root.style.width = '794px';
                        root.style.minWidth = '794px';
                        root.style.maxWidth = '794px';
                        root.style.boxSizing = 'border-box';
                        root.style.margin = '0 auto';
                        root.style.padding = '20px';
                        root.style.border = 'none';
                        root.style.boxShadow = 'none';
                        root.style.background = '#ffffff';
                        root.style.overflow = 'visible';
                    }
                }
            },
        };

        const renderSnapshotToDoc = (canvas: HTMLCanvasElement, isNewPage: boolean) => {
            if (isNewPage) {
                doc.addPage('a4', 'portrait');
            }
            const imgData = canvas.toDataURL('image/png');
            const aspect = canvas.height / canvas.width;
            let renderWidth = printWidth;
            let renderHeight = printWidth * aspect;

            // Preserve strict 1:1 aspect ratio: scale down proportionally if height exceeds page
            if (renderHeight > maxPageHeight) {
                const scaleFactor = maxPageHeight / renderHeight;
                renderHeight = maxPageHeight;
                renderWidth = printWidth * scaleFactor;
            }

            // Horizontally center on the A4 page
            const posX = marginX + (printWidth - renderWidth) / 2;
            const posY = marginY;

            doc.addImage(imgData, 'PNG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');
        };

        if (page1El) {
            // Dedicated multi-page dossier export (.page-1 and .page-2)
            const canvas1 = await html2canvas(page1El, h2cOptions);
            renderSnapshotToDoc(canvas1, false);

            if (page2El) {
                const canvas2 = await html2canvas(page2El, h2cOptions);
                renderSnapshotToDoc(canvas2, true);
            }
        } else {
            // Generic single/multi-page element fallback (e.g. GuestMenuSelection)
            const canvas = await html2canvas(sourceEl, h2cOptions);
            const aspect = canvas.height / canvas.width;
            const totalMmHeight = printWidth * aspect;

            if (totalMmHeight <= maxPageHeight) {
                renderSnapshotToDoc(canvas, false);
            } else {
                // Multi-page document: slice canvas page-by-page to avoid distortion or overlap
                const pageCanvasHeightPx = Math.floor((canvas.width * maxPageHeight) / printWidth);
                const totalPages = Math.ceil(canvas.height / pageCanvasHeightPx);

                for (let i = 0; i < totalPages; i++) {
                    if (i > 0) {
                        doc.addPage('a4', 'portrait');
                    }

                    const sliceHeightPx = Math.min(pageCanvasHeightPx, canvas.height - i * pageCanvasHeightPx);
                    const pageCanvas = document.createElement('canvas');
                    pageCanvas.width = canvas.width;
                    pageCanvas.height = sliceHeightPx;

                    const ctx = pageCanvas.getContext('2d');
                    if (ctx) {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
                        ctx.drawImage(
                            canvas,
                            0,
                            i * pageCanvasHeightPx,
                            canvas.width,
                            sliceHeightPx,
                            0,
                            0,
                            canvas.width,
                            sliceHeightPx
                        );
                        const sliceImgData = pageCanvas.toDataURL('image/png');
                        const sliceMmHeight = (sliceHeightPx * printWidth) / canvas.width;
                        doc.addImage(sliceImgData, 'PNG', marginX, marginY, printWidth, sliceMmHeight, undefined, 'FAST');
                    }
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
