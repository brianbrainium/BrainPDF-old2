const fs = require('fs');
const pdf = require('pdf-parse');

(async () => {
  const data = fs.readFileSync('testPDF.pdf');
  const result = await pdf(data);
  if (!result.text || !result.text.trim()) {
    console.error('No text extracted from PDF');
    process.exit(1);
  }
  console.log('pdfToText test passed.');
})();
