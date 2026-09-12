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
 * Downloads a DOM element as a high-quality PDF using native jsPDF + html2canvas.
 * Guarantees direct .pdf file download and strictly avoids opening the browser print dialog.
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
        const { jsPDF } = await import('jspdf');
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

        if (page1El) {
            // Dedicated multi-page dossier export (.page-1 and .page-2)
            const canvas1 = await html2canvas(page1El, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1024,
            });

            const imgData1 = canvas1.toDataURL('image/jpeg', 0.96);
            const imgHeight1 = (canvas1.height * printWidth) / canvas1.width;
            doc.addImage(imgData1, 'JPEG', marginX, marginY, printWidth, Math.min(imgHeight1, maxPageHeight));

            if (page2El) {
                doc.addPage('a4', 'portrait');
                const canvas2 = await html2canvas(page2El, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    windowWidth: 1024,
                });

                const imgData2 = canvas2.toDataURL('image/jpeg', 0.96);
                const imgHeight2 = (canvas2.height * printWidth) / canvas2.width;
                doc.addImage(imgData2, 'JPEG', marginX, marginY, printWidth, Math.min(imgHeight2, maxPageHeight));
            }
        } else {
            // Generic single/multi-page element fallback (e.g. GuestMenuSelection)
            const canvas = await html2canvas(sourceEl, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1024,
            });

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
    } catch (e) {
        console.error('Error generating and downloading PDF:', e);
        alert('Could not download PDF file. Please try again or use the Print button.');
        return false;
    }
}
