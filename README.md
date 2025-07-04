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
- **Half-page parsing helper** – load only the first half of a PDF for tests.
- **Memory usage test page** – measure processing memory to refine upload limits.

## Development

Open `index.html` in a modern browser. The service worker will cache assets after the first load so you can use the app offline.

The main logic lives in `main.js`. Plugins can call `registerPlugin(fn)` where `fn` is an async function that receives an array of output objects to modify or add files before export.

To estimate how much memory your device uses when opening a PDF, open `memory.html`. After selecting a test document the page will display the memory consumed during parsing and the recommended maximum upload size.

## Developer / QA tips
### Force a tiny upload limit
When testing the oversize-file guardrail on machines with plenty of RAM, add
`?maxUploadMB=<number>` to the URL, e.g.  
`https://brianbrainium.github.io/BrainPDF/?maxUploadMB=10`  
The banner will show "(debug override)", and uploads above that value will be
rejected. Remove the query string to return to automatic detection.

## Version

Current version: **1.0.0**. The latest update introduces a helper that parses
only the first half of pages from a PDF for testing purposes.

### Testing the new feature

Run `npm test` to execute the included Node script which verifies the half-page
parsing helper.
