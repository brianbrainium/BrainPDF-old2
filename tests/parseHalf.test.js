const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const { extractHalf } = require('../parseHalf');

(async () => {
  const data = fs.readFileSync('testPDF.pdf');
  const doc = await PDFDocument.load(data);
  const total = doc.getPageCount();
  const halfBytes = await extractHalf(data);
  const halfDoc = await PDFDocument.load(halfBytes);
  const halfPages = halfDoc.getPageCount();
  if (halfPages !== Math.ceil(total / 2)) {
    console.error(`Expected ${Math.ceil(total / 2)} pages, got ${halfPages}`);
    process.exit(1);
  }
  console.log('parseHalf test passed.');
})();
