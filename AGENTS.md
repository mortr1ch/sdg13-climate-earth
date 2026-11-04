# Notes for coding agents (Codex etc.)

A static website, with no build step and no package manager. Open `index.html` directly or serve the folder with `python3 -m http.server`.

## Rules that keep it working

- **It must keep working when opened from disk (`file://`).** So:
  - Use classic `<script src>` tags only. No ES modules, no `import`, no `fetch()` of local files.
  - Images used as WebGL textures must stay embedded as data URIs (`js/textures.js`). Loading `.jpg` files from disk breaks in Chrome under `file://`.
- three.js is pinned to **r149** (`lib/three.min.js`, the global `THREE`). Don't upgrade it: r160+ removed the non-module build.
- Keep facts sourced. Every country entry in `js/data.js` has a `sources` string, and every presentation figure in `js/presentation.js` names its source. Don't invent statistics.

## Where to change things

- **Country facts:** `window.COUNTRIES` in `js/data.js`. Array order = guided-tour order.
  - `match` must equal the country name in the Natural Earth data (`js/world.js`), e.g. `"United States of America"`.
  - Use `stats: [...]` for two headline numbers and `group` on issues for section headings (see Uzbekistan).
- **Hazard types and colours:** `window.HAZARDS` in `js/data.js`. Icons are in `ICONS` in `js/app.js`.
- **Presentation chapters:** `CHAPTERS` (intro first; chapters 1–4 use per-step `cfg` and render functions), `RECS` and `PHOTOS` in `js/presentation.js`. Intro markup is `#intro` in `index.html`; SDG icons are in `img/`.
- **Styling:** `css/style.css`. Colours are CSS variables on `:root`.
- **Globe rendering:** `js/globe.js`.
  - Public API: `Globe.flyTo(place, { pin })`, `Globe.highlight(names, color)`, `Globe.goHome()`, `Globe.setLayer(name, on)`, `Globe.chapterMode`.

## Checking changes

Open the page and check the browser console for errors. Then:
- Press `Space` to run the tour.
- Press `1`–`5` to open the presentation chapters.
- Zoom into a country to see its panel.
