const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

/**
 * Extract the first half of pages from a PDF file.
 * @param {Uint8Array|Buffer} pdfBytes - The PDF file bytes.
 * @returns {Promise<Uint8Array>} Bytes of the half-page PDF.
 */
async function extractHalf(pdfBytes) {
  const doc = await PDFDocument.load(pdfBytes);
  const total = doc.getPageCount();
  const halfCount = Math.ceil(total / 2);
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(doc, Array.from({ length: halfCount }, (_, i) => i));
  pages.forEach(p => newPdf.addPage(p));
  return await newPdf.save();
}

module.exports = { extractHalf };
