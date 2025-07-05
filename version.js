const NEW_FEATURE = 'Half-page parsing for tests';
(async () => {
  const el = document.getElementById('version-info');
  if (!el) return;
  try {
    const res = await fetch(new URL('./package.json', import.meta.url));
    const { version } = await res.json();
    el.textContent = `Version ${version} – New: ${NEW_FEATURE}`;
  } catch (err) {
    console.error('Failed to load version', err);
  }
})();
