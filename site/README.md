# Portfolio site

A single-page presentation of the eight projects, with no build step and no dependencies.

```
site/
├── index.html      shell and section structure
├── styles.css      all styling (dark/light, responsive, print, reduced motion)
├── portfolio.js    all content + rendering
└── README.md       this file
```

## Run locally

From the repository root:

```bash
python3 -m http.server 8000
# open http://localhost:8000/site/
```

Opening `site/index.html` directly from disk also works — the content is a plain script file, not a `fetch()` call, so there is no CORS problem.

## Editing content

All copy lives in the `PORTFOLIO` object at the top of `portfolio.js`:

| Key | What it drives |
|-----|----------------|
| `repo` / `branch` | "Read project" links, GitHub buttons |
| `projects[]` | Cards: number, title, tags, scenario, decision, evidence list, `dir` (used to build the source link) |
| `skills[]` | Competency → where demonstrated → inspectable artefact |
| `ladder[]` | "How the work is judged" questions |
| `bridge` | Dependency chain, five-proofs table, ten matrix rows, four myths |

Add a project by appending an object to `projects[]` with a matching `dir` — no HTML edits required.

## Hosting

Any static host works. For GitHub Pages, point the Pages source at the repository root and open `/site/`, or copy the three files to a `gh-pages` branch root.

## Notes on the design

- No external fonts, images, or trackers — the page loads in one request per file and works offline.
- Theme follows the OS preference and remembers an explicit choice in `localStorage`.
- Cards are keyboard-operable (`aria-expanded` on the toggle) and fully visible when printing to PDF.
- `prefers-reduced-motion` is respected.
