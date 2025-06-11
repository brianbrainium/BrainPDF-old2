import { registerPlugin } from './main.js';

async function ocrPlugin(outputs) {
  if (!('Tesseract' in window)) return;
  for (const output of outputs) {
    const pdfBytes = output.data;
    const srcDoc = await PDFLib.PDFDocument.load(pdfBytes);
    const numPages = srcDoc.getPageCount();
    let text = '';
    for (let i = 0; i < numPages; i++) {
      const [copiedPage] = await srcDoc.copyPages(srcDoc, [i]);
      const imgPdf = await PDFLib.PDFDocument.create();
      imgPdf.addPage(copiedPage);
      const pageBytes = await imgPdf.save();
      const { data: { text: pageText } } = await Tesseract.recognize(pageBytes, 'eng');
      text += pageText + '\n';
    }
    const name = output.name.replace(/\.pdf$/i, '.txt');
    outputs.push({ name, data: new TextEncoder().encode(text) });
  }
}

registerPlugin(ocrPlugin);
