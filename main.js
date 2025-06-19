// ---------- DOM references -------------------------------------------------
let memoryInfo = document.getElementById('memory-info');
if (!memoryInfo) {                     // fallback for older HTML versions
  memoryInfo           = document.createElement('p');
  memoryInfo.id        = 'memory-info';
  memoryInfo.style.fontStyle = 'italic';
  document.body.prepend(memoryInfo);
}

const fileInput      = document.getElementById('file-input');
const dropZone       = document.getElementById('drop-zone');
const progress       = document.getElementById('parse-progress');
const exportProgress = document.getElementById('export-progress');
const tocContainer   = document.getElementById('toc-container');
const exportBtn      = document.getElementById('export-btn');
const splitSections  = document.getElementById('split-sections');
const splitSize      = document.getElementById('split-size');

let pdfDoc;
let toc = [];

// ---------- Memory guardrails ---------------------------------------------
const PARSE_OVERHEAD_MB = 200;          // reserved head-room for parsing
let   maxUploadMB       = null;         // computed at runtime

function updateMemoryInfo () {
  const memGB   = navigator.deviceMemory || 0;     // may be 0/undefined
  const availMB = memGB ? memGB * 1024 : 0;
  maxUploadMB   = availMB ? Math.max(availMB - PARSE_OVERHEAD_MB, 0) : null;

  const availStr = availMB ? `${availMB} MB` : 'unknown';
  const maxStr   = maxUploadMB !== null ? `${maxUploadMB} MB` : 'unknown';
  memoryInfo.textContent =
    `Approx. available memory: ${availStr}. Maximum safe upload: ${maxStr}.`;
}
updateMemoryInfo();
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) updateMemoryInfo();
});

function fitsMemory (file) {
  if (maxUploadMB === null) return true;            // deviceMemory unknown
  const sizeMB = file.size / (1024 * 1024);
  return sizeMB <= maxUploadMB;
}

// Handle file selection
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!fitsMemory(file)) {
    alert(`This file is ${(file.size/1048576).toFixed(1)} MB – above the safe ` +
          `limit of ${maxUploadMB} MB for this device.`);
    e.target.value = '';             // reset picker
    return;
  }
  loadPDF(file);
});

// Drag and drop
['dragenter','dragover'].forEach(ev => dropZone.addEventListener(ev, e => {
  e.preventDefault();
  dropZone.classList.add('dragover');
}));
['dragleave','drop'].forEach(ev => dropZone.addEventListener(ev, e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
}));

dropZone.addEventListener('drop', e => {
  const file = e.dataTransfer.files[0];
  if (!file) return;
  if (!fitsMemory(file)) {
    alert(`Dropped file is ${(file.size/1048576).toFixed(1)} MB – exceeds the ` +
          `safe limit of ${maxUploadMB} MB. Please use a smaller file.`);
    return;
  }
  loadPDF(file);
});

async function loadPDF(file) {
  progress.style.display = 'block';
  progress.value = 0;
  const reader = new FileReader();
  reader.onload = async () => {
    const typedarray = new Uint8Array(reader.result);
    pdfDoc = await pdfjsLib.getDocument({data: typedarray}).promise;
    progress.value = 50;
    await extractTOC();
    progress.value = 100;
    exportBtn.disabled = false;
  };
  reader.readAsArrayBuffer(file);
}

async function extractTOC() {
  tocContainer.innerHTML = '';
  toc = [];
  const outline = await pdfDoc.getOutline();
  if (!outline) {
    tocContainer.textContent = 'No Table of Contents found.';
    return;
  }
  for (let index = 0; index < outline.length; index++) {
    const item = outline[index];
    const div = document.createElement('div');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.dataset.index = index;
    div.appendChild(checkbox);
    div.appendChild(document.createTextNode(' ' + item.title));
    tocContainer.appendChild(div);
    let pageIndex = 0;
    try {
      const dest = await pdfDoc.getDestination(item.dest);
      if (dest) {
        pageIndex = await pdfDoc.getPageIndex(dest[0]);
      }
    } catch {}
    toc.push({ title: item.title, pageIndex });
  }
}

// Simple plugin system
const plugins = [];
export function registerPlugin(fn) {
  plugins.push(fn);
}

async function runPlugins(pages) {
  for (const plugin of plugins) {
    await plugin(pages);
  }
}

// Split and export
exportBtn.addEventListener('click', async () => {
  const sections = parseInt(splitSections.value, 10);
  const sizeMB = parseInt(splitSize.value, 10);
  const selectedIndexes = [...tocContainer.querySelectorAll('input[type=checkbox]:checked')].map(cb => parseInt(cb.dataset.index, 10));

  const pdfData = await pdfDoc.getData();
  const zip = new JSZip();

  exportProgress.style.display = 'block';
  exportProgress.value = 0;

  const outputs = [];
  const srcDoc = await PDFLib.PDFDocument.load(pdfData);
  const targets = selectedIndexes.length ? selectedIndexes : [0];
  for (let idx = 0; idx < targets.length; idx++) {
    const i = targets[idx];
    const start = toc[i].pageIndex;
    const end = i + 1 < toc.length ? toc[i + 1].pageIndex : srcDoc.getPageCount();
    const newPdf = await PDFLib.PDFDocument.create();
    const pages = await newPdf.copyPages(srcDoc, Array.from({length: end - start}, (_, p) => start + p));
    pages.forEach(p => newPdf.addPage(p));
    const bytes = await newPdf.save();
    const name = toc[i].title.replace(/\s+/g, '_') + '.pdf';
    outputs.push({ name, data: bytes });
    exportProgress.value = ((idx + 1) / targets.length) * 100;
  }

  await runPlugins(outputs);

  if (outputs.length === 1) {
    downloadFile(outputs[0].data, outputs[0].name, 'application/pdf');
  } else {
    for (const out of outputs) {
      zip.file(out.name, out.data);
    }
    const blob = await zip.generateAsync({type:'blob'});
    downloadFile(blob, 'export.zip', 'application/zip');
  }

  exportProgress.style.display = 'none';
});

function downloadFile(data, filename, mime) {
  const url = URL.createObjectURL(new Blob([data], {type: mime}));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js');
  });
}
