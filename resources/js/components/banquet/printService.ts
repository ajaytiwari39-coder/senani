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
        console.warn(`Print error: Element with ID #${elementId} not found.`);
        window.print();
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
        window.print();
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
                    margin: 8mm 8mm 8mm 8mm;
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
                .print-hidden, .no-print {
                    display: none !important;
                }
                .print-avoid-break {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                .page-1 {
                    page-break-after: always !important;
                    break-after: page !important;
                }
                .page-2 {
                    page-break-before: always !important;
                    break-before: page !important;
                }
                .pdf-page-break {
                    page-break-before: always !important;
                    break-before: page !important;
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
            <div style="width: 100%; max-width: 100%; margin: 0 auto; padding: 4px;">
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
            console.error('Error invoking iframe print, falling back to window.print():', err);
            window.print();
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
 * Downloads a DOM element as a high-quality PDF using html2pdf.js.
 */
export async function downloadElementAsPdf(
    elementId: string,
    filename: string = 'Senani-Banquet-Voucher.pdf'
): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const sourceEl = document.getElementById(elementId);
    if (!sourceEl) {
        console.warn(`PDF error: Element with ID #${elementId} not found.`);
        return false;
    }

    try {
        // Dynamically import html2pdf in client context
        const html2pdfModule = await import('html2pdf.js');
        const html2pdf = (html2pdfModule as any).default || html2pdfModule;

        // Clone element to avoid mutating live view
        const clone = sourceEl.cloneNode(true) as HTMLElement;
        clone.style.width = '794px'; // standard A4 width in pixels at 96 DPI
        clone.style.margin = '0 auto';
        clone.style.background = '#ffffff';
        clone.style.color = '#000000';

        // Remove elements marked print-hidden
        clone.querySelectorAll('.print-hidden, .no-print').forEach((el) => el.remove());

        const opt = {
            margin: [8, 8, 8, 8],
            filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                scrollX: 0,
                scrollY: 0,
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        };

        await html2pdf().set(opt).from(clone).save();
        return true;
    } catch (e) {
        console.error('Error downloading PDF via html2pdf:', e);
        // Fallback to browser print if library fails
        printElement(elementId, filename.replace('.pdf', ''));
        return false;
    }
}
