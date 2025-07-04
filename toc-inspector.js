const fileInput = document.getElementById('file-input');
const dropZone  = document.getElementById('drop-zone');
const result    = document.getElementById('result');
const progress  = document.getElementById('parse-progress');

function handleFile(file) {
  if (!file) return;
  progress.style.display = 'block';
  progress.value = 0;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const typedarray = new Uint8Array(reader.result);
      const pdfDoc = await pdfjsLib.getDocument({ data: typedarray }).promise;
      progress.value = 50;
      const outline = await pdfDoc.getOutline();
      progress.value = 100;
      if (!outline) {
        result.textContent = 'No Table of Contents found.';
      } else {
        const ul = document.createElement('ul');
        outline.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item.title;
          ul.appendChild(li);
        });
        result.innerHTML = '<strong>TOC detected:</strong>';
        result.appendChild(ul);
      }
    } catch (err) {
      result.textContent = 'Error parsing PDF: ' + err.message;
    } finally {
      progress.style.display = 'none';
    }
  };
  reader.readAsArrayBuffer(file);
}

fileInput.addEventListener('change', e => handleFile(e.target.files[0]));

['dragenter','dragover'].forEach(ev => dropZone.addEventListener(ev, e => {
  e.preventDefault();
  dropZone.classList.add('dragover');
}));
['dragleave','drop'].forEach(ev => dropZone.addEventListener(ev, e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
}));

dropZone.addEventListener('drop', e => handleFile(e.dataTransfer.files[0]));

