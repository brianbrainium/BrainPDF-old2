# AGENT Instructions

When working in this repository:

- For any new HTML or Markdown pages, use unique filenames to avoid conflicts with other PRs.

## Creating new pages

- HTML pages should be added under a `pages/` directory (create it if missing).
  - Use the naming pattern `page-<n>.html` where `<n>` is the next unused positive integer.
  - Example: if `pages/page-1.html` and `pages/page-2.html` exist, the next file should be `pages/page-3.html`.
- Markdown issue files go in `issues/` and should be named with a date prefix `YYYY-MM-DD-<slug>.md`.

## Tests

- Run `npm test` before submitting a pull request.
