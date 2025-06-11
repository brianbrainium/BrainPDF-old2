# BrainPDF

BrainPDF is a local‑first toolkit for splitting and exporting large PDF documents right in the browser. It works completely offline as a Progressive Web App (PWA) so your files never leave your machine.

## Features

- **Privacy first** – processing happens entirely in your browser.
- **Memory guardrails** – estimates available memory and warns about oversized uploads.
- **Upload** – drag‑and‑drop or file picker input.
- **Parse** – extracts document metadata and table of contents with a progress bar.
- **Select** – choose sections from an expandable TOC tree.
- **Split** – by number of sections, target chunk size, or selected TOC nodes.
- **Export** – download a single PDF/TXT directly or a ZIP when multiple files are generated with progress feedback.
- **Offline PWA** – installable app with service‑worker‑cached assets.
- **Offline libraries** – caches external libraries and plugins for offline use.
- **Plugin API** – register custom actions such as OCR or summarisation.
- **Built-in OCR plugin** – extract text from scanned PDFs on export.

## Development

Open `index.html` in a modern browser. The service worker will cache assets after the first load so you can use the app offline.

The main logic lives in `main.js`. Plugins can call `registerPlugin(fn)` where `fn` is an async function that receives an array of output objects to modify or add files before export.
