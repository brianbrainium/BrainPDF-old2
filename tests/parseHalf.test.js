const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const { extractHalves } = require('../parseHalf');

(async () => {
  const data = fs.readFileSync('testPDF.pdf');
  const doc = await PDFDocument.load(data);
  const total = doc.getPageCount();
  const { first, second } = await extractHalves(data);
  const firstDoc = await PDFDocument.load(first);
  const secondDoc = await PDFDocument.load(second);
  const half = Math.ceil(total / 2);
  if (firstDoc.getPageCount() !== half) {
    console.error(`Expected first half to have ${half} pages, got ${firstDoc.getPageCount()}`);
    process.exit(1);
  }
  if (secondDoc.getPageCount() !== total - half) {
    console.error(`Expected second half to have ${total - half} pages, got ${secondDoc.getPageCount()}`);
    process.exit(1);
  }
  console.log('parseHalves test passed.');
})();
