/* UI: country panel, planet vital signs, warming stripes, guided tour, controls. */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const COUNTRIES = window.COUNTRIES, HAZARDS = window.HAZARDS, STATS = window.GLOBAL_STATS;
  const REC = window.CLIMATE_RECORDS;
  const TOUR_DWELL = 11000;

  const ICONS = {
    heat: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>',
    flood: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
    sea: '<path d="M12 3v9M8 7l4-4 4 4M2 17c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
    fire: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    drought: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    storm: '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2"/>',
    ice: '<path d="M12 2v20M4.9 7l14.2 10M4.9 17L19.1 7M9 4l3 2 3-2M9 20l3-2 3 2M3.5 10.5l3.4.5-1.4 3M20.5 10.5l-3.4.5 1.4 3"/>',
    air: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M7 18h1M12 18h1M17 18h1"/>'
  };
  const icon = type => `<svg viewBox="0 0 24 24">${ICONS[type]}</svg>`;

  /* ---------------- vital signs ---------------- */

  const lastCo2 = REC.co2[REC.co2.length - 1];
  const lastT = REC.temps[REC.temps.length - 1];
  $('v-warming').textContent = STATS.warming.value;
  $('v-warming-l').textContent = STATS.warming.label;
  $('v-co2').textContent = lastCo2[1].toFixed(1) + ' ppm';
  $('v-co2-l').textContent = `CO₂ in ${lastCo2[0]} — highest in 800,000+ years (NOAA)`;
  $('v-sea').textContent = STATS.sea.value;
  $('v-sea-l').textContent = STATS.sea.label;
  $('v-arctic').textContent = STATS.arctic.value;
  $('v-arctic-l').textContent = STATS.arctic.label;

  const t0 = performance.now();
  const fmt = n => Math.floor(n).toLocaleString('en-US');
  setInterval(() => {
    const s = (performance.now() - t0) / 1000;
    $('c-co2').textContent = fmt(s * STATS.co2PerSec);
    $('c-ice').textContent = fmt(s * STATS.icePerSec);
    $('c-forest').textContent = (s * STATS.forestPerSec).toFixed(1);
  }, 80);

  // Warming stripes (Ed Hawkins style) from real NASA GISTEMP annual means
  (function stripes() {
    const pal = ['#08306b', '#08519c', '#2171b5', '#4292c6', '#6baed6', '#9ecae1', '#c6dbef', '#deebf7',
      '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'];
    const ref = REC.temps.filter(([y]) => y >= 1971 && y <= 2000);
    const mean = ref.reduce((a, [, v]) => a + v, 0) / ref.length;
    const range = 0.9;
    const box = $('stripes');
    const out = $('stripes-readout');
    $('stripes-end').textContent = lastT[0];
    for (const [y, v] of REC.temps) {
      const i = Math.max(0, Math.min(pal.length - 1, Math.floor(((v - mean) / range + 1) / 2 * pal.length)));
      const el = document.createElement('i');
      el.style.background = pal[i];
      el.addEventListener('mouseenter', () => {
        out.innerHTML = `<b>${y}</b> · ${v >= 0 ? '+' : ''}${v.toFixed(2)}°C vs 1951–1980 average`;
      });
      box.appendChild(el);
    }
    box.addEventListener('mouseleave', () => {
      out.innerHTML = `<b>${lastT[0]}</b> · +${lastT[1].toFixed(2)}°C vs 1951–1980 · each stripe = 1 year`;
    });
    box.dispatchEvent(new Event('mouseleave'));
  })();

  /* ---------------- labels ---------------- */

  const labelLayer = $('labels');
  const labels = COUNTRIES.map(c => {
    const el = document.createElement('div');
    el.className = 'label';
    el.textContent = c.name;
    el.style.opacity = 0;
    labelLayer.appendChild(el);
    return { c, el, pos: Globe.latLonToVec3(c.lat, c.lon, 1.004), normal: Globe.latLonToVec3(c.lat, c.lon, 1), op: -1 };
  });

  function updateLabels(g) {
    const show = g.layers.labels;
    // fade in quickly, then stay fully opaque so names are easy to read
    const zoomVis = Math.max(0, Math.min(1, (3.9 - g.view.dist) / 0.35));
    for (const L of labels) {
      const facing = g.facing(L.normal);
      const op = show ? zoomVis * Math.max(0, Math.min(1, (facing - 0.1) / 0.08)) : 0;
      if (op < 0.01) { if (L.op !== 0) { L.el.style.opacity = 0; L.op = 0; } continue; }
      const s = g.screenOf(L.pos);
      L.el.style.transform = `translate3d(${(s.x + 12).toFixed(1)}px, ${(s.y - 12).toFixed(1)}px, 0)`;
      if (Math.abs(op - L.op) > 0.01) { L.el.style.opacity = op.toFixed(2); L.op = op; }
      L.el.classList.toggle('active', g.focus === L.c);
    }
  }

  /* ---------------- panel ---------------- */

  const panel = $('panel');
  function renderPanel(c) {
    const hz = HAZARDS[c.hazard];
    $('p-flag').textContent = c.flag;
    $('p-name').textContent = c.name;
    $('p-meta').textContent = c.region;
    const risk = $('p-risk');
    risk.textContent = `${c.risk} risk`;
    risk.dataset.level = c.risk;
    $('p-hazard').innerHTML = `<i style="background:${hz.color}"></i>${hz.label}`;
    $('p-headline').textContent = c.headline;
    const stats = c.stats || [c.stat];
    $('p-stats').classList.toggle('two', stats.length > 1);
    $('p-stats').innerHTML = stats.map(s => `
      <div class="big-stat"><span class="bs-val">${s.value}</span><span class="bs-lbl">${s.label}</span></div>`).join('');
    // issues may be split into named groups (e.g. "Air pollution", "Climate impacts")
    const grouped = c.issues.some(i => i.group);
    $('p-issues-title').hidden = grouped;
    let group = null;
    $('p-issues').innerHTML = c.issues.map(i => {
      const head = grouped && i.group !== group ? `<li class="issue-group">${(group = i.group)}</li>` : '';
      return head + `
      <li>
        <span class="issue-icon" style="--c:${HAZARDS[i.type].color}">${icon(i.type)}</span>
        <div><h3>${i.title}</h3><p>${i.text}</p></div>
      </li>`;
    }).join('');
    $('p-action').textContent = c.action;
    $('p-sources').textContent = 'Sources: ' + c.sources;
    panel.scrollTop = 0;
    panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
  }

  function onFocus(c) {
    if (Globe.chapterMode) { panel.classList.remove('show'); document.body.classList.remove('focused'); return; }
    if (c) {
      renderPanel(c);
      panel.classList.add('show');
      document.body.classList.add('focused');
      Globe.setPanelShift(window.innerWidth > 760 ? 210 : 0);
      tourIndex = COUNTRIES.indexOf(c);
    } else {
      panel.classList.remove('show');
      document.body.classList.remove('focused');
      Globe.setPanelShift(0);
    }
  }

  $('panel-close').addEventListener('click', () => { stopTour(); Globe.goHome(); });

  /* ---------------- tooltip ---------------- */

  const tip = $('tooltip');
  function onHover(c, x, y) {
    if (!c) { tip.classList.remove('show'); return; }
    tip.innerHTML = `<b>${c.flag} ${c.name}</b><span>${HAZARDS[c.hazard].label} · ${c.risk} risk</span>`;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
    tip.classList.add('show');
  }

  /* ---------------- tour ---------------- */

  let touring = false, tourIndex = -1, dwellStart = 0, arrived = false;
  const tourBtn = document.querySelector('[data-act="tour"]');
  const hud = $('tour-hud');

  function goTo(i) {
    tourIndex = (i + COUNTRIES.length) % COUNTRIES.length;
    arrived = false;
    Globe.flyTo(COUNTRIES[tourIndex]);
    $('tour-count').textContent = `${tourIndex + 1} / ${COUNTRIES.length}`;
  }
  function startTour() {
    touring = true; tourBtn.classList.add('playing'); hud.classList.add('show'); document.body.classList.add('touring');
    goTo(tourIndex >= 0 && Globe.focus ? tourIndex : tourIndex + 1);
  }
  function stopTour() {
    touring = false; tourBtn.classList.remove('playing'); hud.classList.remove('show'); document.body.classList.remove('touring');
    $('tour-progress').style.width = '0%';
  }
  function onArrive() { arrived = true; dwellStart = performance.now(); }

  function tickTour() {
    if (!touring) return;
    if (arrived) {
      const p = Math.min(1, (performance.now() - dwellStart) / TOUR_DWELL);
      $('tour-progress').style.width = (p * 100).toFixed(1) + '%';
      if (p >= 1) goTo(tourIndex + 1);
    } else {
      $('tour-progress').style.width = '0%';
    }
  }

  /* ---------------- controls ---------------- */

  function act(name) {
    switch (name) {
      case 'tour': touring ? stopTour() : startTour(); break;
      case 'next': goTo(tourIndex + 1); if (touring) dwellStart = performance.now(); break;
      case 'prev': goTo(tourIndex - 1); if (touring) dwellStart = performance.now(); break;
      case 'reset': stopTour(); Globe.goHome(); break;
      case 'fullscreen':
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
        break;
    }
  }
  function toggle(name, force) {
    const on = force !== undefined ? force : !Globe.layers[name];
    Globe.setLayer(name, on);
    document.querySelector(`[data-toggle="${name}"]`)?.classList.toggle('on', on);
    if (name === 'heat') $('legend').classList.toggle('hidden', !on);
    if (name === 'realsun') $('clock').classList.toggle('show', on);
  }

  document.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => act(b.dataset.act)));
  document.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', () => toggle(b.dataset.toggle)));

  const KEYS = { h: 'heat', w: 'fires', s: 'storms', c: 'clouds', l: 'labels', n: 'realsun' };
  window.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (e.key === ' ') { e.preventDefault(); act('tour'); }
    else if (e.key === 'ArrowRight') act('next');
    else if (e.key === 'ArrowLeft') act('prev');
    else if (e.key === 'Escape') act('reset');
    else if (k === 'f') act('fullscreen');
    else if (k === 'r') act('reset');
    else if (KEYS[k]) toggle(KEYS[k]);
  });

  // stop the tour if the presenter grabs the globe
  $('globe').addEventListener('pointerdown', () => { if (touring) stopTour(); hideHint(); });
  $('globe').addEventListener('wheel', () => { if (touring) stopTour(); hideHint(); }, { passive: true });
  let hintHidden = false;
  function hideHint() { if (!hintHidden) { hintHidden = true; setTimeout(() => $('hint').classList.add('hidden'), 2500); } }

  setInterval(() => {
    if (!Globe.layers.realsun) return;
    const d = new Date();
    $('clock').textContent = 'Real-time daylight · ' + d.toUTCString().slice(17, 22) + ' UTC';
  }, 1000);

  window.App = { stopTour };

  /* ---------------- boot ---------------- */

  Globe.init($('globe'), {
    onReady() { setTimeout(() => $('loader').classList.add('hide'), 200); },
    onFocus,
    onHover,
    onArrive,
    onSelect(c) { if (touring) stopTour(); tourIndex = COUNTRIES.indexOf(c); Globe.flyTo(c); hideHint(); },
    onFrame(g) { updateLabels(g); tickTour(); }
  }).catch(err => {
    console.error(err);
    $('loader').querySelector('p').textContent = 'Could not start WebGL: ' + err.message;
  });
})();
