# Dhairya Sharma — personal portfolio

A lightweight, static portfolio connecting AI evaluation, data operations and practical software delivery with live demonstrations and documented case studies.

## What is included

- Professional introduction and experience summary grounded in Dhairya's supplied work history.
- A three-service Delivery Lab: chatbot QA, responsive landing pages and technical SEO audits, each linked to the relevant existing Fiverr offer.
- Interactive authored QA comparisons, genuine desktop/mobile screenshots and filterable fictional SEO findings.
- A local-only brief builder with preview, copy, text download and stale-draft invalidation. Nothing is submitted or stored by the page.
- Live links to Fieldwork, its Planning Lab, Fieldnote Studio and the Python LLM Evaluation Lab.
- Actual project screenshots, not fabricated client work.
- Contact through existing public LinkedIn and Fiverr profiles.
- Responsive navigation, keyboard handling, reduced-motion support and descriptive image text.

The portfolio projects are independent, AI-assisted demonstrations. Their examples are fictional; the Planning Lab is rules-based, not a live AI agent. No employer source code or client records are included. The evaluation examples and scores are authored synthetic material, not measured model performance. The issue sheet is illustrative: no live website crawling or SEO measurement occurs. Prices and delivery commitments are not invented; buyers are directed to Fiverr to confirm current packages and agree scope. Fiverr-originated conversations and payments should remain on Fiverr.

## Run locally

This site uses plain HTML, CSS and a small browser JavaScript module. There are no production dependencies or build steps. Serve this directory with any static HTTP server. For example, with Python installed:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. Check desktop and mobile layouts, navigation, image loading, project links and Escape-to-close behaviour.

Run the dependency-free checks with `node --test services.test.mjs`. They cover offer boundaries, safe default selections, critical-failure precedence, example arithmetic, priority filters and brief generation. Browser checks also cover interaction state, text rendering, copied output, screenshots and responsive layout. These checks are not a security or accessibility certification.

## Publishing

GitHub Pages serves the `main` branch at the repository root. `.nojekyll` keeps the authored assets as static files. Upload only these twelve files: `index.html`, `styles.css`, `site.js`, `services.mjs`, `services.test.mjs`, `fieldwork.png`, `planning-lab.png`, `fieldnote.png`, `fieldnote-mobile.png`, `.nojekyll`, `.gitignore` and this README.

No analytics, form submissions, application storage, external fonts or paid services are implemented. The brief's text remains in page memory until navigation/reload or reset; explicit copy writes to the user's clipboard and explicit download saves a local file. Clipboard failure exposes a manual-copy fallback. The host can log connection information; external links follow their destination's privacy practices. No private phone number, email address, home address or résumé is published. Client material must not be entered into examples; permission and an appropriate processing arrangement are required for real work.

AI-assisted drafting and implementation are disclosed. No open-source license has been selected; public visibility alone does not grant reuse rights.
