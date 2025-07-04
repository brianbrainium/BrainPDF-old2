const fs = require('fs');
(async () => {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(fs.readFileSync('testPDF.pdf'));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDoc = await loadingTask.promise;
  const outline = await pdfDoc.getOutline();
  if (!outline || outline.length === 0) {
    console.error('No table of contents found in PDF');
    process.exit(1);
  }
  console.log(`tocViewer test passed. entries: ${outline.length}`);
})();
