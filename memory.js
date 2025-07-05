const fileInput = document.getElementById('mem-file');
const report    = document.getElementById('mem-report');

function formatBytes(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function measureMemory(file) {
  if (!performance.memory) {
    report.textContent = 'performance.memory API not available in this browser.';
    return;
  }
  const before = performance.memory.usedJSHeapSize;
  const arrayBuffer = await file.arrayBuffer();
  const typedarray = new Uint8Array(arrayBuffer);
  const pdfDoc = await pdfjsLib.getDocument({ data: typedarray }).promise;
  const after = performance.memory.usedJSHeapSize;
  const measured = after - before;
  await pdfDoc.destroy();

  const delta = measured > 0 ? measured : file.size;

  const deviceMemGB = navigator.deviceMemory || 0;
  const availMB = deviceMemGB ? deviceMemGB * 1024 : 0;
  const overheadMB = delta / (1024 * 1024);
  const maxUploadMB = availMB
    ? Math.max(availMB - overheadMB, 0).toFixed(2)
    : 'unknown';

  const availStr = availMB ? availMB.toFixed(2) + ' MB' : 'unknown';

  report.textContent =
    `File size: ${formatBytes(file.size)}\n` +
    `Estimated used memory: ${formatBytes(delta)}\n` +
    `Approx. available memory: ${availStr}\n` +
    `Recommended maximum upload: ${maxUploadMB} MB`;
}

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) measureMemory(file);
});
