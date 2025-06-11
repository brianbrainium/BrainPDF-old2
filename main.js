const memoryInfo = document.getElementById('memory-info');
const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const progress = document.getElementById('parse-progress');
const tocContainer = document.getElementById('toc-container');
const exportBtn = document.getElementById('export-btn');
const splitSections = document.getElementById('split-sections');
const splitSize = document.getElementById('split-size');

let pdfDoc;
let toc = [];

// Memory detection
function updateMemoryInfo() {
  const mem = navigator.deviceMemory || 0; // approximate in GB
  const avail = mem ? mem * 1024 : 0; // convert to MB
  const parseOverhead = 200; // MB reserved for parsing
  const maxUpload = avail ? Math.max(avail - parseOverhead, 0) : 'unknown';
  memoryInfo.textContent = `Approx. available memory: ${avail} MB. Maximum safe upload: ${maxUpload} MB.`;
}
updateMemoryInfo();

// Handle file selection
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    loadPDF(file);
  }
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
  if (file) loadPDF(file);
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
  outline.forEach((item, index) => {
    const div = document.createElement('div');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.dataset.index = index;
    div.appendChild(checkbox);
    div.appendChild(document.createTextNode(' ' + item.title));
    tocContainer.appendChild(div);
    toc.push(item);
  });
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

  // Simple strategy: if multiple selected => zip, else direct
  const outputs = [];
  if (selectedIndexes.length) {
    for (const i of selectedIndexes) {
      const name = toc[i].title.replace(/\s+/g, '_') + '.pdf';
      zip.file(name, pdfData); // placeholder: real splitting not implemented
      outputs.push({name, data: pdfData});
    }
  } else {
    const name = 'document.pdf';
    outputs.push({name, data: pdfData});
  }

  await runPlugins(outputs);

  if (outputs.length === 1) {
    downloadFile(outputs[0].data, outputs[0].name, 'application/pdf');
  } else {
    const blob = await zip.generateAsync({type:'blob'});
    downloadFile(blob, 'export.zip', 'application/zip');
  }
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
