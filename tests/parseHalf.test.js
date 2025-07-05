const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const { splitByPageCount } = require('../parseHalf');

(async () => {
  const data = fs.readFileSync('testPDF.pdf');
  const doc = await PDFDocument.load(data);
  const total = doc.getPageCount();
  const chunks = await splitByPageCount(data, 100);
  let sum = 0;
  for (const chunk of chunks) {
    const docChunk = await PDFDocument.load(chunk);
    const pages = docChunk.getPageCount();
    if (pages > 100) {
      console.error(`Chunk exceeds limit: ${pages} pages`);
      process.exit(1);
    }
    sum += pages;
  }
  if (sum !== total) {
    console.error(`Expected ${total} total pages from chunks, got ${sum}`);
    process.exit(1);
  }
  console.log('splitByPageCount test passed.');
})();
