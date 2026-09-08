import { PaperSheetPreset } from '../types';

/**
 * Robust cross-browser label print execution helper.
 * Opens the native operating system / browser printer dialog with all available printers.
 */
export function triggerPrintLabels(
  printableContainerId: string = 'printable-labels-area',
  preset?: PaperSheetPreset
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const sourceElement = document.getElementById(printableContainerId);

      if (!sourceElement) {
        // Fallback to direct window.print()
        window.focus();
        window.print();
        resolve(true);
        return;
      }

      // Collect all active stylesheets and font declarations
      const styleElements = document.querySelectorAll('style, link[rel="stylesheet"]');
      let stylesHtml = '';
      styleElements.forEach((el) => {
        stylesHtml += el.outerHTML;
      });

      // Page size specification based on preset
      const widthMm = preset?.paperWidthMm || 210;
      const heightMm = preset?.paperHeightMm || 297;
      const isRoll = preset?.category === 'termica_bobina';

      const printSpecificCss = `
        <style>
          @page {
            size: ${widthMm}mm ${heightMm}mm;
            margin: 0mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            width: ${widthMm}mm !important;
            min-height: ${heightMm}mm !important;
          }
          .page-break {
            page-break-before: always !important;
            break-before: page !important;
            clear: both;
            display: block;
            height: 0;
          }
          .print-label-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: inline-block !important;
            vertical-align: top !important;
          }
          .print-sheet-wrapper {
            width: ${widthMm}mm !important;
            min-height: ${heightMm}mm !important;
            padding-top: ${preset?.marginTopMm || 0}mm !important;
            padding-bottom: ${preset?.marginBottomMm || 0}mm !important;
            padding-left: ${preset?.marginLeftMm || 0}mm !important;
            padding-right: ${preset?.marginRightMm || 0}mm !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            page-break-after: ${isRoll ? 'always' : 'auto'};
            break-after: ${isRoll ? 'page' : 'auto'};
          }
        </style>
      `;

      // Remove any previously created print iframe
      const oldFrame = document.getElementById('label-print-frame');
      if (oldFrame) {
        oldFrame.remove();
      }

      // Create an invisible iframe for direct printing
      const iframe = document.createElement('iframe');
      iframe.id = 'label-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';

      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        window.focus();
        window.print();
        resolve(true);
        return;
      }

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
          <head>
            <meta charset="utf-8" />
            <title>Imprimir Etiquetas</title>
            ${stylesHtml}
            ${printSpecificCss}
          </head>
          <body>
            ${sourceElement.innerHTML}
          </body>
        </html>
      `);
      iframeDoc.close();

      // Wait briefly for CSS/fonts to render inside the iframe before opening the printer dialog
      const executePrint = () => {
        try {
          if (iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            resolve(true);
          } else {
            window.focus();
            window.print();
            resolve(true);
          }
        } catch (e) {
          // If sandboxed or iframe print is blocked, fallback to window.print()
          window.focus();
          window.print();
          resolve(true);
        }
      };

      // Ensure styles and images are loaded
      if (iframeDoc.readyState === 'complete') {
        setTimeout(executePrint, 250);
      } else {
        iframe.onload = () => {
          setTimeout(executePrint, 250);
        };
      }
    } catch (err) {
      console.warn('Erro ao disparar impressão via iframe, usando fallback:', err);
      window.focus();
      window.print();
      resolve(false);
    }
  });
}
