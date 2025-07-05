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

/**
 * Split a PDF file into two halves.
 * @param {Uint8Array|Buffer} pdfBytes - The PDF file bytes.
 * @returns {Promise<{first: Uint8Array, second: Uint8Array}>} Bytes for each half.
 */
async function extractHalves(pdfBytes) {
  const doc = await PDFDocument.load(pdfBytes);
  const total = doc.getPageCount();
  const halfCount = Math.ceil(total / 2);

  const firstPdf = await PDFDocument.create();
  const firstPages = await firstPdf.copyPages(doc, Array.from({ length: halfCount }, (_, i) => i));
  firstPages.forEach(p => firstPdf.addPage(p));

  const secondPdf = await PDFDocument.create();
  const secondPages = await secondPdf.copyPages(doc, Array.from({ length: total - halfCount }, (_, i) => i + halfCount));
  secondPages.forEach(p => secondPdf.addPage(p));

  return {
    first: await firstPdf.save(),
    second: await secondPdf.save(),
  };
}

/**
 * Split a PDF file into chunks with a maximum number of pages per chunk.
 * @param {Uint8Array|Buffer} pdfBytes - The PDF file bytes.
 * @param {number} limit - Maximum pages per chunk.
 * @returns {Promise<Uint8Array[]>} Array of PDF bytes for each chunk.
 */
async function splitByPageCount(pdfBytes, limit) {
  const doc = await PDFDocument.load(pdfBytes);
  const total = doc.getPageCount();
  const chunks = [];
  for (let i = 0; i < total; i += limit) {
    const count = Math.min(limit, total - i);
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(doc, Array.from({ length: count }, (_, j) => i + j));
    pages.forEach(p => newPdf.addPage(p));
    chunks.push(await newPdf.save());
  }
  return chunks;
}

module.exports = { extractHalf, extractHalves, splitByPageCount };
