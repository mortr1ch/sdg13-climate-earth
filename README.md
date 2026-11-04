# Earth in Crisis — SDG 13 Climate Action

An interactive 3D Earth for an SDG 13 (Climate Action) group presentation. The planet rotates in real time with NASA imagery, a warming map, wildfires and cyclones. Zoom close to a country and a panel shows how climate change is hitting it. A built-in presentation mode follows the course's student guidelines; the interactive globe itself is the engaging element.

**Live site:** https://akmal-ui.github.io/sdg13-climate-earth/

## How to open

Open the live site above, or download the repo and double-click `index.html`. It works in Chrome, Edge, Safari and Firefox with no server, no install and no internet. Internet only adds the nicer web fonts.

To serve it locally instead:

```bash
python3 -m http.server 8613
```

Then open http://localhost:8613.

## Presentation chapters (buttons at the top)

| Key | Chapter |
|---|---|
| `I` | Intro — SDG 13 title, targets and a Guterres quote; the site opens here. Next zooms through the title to the globe |
| `1` | Global Progress Snapshot — "Are we on track globally?" + six photos (click to enlarge) |
| `2` | Uzbekistan's Context — heat, water scarcity, air pollution & dust, the awareness → action gap, and the national response |
| `3` | Best Practices — overview, Green Riyadh (heat → greening), UN ActNow with South Korea's Carbon Neutral Points (awareness → citizen action), lessons. Photos on the right (your files in `photos/` first, then Wikipedia / Wikimedia Commons) |
| `4` | Adaptation to Uzbekistan — adapt the Riyadh principle, Yashil AI, can it work (enablers vs barriers), our team's role, ActNow → Uzbekistan, one system |
| `5` | Project: EcoPulse — flight through the clouds into Uzbekistan, then a full-screen page about our EcoPulse website that scrolls by itself (Space = pause / resume) |
| — | Thank you — QR codes for this presentation and for EcoPulse |
| `←` / `→` | Step through slides and chapters |
| `0` / `Esc` | Close the chapter and explore freely (Esc first closes an enlarged photo) |

## Exploring the globe

| Key | Action |
|---|---|
| `Space` | Start / pause the guided tour (country to country, Uzbekistan first) |
| `←` / `→` | Previous / next country |
| Scroll / pinch | Zoom. Get close to a glowing marker and its climate panel opens |
| Click a marker | Fly to that country |
| `H` | Warming map on/off |
| `W` / `S` / `C` | Wildfires / cyclones / clouds |
| `L` | Labels and borders |
| `N` | Real-time day and night |
| `R` | Back to the whole planet |
| `F` | Fullscreen |

## Project structure

```
index.html            page layout
css/style.css         all styling
js/data.js            country climate facts (43 hotspots) — edit to add or change countries
js/presentation.js    intro, the five chapters, EcoPulse project page, thank-you page with QR codes, photos
lib/qrcode.js         QR code generator (Kazuhiko Arase, MIT)
js/app.js             interface: country panel, vital signs, warming stripes, tour, controls
js/globe.js           3D Earth renderer (three.js): shaders, markers, borders, camera
js/records.js         NASA GISTEMP temperatures and NOAA CO₂ (real data)
js/textures.js        Earth images embedded as data URIs (so it works from file://)
js/world.js           country borders (Natural Earth via world-atlas)
lib/                  three.js r149 and topojson-client
```

## Data and credits

- Earth imagery: NASA Blue Marble and Black Marble, via the three.js and three-globe examples
- Temperature stripes: NASA GISS GISTEMP v4, 1880–2025
- CO₂: NOAA Global Monitoring Laboratory, Mauna Loa annual mean
- Country borders: Natural Earth 1:50m, via world-atlas
- Every country fact and presentation figure lists its source on screen
- The warming map and the fire and cyclone positions are illustrative patterns based on NASA GISTEMP and NASA FIRMS, not a live feed
- Libraries: [three.js](https://threejs.org) (MIT), [topojson-client](https://github.com/topojson/topojson-client) (ISC)

## Publish on GitHub Pages (get a link + QR code)

1. On github.com create a **public** repository (or open the existing one).
2. **Add file → Upload files**, and drag in everything *inside* this folder (`index.html`, `css`, `js`, `lib`, `img`, `photos`, …), not the folder itself. Commit.
3. **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`, Save.
4. After 1–2 minutes the site is live at `https://<your-username>.github.io/<repository-name>/`.

The QR code on the Thank-you page uses the page's own address automatically when it is opened online. `PRESENTATION_URL` at the top of `js/presentation.js` is only the fallback for when the page is opened from disk.
