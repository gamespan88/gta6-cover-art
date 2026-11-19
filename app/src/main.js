// VICE FRAME — Cover Lab: the editor.
// Wires the page to the cover engine (./cover.js): photos from the person's own machine (file picker or
// drag and drop, nothing is uploaded), a tray of loaded photos, seven cover layouts, seven colour
// grades, per-panel crop / pan / zoom and grade override, a story title with its tagline and neon
// script line, a star rating, a live preview, and one-click PNG exports in the three post sizes.
// A `?shot=` query sets up a fixed scene for screenshots instead (./shots.js).
import {
  GRADES,
  TEMPLATES,
  createCoverState,
  createPanel,
  exportLandscapeCover,
  exportPortraitCover,
  exportSquareCover,
  fillAllPanels,
  fillPanelsWithPhotos,
  panelRects,
  renderCover,
  syncPanels,
} from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const tray = document.getElementById('tray');
const status = document.getElementById('status');
const captionInput = document.getElementById('caption');
const taglineInput = document.getElementById('tagline');
const scriptInput = document.getElementById('script-line');
const starsSelect = document.getElementById('stars');
const zoomInput = document.getElementById('zoom');
const panelGrade = document.getElementById('panel-grade');
const panelLabel = document.getElementById('panel-label');

const state = createCoverState();
const photos = []; // every loaded image: { img, name }
let brushPhoto = -1; // the tray photo a panel click assigns
let selectedPanel = 0;
let previewSize = { w: 1080, h: 1080 };

/** Loads an image from a URL, resolving to the image once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Loads the bundled display faces so the canvas letters with them, not a fallback. */
async function loadDisplayFont() {
  for (const family of ['Anton', 'Yellowtail']) {
    try {
      const face = new FontFace(family, `url('./fonts/${family}-Regular.woff2')`);
      await face.load();
      document.fonts.add(face);
    } catch {
      // The CSS @font-face may still deliver it; the cover falls back to a bold sans or cursive.
    }
  }
}

/** Redraws the preview and the selection outline of the panel being edited. */
function redraw() {
  syncPanels(state);
  renderCover(canvas, state, photos.map((p) => p.img));
  const rects = panelRects(state.template, canvas.width, canvas.height);
  const rect = rects[selectedPanel];
  if (rect && !document.body.classList.contains('shot-cover')) {
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.strokeStyle = '#19e3d2';
    ctx.lineWidth = Math.max(3, canvas.width * 0.004);
    ctx.setLineDash([canvas.width * 0.02, canvas.width * 0.012]);
    ctx.strokeRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4);
    ctx.restore();
  }
  panelLabel.textContent = `Panel ${selectedPanel + 1} of ${rects.length}`;
  const panel = state.panels[selectedPanel];
  if (panel) {
    zoomInput.value = String(panel.zoom);
    panelGrade.value = panel.grade ?? '';
  }
}

/** Adds an image to the photo tray and returns its index in the photo list. */
function addPhoto(img, name) {
  photos.push({ img, name });
  const index = photos.length - 1;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tray-photo';
  button.title = name;
  const thumb = document.createElement('img');
  thumb.src = img.src;
  thumb.alt = name;
  button.appendChild(thumb);
  button.addEventListener('click', () => {
    brushPhoto = index;
    for (const el of tray.children) el.classList.toggle('chosen', el === button);
  });
  tray.appendChild(button);
  if (brushPhoto === -1) button.click();
  return index;
}

/** Reads image files the person picked or dropped; their photos never leave the machine. */
async function addPhotoFiles(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const img = await loadImage(URL.createObjectURL(file));
    addPhoto(img, file.name);
  }
  status.textContent = `${photos.length} photo${photos.length === 1 ? '' : 's'} loaded — click a panel to place the chosen one.`;
  redraw();
}

document.getElementById('photo-file').addEventListener('change', (e) => {
  addPhotoFiles(e.target.files);
  e.target.value = '';
});

const stage = document.getElementById('stage');
stage.addEventListener('dragover', (e) => {
  e.preventDefault();
  stage.classList.add('dragging');
});
stage.addEventListener('dragleave', () => stage.classList.remove('dragging'));
stage.addEventListener('drop', (e) => {
  e.preventDefault();
  stage.classList.remove('dragging');
  addPhotoFiles(e.dataTransfer.files);
});

// Template and grade pickers.
for (const button of document.querySelectorAll('[data-template]')) {
  button.addEventListener('click', () => {
    state.template = button.dataset.template;
    for (const el of document.querySelectorAll('[data-template]')) el.classList.toggle('on', el === button);
    selectedPanel = 0;
    syncPanels(state);
    redraw();
  });
}
for (const button of document.querySelectorAll('[data-grade]')) {
  button.addEventListener('click', () => {
    state.grade = button.dataset.grade;
    for (const el of document.querySelectorAll('[data-grade]')) el.classList.toggle('on', el === button);
    redraw();
  });
}
for (const button of document.querySelectorAll('[data-title-style]')) {
  button.addEventListener('click', () => {
    state.titleStyle = button.dataset.titleStyle;
    for (const el of document.querySelectorAll('[data-title-style]')) el.classList.toggle('on', el === button);
    redraw();
  });
}

// The cover's words: a story title, its tagline, the neon script line and the star rating.
captionInput.addEventListener('input', () => {
  state.caption = captionInput.value;
  redraw();
});
taglineInput.addEventListener('input', () => {
  state.tagline = taglineInput.value;
  redraw();
});
scriptInput.addEventListener('input', () => {
  state.scriptLine = scriptInput.value;
  redraw();
});
starsSelect.addEventListener('change', () => {
  state.stars = Number(starsSelect.value);
  redraw();
});

// Per-panel controls: zoom, grade override, and filling every panel with the chosen photo.
zoomInput.addEventListener('input', () => {
  const panel = state.panels[selectedPanel];
  if (panel) panel.zoom = Number(zoomInput.value);
  redraw();
});
panelGrade.addEventListener('change', () => {
  const panel = state.panels[selectedPanel];
  if (panel) panel.grade = panelGrade.value || null;
  redraw();
});
document.getElementById('fill-all').addEventListener('click', () => {
  if (brushPhoto < 0) {
    status.textContent = 'Load a photo first, then fill the panels with it.';
    return;
  }
  fillAllPanels(state, brushPhoto);
  redraw();
});
document.getElementById('clear-panel').addEventListener('click', () => {
  const panel = state.panels[selectedPanel];
  if (panel) Object.assign(panel, createPanel());
  redraw();
});

// Panel picking and panning on the preview canvas.
function canvasPoint(e) {
  const box = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - box.left) / box.width) * canvas.width,
    y: ((e.clientY - box.top) / box.height) * canvas.height,
  };
}
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const point = canvasPoint(e);
  const rects = panelRects(state.template, canvas.width, canvas.height);
  const hit = rects.findIndex((r) => point.x >= r.x && point.x <= r.x + r.w && point.y >= r.y && point.y <= r.y + r.h);
  if (hit === -1) return;
  selectedPanel = hit;
  if (brushPhoto >= 0 && state.panels[hit].photo !== brushPhoto && e.shiftKey === false && drag === null && state.panels[hit].photo === -1) {
    state.panels[hit].photo = brushPhoto; // an empty panel takes the chosen photo on click
  }
  drag = { x: point.x, y: point.y, moved: false };
  canvas.setPointerCapture(e.pointerId);
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const point = canvasPoint(e);
  const panel = state.panels[selectedPanel];
  const rects = panelRects(state.template, canvas.width, canvas.height);
  const rect = rects[selectedPanel];
  if (panel && rect && panel.photo >= 0) {
    panel.ox = Math.max(-1, Math.min(1, panel.ox + ((point.x - drag.x) / rect.w) * 1.7));
    panel.oy = Math.max(-1, Math.min(1, panel.oy + ((point.y - drag.y) / rect.h) * 1.7));
  }
  drag = { x: point.x, y: point.y, moved: true };
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('dblclick', () => {
  // A double click assigns the chosen tray photo to the selected panel outright.
  if (brushPhoto >= 0 && state.panels[selectedPanel]) {
    state.panels[selectedPanel].photo = brushPhoto;
    redraw();
  }
});
canvas.addEventListener('wheel', (e) => {
  const panel = state.panels[selectedPanel];
  if (!panel || panel.photo < 0) return;
  e.preventDefault();
  panel.zoom = Math.max(1, Math.min(3, panel.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
  redraw();
}, { passive: false });

// Preview size: the canvas takes the chosen post size, scaled down by CSS.
for (const button of document.querySelectorAll('[data-size]')) {
  button.addEventListener('click', () => {
    const [w, h] = button.dataset.size.split('x').map(Number);
    previewSize = { w, h };
    canvas.width = w;
    canvas.height = h;
    for (const el of document.querySelectorAll('[data-size]')) el.classList.toggle('on', el === button);
    redraw();
  });
}

// Exports: render the cover offscreen at the exact post size and download the PNG.
const EXPORTERS = {
  '1080x1080': exportSquareCover,
  '1080x1350': exportPortraitCover,
  '1920x1080': exportLandscapeCover,
};
for (const button of document.querySelectorAll('[data-export]')) {
  button.addEventListener('click', () => {
    const exporter = EXPORTERS[button.dataset.export] ?? exportSquareCover;
    const off = exporter(state, photos.map((p) => p.img));
    off.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vice-frame-cover-${button.dataset.export}.png`;
      a.click();
      status.textContent = `Saved vice-frame-cover-${button.dataset.export}.png`;
    }, 'image/png');
  });
}

// The seven bundled samples, free to use, wait in the tray so a cover is one click away: portraits,
// a car chase, an empty neon street and the pier at golden hour.
const SAMPLES = [
  ['pier', 'Pier at golden hour'],
  ['boulevard', 'Boulevard portrait'],
  ['neon', 'Neon street portrait'],
  ['drive', 'Sunset boulevard drive'],
  ['pool', 'Rooftop pool at dusk'],
  ['chase', 'Sunset Chase'],
  ['neonstreet', 'Neon Harbor'],
];

/** Boot: load the font and the samples, then either set a shot scene or open the editor. */
async function boot() {
  await loadDisplayFont();
  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  if (shot === 'cover') {
    // The cover fills the stage, so the canvas takes the export size nearest the stage's shape.
    const aspect = window.innerWidth / window.innerHeight;
    if (aspect > 1.2) { canvas.width = 1920; canvas.height = 1080; }
    else if (aspect < 0.85) { canvas.width = 1080; canvas.height = 1350; }
    else { canvas.width = 1080; canvas.height = 1080; }
  }
  if (shot) {
    await runShot(shot, query, {
      state,
      captionInput,
      taglineInput,
      async loadSample(name, caption, grade) {
        // `name` may name one sample or a comma list of them: a list fills the panels in turn, a
        // different photo in each panel, while a single name fills the whole collage as before.
        const names = String(name ?? 'pier').split(',').map((s) => s.trim()).filter(Boolean);
        const indices = [];
        for (const sampleName of names) {
          const img = await loadImage(`samples/${sampleName}.jpg`);
          indices.push(addPhoto(img, sampleName));
        }
        brushPhoto = indices[0];
        if (caption !== null && caption !== undefined) {
          state.caption = caption;
          captionInput.value = caption;
        }
        const tag = query.get('tagline') ?? query.get('subtitle');
        if (tag) {
          state.tagline = tag;
          taglineInput.value = tag;
        }
        const scriptLine = query.get('script');
        if (scriptLine) {
          state.scriptLine = scriptLine;
          scriptInput.value = scriptLine;
        }
        const stars = query.get('stars');
        if (stars !== null && stars !== '') {
          state.stars = Math.max(0, Math.min(5, Number(stars) || 0));
          starsSelect.value = String(state.stars);
        }
        if (grade) {
          state.grade = grade;
          for (const el of document.querySelectorAll('[data-grade]')) el.classList.toggle('on', el.dataset.grade === grade);
        }
        const titleStyle = query.get('title');
        if (['block', 'gradient', 'script'].includes(titleStyle)) {
          state.titleStyle = titleStyle;
          for (const el of document.querySelectorAll('[data-title-style]')) el.classList.toggle('on', el.dataset.titleStyle === titleStyle);
        }
        // Pick the template that suits the stage: the strip poster for a wide stage, else the
        // collage — unless the scene names one itself with `template`.
        const wide = window.innerWidth > window.innerHeight * 1.2;
        const wanted = query.get('template');
        state.template = TEMPLATES.some((t) => t.id === wanted)
          ? wanted
          : (wide && shot === 'cover' ? 'strip' : 'classic');
        for (const el of document.querySelectorAll('[data-template]')) el.classList.toggle('on', el.dataset.template === state.template);
        if (indices.length > 1) fillPanelsWithPhotos(state, indices);
        else fillAllPanels(state, indices[0]);
        redraw();
      },
      async addSampleToTray(name) {
        // An editor scene also shows the samples it did not place, waiting in the tray.
        const img = await loadImage(`samples/${name}.jpg`);
        addPhoto(img, name);
      },
      setPreviewSize(w, h) {
        // An editor scene can open at a post size (the landscape one shows off the Wide Hero).
        previewSize = { w, h };
        canvas.width = w;
        canvas.height = h;
        for (const el of document.querySelectorAll('[data-size]')) {
          el.classList.toggle('on', el.dataset.size === `${w}x${h}`);
        }
        redraw();
      },
      redraw,
    });
    return;
  }
  for (const [name, label] of SAMPLES) {
    try {
      const img = await loadImage(`samples/${name}.jpg`);
      addPhoto(img, label);
    } catch {
      // A missing sample never blocks the editor.
    }
  }
  if (photos.length) {
    fillAllPanels(state, 0);
    brushPhoto = 0;
  }
  redraw();
}

boot();
