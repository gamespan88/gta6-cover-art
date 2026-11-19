// VICE FRAME — Cover Lab: the cover engine.
// Draws a multi-panel, GTA-poster-style cover onto any 2D canvas: a collage of photo panels with white
// gutters, a Vice City colour grade, original drawn ornaments (retro sun, palm silhouettes, skyline)
// and a story title with its tagline and script line lettered in the title band. Everything is drawn
// here — no artwork is loaded from anywhere.

export const GRADES = [
  { id: 'sunset', name: 'Sunset' },
  { id: 'neon', name: 'Neon Nights' },
  { id: 'heatwave', name: 'Heatwave Map' },
  { id: 'ultraviolet', name: 'Ultraviolet Map' },
  { id: 'duotone', name: 'Duotone Ink' },
  { id: 'halftone', name: 'Halftone Print' },
  { id: 'raw', name: 'Raw' },
];

// Palettes per grade: sky gradient stops for empty panels and the title band, the silhouette ink, the
// caption gradient and the accent used for chips and the sun.
const PALETTES = {
  sunset: {
    sky: ['#2e1a47', '#7b2d5b', '#e85d75', '#ff9e5e', '#ffd97a'],
    band: ['#1d0f33', '#4a1e4d'],
    ink: '#241031',
    sun: '#ffd97a',
    caption: ['#ffffff', '#ffd97a'],
    accent: '#ff9e5e',
  },
  neon: {
    sky: ['#0b1035', '#3b1163', '#a4137c', '#ff2e88', '#19e3d2'],
    band: ['#070418', '#2a0a4a'],
    ink: '#070418',
    sun: '#19e3d2',
    caption: ['#ffffff', '#7df9ec'],
    accent: '#ff2e88',
  },
  duotone: {
    sky: ['#221243', '#4a2160', '#a4137c', '#ff7a59', '#ffc46b', '#ffe3b3'],
    band: ['#180b30', '#221243'],
    ink: '#221243',
    sun: '#ffe3b3',
    caption: ['#ffe3b3', '#ffc46b'],
    accent: '#ff5d7a',
  },
  heatwave: {
    sky: ['#170b33', '#6d1a5e', '#d6336c', '#ff7a3c', '#ffc46b', '#fff1cf'],
    band: ['#170b33', '#3d1150'],
    ink: '#1c0b30',
    sun: '#ffc46b',
    caption: ['#ffffff', '#ffc46b'],
    accent: '#ff7a3c',
  },
  ultraviolet: {
    sky: ['#04060f', '#1b1040', '#5b2a9d', '#2e7fd9', '#19e3d2', '#eafffb'],
    band: ['#04060f', '#160b38'],
    ink: '#04060f',
    sun: '#19e3d2',
    caption: ['#ffffff', '#7df9ec'],
    accent: '#2e7fd9',
  },
  halftone: {
    sky: ['#2e1a47', '#7b2d5b', '#e85d75', '#ff9e5e', '#ffd97a'],
    band: ['#180b30', '#2a1250'],
    ink: '#221243',
    paper: '#f3e9d2',
    sun: '#ffd97a',
    caption: ['#ffe9c4', '#ffc46b'],
    accent: '#ff5d7a',
  },
  raw: {
    sky: ['#31435c', '#5d7a99', '#9db8cc', '#d9e6ee'],
    band: ['#141c26', '#24344a'],
    ink: '#101820',
    sun: '#f4ead2',
    caption: ['#ffffff', '#d9e6ee'],
    accent: '#e8b34b',
  },
};

const TITLE_BAND = 0.148; // fraction of the height given to the caption band at the top

// Panel layouts in fractions of the whole canvas (x, y, w, h). Three templates in the cover tradition:
// the classic collage grid, a two-panel duo split and a wide strip poster (columns when portrait).
export const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic Collage',
    panels() {
      const t = TITLE_BAND;
      return [
        { x: 0.000, y: t, w: 0.430, h: 1 - t },
        { x: 0.430, y: t, w: 0.320, h: 0.400 },
        { x: 0.750, y: t, w: 0.250, h: 0.400 },
        { x: 0.430, y: t + 0.400, w: 0.160, h: 0.455 },
        { x: 0.590, y: t + 0.400, w: 0.160, h: 0.455 },
        { x: 0.750, y: t + 0.400, w: 0.250, h: 0.227 },
        { x: 0.750, y: t + 0.627, w: 0.250, h: 0.228 },
      ];
    },
  },
  {
    id: 'duo',
    name: 'Duo Split',
    panels() {
      const t = TITLE_BAND;
      return [
        { x: 0.000, y: t, w: 0.560, h: 1 - t },
        { x: 0.560, y: t, w: 0.440, h: 1 - t },
      ];
    },
  },
  {
    id: 'strip',
    name: 'Strip Poster',
    panels(w, h) {
      const t = TITLE_BAND;
      if (w >= h) {
        return [
          { x: 0.000, y: t, w: 1.000, h: 0.330 },
          { x: 0.000, y: t + 0.330, w: 0.615, h: 0.300 },
          { x: 0.615, y: t + 0.330, w: 0.385, h: 0.300 },
          { x: 0.000, y: t + 0.630, w: 1.000, h: 0.222 },
        ];
      }
      return [
        { x: 0.000, y: t, w: 0.360, h: 1 - t },
        { x: 0.360, y: t, w: 0.640, h: 0.420 },
        { x: 0.360, y: t + 0.420, w: 0.640, h: 0.432 },
      ];
    },
  },
  {
    id: 'five',
    name: 'Hero Five',
    panels() {
      const t = TITLE_BAND;
      const b = 1 - t;
      return [
        { x: 0.000, y: t, w: 0.520, h: b },
        { x: 0.520, y: t, w: 0.240, h: b / 2 },
        { x: 0.760, y: t, w: 0.240, h: b / 2 },
        { x: 0.520, y: t + b / 2, w: 0.240, h: b / 2 },
        { x: 0.760, y: t + b / 2, w: 0.240, h: b / 2 },
      ];
    },
  },
  {
    id: 'grid9',
    name: 'Grid Nine',
    panels() {
      const t = TITLE_BAND;
      const rh = (1 - t) / 3;
      const out = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) out.push({ x: c / 3, y: t + r * rh, w: 1 / 3, h: rh });
      }
      return out;
    },
  },
  {
    id: 'quad',
    name: 'Quad Four',
    panels() {
      const t = TITLE_BAND;
      const rh = (1 - t) / 2;
      return [
        { x: 0.000, y: t, w: 0.500, h: rh },
        { x: 0.500, y: t, w: 0.500, h: rh },
        { x: 0.000, y: t + rh, w: 0.500, h: rh },
        { x: 0.500, y: t + rh, w: 0.500, h: rh },
      ];
    },
  },
  {
    id: 'wide',
    name: 'Wide Hero',
    panels() {
      // The landscape layout: a tall hero panel (the car, the chase) with a wide scene above two
      // portrait panels beside it — the composition that fills a 1920 x 1080 export edge to edge.
      const t = TITLE_BAND;
      const b = 1 - t;
      return [
        { x: 0.000, y: t, w: 0.540, h: b },
        { x: 0.540, y: t, w: 0.460, h: b * 0.55 },
        { x: 0.540, y: t + b * 0.55, w: 0.230, h: b * 0.45 },
        { x: 0.770, y: t + b * 0.55, w: 0.230, h: b * 0.45 },
      ];
    },
  },
];

/** The panel rectangles (in canvas pixels) a template lays out at size w x h. */
export function panelRects(templateId, w, h) {
  const template = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
  return template.panels(w, h).map((p) => ({ x: p.x * w, y: p.y * h, w: p.w * w, h: p.h * h }));
}

/**
 * A fresh cover state: the classic collage, the sunset grade, the gradient title and no photos yet.
 * The cover's words are a story, not branding: a title, a letterspaced tagline under it, an optional
 * neon script line, and a star rating ornament for the band.
 */
export function createCoverState() {
  return {
    template: 'classic',
    grade: 'sunset',
    titleStyle: 'gradient',
    caption: 'NEON HARBOR',
    tagline: 'ONE CITY. EVERY LIGHT A LIE.',
    scriptLine: 'The Night Is Ours',
    stars: 4,
    panels: [],
  };
}

/** One panel's placement: which photo (an index into the photo list, or -1), its zoom and pan offsets. */
export function createPanel(photoIndex = -1) {
  return { photo: photoIndex, zoom: 1, ox: 0, oy: 0, grade: null };
}

// Varied crops used when one photo fills every panel, so a single-photo cover still reads as a collage:
// the hero panel keeps nearly the whole photo, the mid panels sit closer, and the small panels go in
// tight on details — a face, a hand, the foot of the scene — instead of repeating the same framing.
const FILL_CROPS = [
  { zoom: 1.06, ox: 0.05, oy: 0.1 },
  { zoom: 1.65, ox: 0.3, oy: 0.4 },
  { zoom: 1.5, ox: -0.4, oy: -0.15 },
  { zoom: 2.35, ox: 0.35, oy: 0.45 },
  { zoom: 2.15, ox: -0.35, oy: -0.4 },
  { zoom: 2.5, ox: 0.1, oy: 0.55 },
  { zoom: 1.8, ox: -0.15, oy: -0.55 },
];

/** Fills every panel of the state's template with one photo, each panel cropped differently. */
export function fillAllPanels(state, photoIndex) {
  const count = TEMPLATES.find((t) => t.id === state.template).panels(100, 100).length;
  state.panels = Array.from({ length: count }, (_, i) => ({
    ...createPanel(photoIndex),
    ...FILL_CROPS[i % FILL_CROPS.length],
  }));
}

// Crops used when several different photos share one cover: the hero panel keeps nearly the whole of
// its photo, the mid panels sit a little closer, and the small panels go in on a detail of their own
// photo — so each panel reads as its own scene of the collage, not a repeat of a neighbour's.
const MULTI_CROPS = [
  { zoom: 1.05, ox: 0.0, oy: 0.08 },
  { zoom: 1.22, ox: 0.05, oy: 0.05 },
  { zoom: 1.18, ox: -0.05, oy: 0.7 },
  { zoom: 1.85, ox: 0.15, oy: 0.3 },
  { zoom: 1.7, ox: -0.15, oy: 0.1 },
  { zoom: 1.35, ox: 0.0, oy: -0.1 },
  { zoom: 1.45, ox: 0.05, oy: -0.35 },
];

// Crops for the Wide Hero dealt in landscape: the hero keeps its subject's whole stance (the view
// sits a touch toward the car's tail), the scene panel stays wide, and the two portrait panels sit
// at face height in their near-square frames.
const LANDSCAPE_CROPS = [
  { zoom: 1.05, ox: -0.2, oy: 0.1 },
  { zoom: 1.06, ox: 0.0, oy: 0.0 },
  { zoom: 1.22, ox: 0.0, oy: 0.35 },
  { zoom: 1.22, ox: 0.0, oy: 0.35 },
];

/**
 * Fills the panels with several photos in turn: panel i takes photoIndices[i % photoIndices.length],
 * each with its own crop, so a collage can star a different photo in every panel. The Wide Hero
 * deals from its landscape crop table; every other layout deals from MULTI_CROPS.
 */
export function fillPanelsWithPhotos(state, photoIndices) {
  const count = TEMPLATES.find((t) => t.id === state.template).panels(100, 100).length;
  const crops = state.template === 'wide' ? LANDSCAPE_CROPS : MULTI_CROPS;
  state.panels = Array.from({ length: count }, (_, i) => ({
    ...createPanel(photoIndices[i % photoIndices.length]),
    ...crops[i % crops.length],
  }));
}

/** Makes sure the state has one panel entry per panel of its template. */
export function syncPanels(state) {
  const count = TEMPLATES.find((t) => t.id === state.template).panels(100, 100).length;
  while (state.panels.length < count) state.panels.push(createPanel());
  state.panels.length = count;
}

// ---------------------------------------------------------------------------
// Ornaments: original canvas drawings — a retro sun disc with slice gaps, palm silhouettes, a skyline.

/** Draws a palm tree silhouette with its crown at (x, y) and trunk dropping `height` below it. */
export function drawPalm(ctx, x, y, height, ink, flip = 1) {
  ctx.save();
  ctx.fillStyle = ink;
  // Trunk: a tapering curve leaning with the wind.
  const lean = height * 0.16 * flip;
  ctx.beginPath();
  ctx.moveTo(x - height * 0.035, y + height);
  ctx.quadraticCurveTo(x + lean * 0.4, y + height * 0.5, x + lean - height * 0.02, y);
  ctx.lineTo(x + lean + height * 0.03, y);
  ctx.quadraticCurveTo(x + lean * 0.4 + height * 0.05, y + height * 0.5, x + height * 0.035, y + height);
  ctx.closePath();
  ctx.fill();
  // Fronds: tapered arcs fanning from the crown.
  const cx = x + lean;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.08 + (i / 6) * 0.84) * flip + (flip < 0 ? Math.PI : 0);
    const len = height * (0.34 + 0.1 * Math.sin(i * 2.3));
    const ex = cx + Math.cos(a) * len;
    const ey = y - Math.abs(Math.sin(a)) * len * 0.42 + len * 0.16;
    const mx = cx + Math.cos(a) * len * 0.5;
    const my = y - Math.abs(Math.sin(a)) * len * 0.55;
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.quadraticCurveTo(mx, my, ex, ey);
    ctx.quadraticCurveTo(mx, my + height * 0.035, cx, y + height * 0.03);
    ctx.closePath();
    ctx.fill();
  }
  // Coconuts.
  ctx.beginPath();
  ctx.arc(cx - height * 0.03, y + height * 0.03, height * 0.028, 0, Math.PI * 2);
  ctx.arc(cx + height * 0.035, y + height * 0.045, height * 0.024, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Draws a retro sun disc centred at (cx, cy): a circle whose lower half is cut by widening gaps. */
export function drawSunDisc(ctx, cx, cy, r, colour) {
  ctx.save();
  ctx.fillStyle = colour;
  const strips = 9;
  for (let i = 0; i < strips; i++) {
    const t0 = -1 + (i / strips) * 2;
    const t1 = -1 + ((i + 0.999) / strips) * 2;
    const gap = Math.max(0, (i - 3)) * r * 0.045; // gaps only in the lower half, widening downward
    const y0 = cy + t0 * r;
    const y1 = cy + t1 * r - gap;
    if (y1 <= y0) continue;
    const half0 = Math.sqrt(Math.max(0, r * r - (y0 - cy) * (y0 - cy)));
    const half1 = Math.sqrt(Math.max(0, r * r - (y1 - cy) * (y1 - cy)));
    ctx.beginPath();
    ctx.moveTo(cx - half0, y0);
    ctx.lineTo(cx + half0, y0);
    ctx.lineTo(cx + half1, y1);
    ctx.lineTo(cx - half1, y1);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** Draws a city skyline silhouette along the bottom of the rect (x, y, w, h). */
export function drawSkyline(ctx, x, y, w, h, ink, lit) {
  ctx.save();
  ctx.fillStyle = ink;
  const base = y + h;
  let cx = x - w * 0.02;
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const towers = [];
  while (cx < x + w) {
    const tw = w * (0.05 + rand() * 0.09);
    const th = h * (0.25 + rand() * 0.65);
    towers.push({ x: cx, w: tw, h: th });
    ctx.fillRect(cx, base - th, tw, th);
    if (rand() > 0.55) ctx.fillRect(cx + tw * 0.35, base - th - h * 0.09, tw * 0.3, h * 0.09); // rooftop block
    cx += tw + w * 0.012;
  }
  // Lit windows.
  ctx.fillStyle = lit;
  ctx.globalAlpha = 0.85;
  for (const t of towers) {
    const cols = Math.max(1, Math.floor(t.w / (w * 0.022)));
    const rows = Math.max(2, Math.floor(t.h / (h * 0.11)));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rand() > 0.45) continue;
        ctx.fillRect(t.x + (c + 0.3) * (t.w / cols), base - t.h + (r + 0.3) * (t.h / rows), t.w / cols * 0.4, t.h / rows * 0.4);
      }
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Grades: each panel's photo is drawn to a small offscreen canvas, graded there, then placed.

// Gradient maps: a 256-entry lookup from luminance to a palette's colour ramp, built once per palette
// and level count. The map grades (Heatwave, Ultraviolet) run it smooth; Duotone Ink posterizes it to
// six bands for its print look.
const gradientLuts = {};
function gradientLut(palette, levels) {
  const key = `${palette.ink}|${levels}`;
  if (gradientLuts[key]) return gradientLuts[key];
  const stops = palette.sky.map((hex) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]);
  const lut = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; i++) {
    let t = i / 255;
    if (levels > 0) {
      const band = Math.min(levels - 1, Math.floor((i / 256) * levels));
      t = band / (levels - 1);
    }
    const pos = t * (stops.length - 1);
    const a = stops[Math.floor(pos)];
    const b = stops[Math.min(stops.length - 1, Math.floor(pos) + 1)];
    const f = pos - Math.floor(pos);
    for (let c = 0; c < 3; c++) lut[i * 3 + c] = Math.round(a[c] + (b[c] - a[c]) * f);
  }
  gradientLuts[key] = lut;
  return lut;
}

/** Applies a gradient map in place: every pixel's luminance is recoloured through the palette ramp. */
function applyGradientMap(canvas, palette, levels) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  if (!width || !height) return;
  const data = ctx.getImageData(0, 0, width, height);
  const px = data.data;
  const lut = gradientLut(palette, levels);
  for (let i = 0; i < px.length; i += 4) {
    const lum = Math.min(255, Math.max(0, Math.round(0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2])));
    px[i] = lut[lum * 3];
    px[i + 1] = lut[lum * 3 + 1];
    px[i + 2] = lut[lum * 3 + 2];
  }
  ctx.putImageData(data, 0, 0);
}

// The ink grade's band edges, spaced tightest through the midtones where faces live and widest in
// the shadows and highlights: skin is cut into several distinct tones instead of one flat mask,
// while skies, hair and deep shade still posterize hard, the way a screen print should.
const INK_BAND_EDGES = [0, 26, 56, 88, 118, 146, 172, 198, 226, 256];

const inkLuts = {};
function inkLut(palette) {
  if (inkLuts[palette.ink]) return inkLuts[palette.ink];
  const stops = palette.sky.map((hex) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]);
  const bands = INK_BAND_EDGES.length - 1;
  const lut = new Uint8Array(256 * 3);
  for (let lum = 0; lum < 256; lum++) {
    let band = 0;
    while (band < bands - 1 && lum >= INK_BAND_EDGES[band + 1]) band++;
    const pos = (band / (bands - 1)) * (stops.length - 1);
    const a = stops[Math.floor(pos)];
    const b = stops[Math.min(stops.length - 1, Math.floor(pos) + 1)];
    const f = pos - Math.floor(pos);
    for (let c = 0; c < 3; c++) lut[lum * 3 + c] = Math.round(a[c] + (b[c] - a[c]) * f);
  }
  inkLuts[palette.ink] = lut;
  return lut;
}

/**
 * Applies the Duotone Ink grade in place, face-safe: luminance is posterized through the palette
 * ramp in the midtone-weighted bands of INK_BAND_EDGES, then blended back toward the smooth map
 * inside that same mid band — strongest at skin's centre luminance, gone at the extremes — so a
 * face keeps its eyes and expression while the print around it stays bold and flat.
 */
function applyFaceSafeInk(canvas, palette) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  if (!width || !height) return;
  const data = ctx.getImageData(0, 0, width, height);
  const px = data.data;
  const ink = inkLut(palette);
  const smooth = gradientLut(palette, 0);
  for (let i = 0; i < px.length; i += 4) {
    const lum = Math.min(255, Math.max(0, Math.round(0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2])));
    const mid = Math.max(0, 1 - Math.abs(lum - 132) / 92); // 1 at skin's centre, 0 in deep shade or glare
    const blend = 0.52 * mid * mid;
    for (let c = 0; c < 3; c++) {
      px[i + c] = Math.round(ink[lum * 3 + c] * (1 - blend) + smooth[lum * 3 + c] * blend);
    }
  }
  ctx.putImageData(data, 0, 0);
}

/** Applies the halftone print grade in place: the photo redrawn as ink dots on paper, dot size by shade. */
function applyHalftone(canvas, palette) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  if (!width || !height) return;
  const src = ctx.getImageData(0, 0, width, height).data;
  const cell = Math.max(5, Math.round(Math.min(width, height) / 44));
  ctx.fillStyle = palette.paper ?? '#f3e9d2';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = palette.ink;
  for (let cy = cell / 2; cy < height; cy += cell) {
    for (let cx = cell / 2; cx < width; cx += cell) {
      const px = Math.min(width - 1, Math.floor(cx));
      const py = Math.min(height - 1, Math.floor(cy));
      const i = (py * width + px) * 4;
      const lum = (0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2]) / 255;
      const r = cell * 0.58 * (1 - lum);
      if (r < 0.5) continue;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** The CSS filter a grade applies while a photo is drawn. */
function gradeFilter(grade) {
  switch (grade) {
    case 'sunset': return 'saturate(1.5) contrast(1.14) sepia(0.4) hue-rotate(-10deg) brightness(1.02)';
    case 'neon': return 'saturate(1.55) contrast(1.16) hue-rotate(6deg) brightness(1.02)';
    case 'duotone': return 'saturate(0.25) contrast(1.05) brightness(1.03)';
    case 'heatwave': return 'saturate(0.32) contrast(1.12) brightness(1.03)';
    case 'ultraviolet': return 'saturate(0.32) contrast(1.12) brightness(1.03)';
    case 'halftone': return 'saturate(0.2) contrast(1.22) brightness(1.04)';
    default: return 'saturate(1.1) contrast(1.05)';
  }
}

/** Paints a grade's light over an already-drawn photo: warm or neon glows and a shade at the foot. */
function paintGradeLight(ctx, rect, grade, palette) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (grade === 'sunset') {
    // Golden hour, laid on thick: hot orange burning low in the frame, pink through the middle, and a
    // second warm pass over the whole panel so even a midday photo turns to sunset, not just a tint.
    const glow = ctx.createLinearGradient(x, y + h, x, y);
    glow.addColorStop(0, 'rgba(255, 94, 58, 0.58)');
    glow.addColorStop(0.38, 'rgba(255, 140, 66, 0.34)');
    glow.addColorStop(0.72, 'rgba(232, 93, 140, 0.22)');
    glow.addColorStop(1, 'rgba(255, 190, 90, 0.14)');
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255, 150, 70, 0.20)';
    ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = 'multiply';
    const shade = ctx.createLinearGradient(x, y + h * 0.55, x, y + h);
    shade.addColorStop(0, 'rgba(36, 16, 49, 0)');
    shade.addColorStop(1, 'rgba(36, 16, 49, 0.38)');
    ctx.fillStyle = shade;
    ctx.fillRect(x, y, w, h);
  } else if (grade === 'neon') {
    const wash = ctx.createLinearGradient(x, y, x + w, y + h);
    wash.addColorStop(0, 'rgba(25, 227, 210, 0.20)');
    wash.addColorStop(0.5, 'rgba(164, 19, 124, 0.05)');
    wash.addColorStop(1, 'rgba(255, 46, 136, 0.26)');
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = wash;
    ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = 'multiply';
    const shade = ctx.createLinearGradient(x, y + h * 0.5, x, y + h);
    shade.addColorStop(0, 'rgba(7, 4, 24, 0)');
    shade.addColorStop(1, 'rgba(7, 4, 24, 0.42)');
    ctx.fillStyle = shade;
    ctx.fillRect(x, y, w, h);
  } else if (grade === 'heatwave' || grade === 'ultraviolet') {
    // The map grades carry their own colour; they only take the shared shade at the foot for depth.
    ctx.globalCompositeOperation = 'multiply';
    const shade = ctx.createLinearGradient(x, y + h * 0.5, x, y + h);
    shade.addColorStop(0, 'rgba(10, 4, 20, 0)');
    shade.addColorStop(1, 'rgba(10, 4, 20, 0.36)');
    ctx.fillStyle = shade;
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Panel painting.

/** Draws the designed backdrop an empty panel gets: sky, sun, palms and a skyline in silhouette. */
function paintArtPanel(ctx, rect, grade, palette, variant) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const sky = ctx.createLinearGradient(x, y, x, y + h);
  palette.sky.forEach((stop, i) => sky.addColorStop(i / (palette.sky.length - 1), stop));
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  const sunR = Math.min(w, h) * (0.3 + (variant % 3) * 0.07);
  drawSunDisc(ctx, x + w * (0.32 + (variant % 4) * 0.12), y + h * 0.34, sunR, palette.sun);
  drawSkyline(ctx, x, y + h * 0.62, w, h * 0.38, palette.ink, palette.sun);
  const palmH = h * 0.52;
  drawPalm(ctx, x + w * 0.1, y + h * 0.52, palmH, palette.ink, 1);
  if (w > h * 0.8) drawPalm(ctx, x + w * 0.88, y + h * 0.58, palmH * 0.8, palette.ink, -1);
  ctx.restore();
  if (grade !== 'raw') paintGradeLight(ctx, rect, grade === 'duotone' ? 'sunset' : grade, palette);
}

/** Draws one panel: its photo cover-fitted and graded, or the art backdrop when it has no photo. */
function paintPanel(ctx, rect, panel, photos, grade, index) {
  const palette = PALETTES[grade];
  const photo = panel.photo >= 0 ? photos[panel.photo] : null;
  if (!photo) {
    paintArtPanel(ctx, rect, grade, palette, index);
    return;
  }
  const ownGrade = panel.grade ?? grade;
  const ownPalette = PALETTES[ownGrade];
  const off = document.createElement('canvas');
  off.width = Math.max(2, Math.round(rect.w));
  off.height = Math.max(2, Math.round(rect.h));
  const octx = off.getContext('2d');
  const scale = Math.max(off.width / photo.naturalWidth, off.height / photo.naturalHeight) * panel.zoom;
  const dw = photo.naturalWidth * scale;
  const dh = photo.naturalHeight * scale;
  const dx = (off.width - dw) / 2 + (panel.ox * Math.max(0, dw - off.width)) / 2;
  const dy = (off.height - dh) / 2 + (panel.oy * Math.max(0, dh - off.height)) / 2;
  octx.filter = gradeFilter(ownGrade);
  octx.drawImage(photo, dx, dy, dw, dh);
  octx.filter = 'none';
  if (ownGrade === 'duotone') applyFaceSafeInk(off, ownPalette);
  else if (ownGrade === 'heatwave' || ownGrade === 'ultraviolet') {
    applyGradientMap(off, ownPalette, 0);
    paintGradeLight(octx, { x: 0, y: 0, w: off.width, h: off.height }, ownGrade, ownPalette);
  }
  else if (ownGrade === 'halftone') applyHalftone(off, ownPalette);
  else paintGradeLight(octx, { x: 0, y: 0, w: off.width, h: off.height }, ownGrade, ownPalette);
  ctx.drawImage(off, rect.x, rect.y);
}

// ---------------------------------------------------------------------------
// The title band and caption.

/** Paints the band behind the caption: a deep gradient and the retro sun sitting whole inside it. */
function paintTitleBand(ctx, w, h, palette, titleStyle) {
  const bandH = h * TITLE_BAND;
  const grad = ctx.createLinearGradient(0, 0, 0, bandH);
  grad.addColorStop(0, palette.band[0]);
  grad.addColorStop(1, palette.band[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, bandH);
  if (titleStyle === 'gradient') {
    // A halftone dot field texture across the band, fine enough to read as print, not noise.
    ctx.save();
    ctx.fillStyle = palette.accent;
    const step = bandH * 0.17;
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col * step < w; col++) {
        const fx = (col * step) / w;
        ctx.globalAlpha = 0.13 * (1 - Math.abs(fx - 0.5));
        ctx.beginPath();
        ctx.arc(col * step + (row % 2) * step * 0.5, row * step + step * 0.4, step * 0.13, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  // A whole retro sun sits inside the band at the right, clear of the centred caption. Nothing else
  // shares the band: a silhouette clipped by the band's edge reads as a stray mark, not an ornament.
  drawSunDisc(ctx, w * 0.94, bandH * 0.5, bandH * 0.33, palette.sun);
  // A hairline of accent under the band.
  ctx.fillStyle = palette.accent;
  ctx.fillRect(0, bandH, w, Math.max(2, h * 0.004));
}

/** Draws the tilted sticker badge the Script title style wears at the band's left: EST. 2026. */
function drawBadge(ctx, w, bandH, palette) {
  const text = 'EST. 2026';
  const size = bandH * 0.14;
  ctx.save();
  ctx.font = `${size}px Anton, sans-serif`;
  try { ctx.letterSpacing = `${size * 0.22}px`; } catch { /* older engines: spacing is a garnish */ }
  const bw = ctx.measureText(text).width + size * 1.7;
  const bh = size * 2.0;
  ctx.translate(w * 0.03 + bw / 2, bandH * 0.5);
  ctx.rotate(-0.13);
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-bw / 2, -bh / 2, bw, bh, bh / 2);
  else ctx.rect(-bw / 2, -bh / 2, bw, bh);
  ctx.fill();
  ctx.fillStyle = palette.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, size * 0.05);
  ctx.restore();
}

/** The tagline as it is lettered: trimmed, uppercased, its runs of whitespace collapsed to one. */
export function buildTagline(state) {
  return (state.tagline || '').trim().toUpperCase().replace(/\s+/g, ' ');
}

/**
 * The script line as it is lettered: the state's own script line when one is set, else its tagline,
 * in Title Case — a hand-lettered whisper under the headline, never the app's name.
 */
export function buildScriptLine(state) {
  const raw = (state.scriptLine || '').trim() || (state.tagline || '').trim();
  return raw.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

/** Letters a tagline in letterspaced capitals at (centre w/2, cy), shrinking until it fits the band. */
function letterTagline(ctx, w, cy, size, text, palette) {
  ctx.save();
  ctx.font = `${size}px Anton, sans-serif`;
  try { ctx.letterSpacing = `${size * 0.34}px`; } catch { /* older engines: spacing is a garnish */ }
  while (ctx.measureText(text).width > w * 0.86 && size > 8) {
    size *= 0.94;
    ctx.font = `${size}px Anton, sans-serif`;
    try { ctx.letterSpacing = `${size * 0.34}px`; } catch { /* as above */ }
  }
  ctx.fillStyle = palette.sun;
  ctx.fillText(text, w / 2, cy);
  try { ctx.letterSpacing = '0px'; } catch { /* as above */ }
  ctx.restore();
}

/**
 * Draws the star-rating ornament: `count` of five stars, the filled ones first, in the palette's
 * sun gold with a soft accent glow. Aligned left from x, or right ending at x, at height cy.
 */
function drawStarRating(ctx, x, cy, size, count, palette, align = 'left') {
  if (!count) return;
  ctx.save();
  ctx.font = `${size}px 'DejaVu Sans', sans-serif`;
  try { ctx.letterSpacing = `${size * 0.18}px`; } catch { /* older engines: spacing is a garnish */ }
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.shadowColor = palette.accent;
  ctx.shadowBlur = size * 0.35;
  ctx.fillStyle = palette.sun;
  ctx.fillText('★'.repeat(count) + '☆'.repeat(5 - count), x, cy);
  ctx.restore();
}

/**
 * Letters the cover's words in the state's title style. The words are a story: a headline title, a
 * letterspaced tagline under it, and — in the script style — a glowing neon script line beneath
 * that, beside the tilted EST. 2026 badge. The star rating dresses the band's free side.
 * - block: solid fill, a heavy ink outline and a hard offset shadow in the palette's hot accent;
 * - gradient: the fill runs down the palette's caption gradient, over an ink shadow and outline;
 * - script: a gradient headline with the badge at its left and the script line in Yellowtail
 *   (SIL OFL) glowing under the tagline.
 */
function letterCaption(ctx, w, h, state, palette) {
  const main = (state.caption || '').trim().toUpperCase();
  const tagline = buildTagline(state);
  const style = state.titleStyle ?? 'gradient';
  const script = style === 'script';
  const scriptLine = script ? buildScriptLine(state) : '';
  // In the script style the tagline gets its own caps line only when the script line says something
  // else; when the script line IS the tagline, lettering it twice would crowd the band.
  const capsLine = script && scriptLine && scriptLine.toUpperCase() !== tagline ? tagline : '';
  const bandH = h * TITLE_BAND;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (main) {
    let size = bandH * (script ? (capsLine ? 0.40 : 0.46) : tagline ? 0.52 : 0.62);
    const setFont = () => { ctx.font = `${size}px Anton, sans-serif`; };
    setFont();
    while (ctx.measureText(main).width > w * 0.9 && size > 10) {
      size *= 0.94;
      setFont();
    }
    const cx = w / 2;
    const cy = script ? bandH * (capsLine ? 0.26 : 0.33) : tagline ? bandH * 0.42 : bandH * 0.52;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.transform(1, 0, -0.055, 1, 0, 0); // the genre's slight forward lean
    ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.17;
    ctx.strokeStyle = palette.ink;
    if (style === 'block') {
      ctx.fillStyle = palette.accent;
      ctx.fillText(main, size * 0.055, size * 0.065); // hard offset shadow in the hot accent
      ctx.strokeText(main, 0, 0);
      ctx.fillStyle = palette.caption[0];
      ctx.fillText(main, 0, 0);
    } else {
      ctx.fillStyle = palette.ink;
      ctx.fillText(main, size * 0.045, size * 0.06); // hard shadow pass
      ctx.strokeText(main, 0, 0);
      const fill = ctx.createLinearGradient(0, -size / 2, 0, size / 2);
      fill.addColorStop(0, palette.caption[0]);
      fill.addColorStop(1, palette.caption[1]);
      ctx.fillStyle = fill;
      ctx.fillText(main, 0, 0);
    }
    ctx.restore();
  }
  if (script) drawBadge(ctx, w, bandH, palette);
  const stars = Math.max(0, Math.min(5, Math.round(state.stars ?? 0)));
  if (stars) {
    // The band's free side: at the left for block and gradient, at the right for script, whose
    // left is taken by the badge — and clear of the sun disc that sits at the band's right edge.
    if (script) drawStarRating(ctx, w * 0.865, bandH * 0.5, bandH * 0.21, stars, palette, 'right');
    else drawStarRating(ctx, w * 0.03, bandH * 0.5, bandH * 0.21, stars, palette, 'left');
  }
  if (script) {
    if (capsLine) letterTagline(ctx, w, bandH * 0.585, bandH * 0.125, capsLine, palette);
    if (scriptLine) {
      // The neon script line: the story's whisper in a glowing hand-lettered face.
      let size = bandH * (capsLine ? 0.33 : 0.36);
      const setFont = () => { ctx.font = `${size}px Yellowtail, cursive`; };
      setFont();
      while (ctx.measureText(scriptLine).width > w * 0.8 && size > 8) {
        size *= 0.94;
        setFont();
      }
      ctx.save();
      ctx.shadowColor = palette.accent;
      ctx.shadowBlur = size * 0.5;
      ctx.fillStyle = palette.sun;
      const cy = bandH * (capsLine ? 0.81 : 0.76);
      ctx.fillText(scriptLine, w / 2, cy);
      ctx.fillText(scriptLine, w / 2, cy); // a second pass deepens the neon glow
      ctx.restore();
    } else if (tagline) {
      letterTagline(ctx, w, bandH * 0.78, bandH * 0.17, tagline, palette);
    }
  } else if (tagline) {
    letterTagline(ctx, w, bandH * 0.8, bandH * 0.17, tagline, palette);
  }
  ctx.restore();
}

// A shared noise tile for the print grain laid over the finished cover.
let grainTile = null;
function getGrainTile() {
  if (grainTile) return grainTile;
  grainTile = document.createElement('canvas');
  grainTile.width = 128;
  grainTile.height = 128;
  const gtx = grainTile.getContext('2d');
  const data = gtx.createImageData(128, 128);
  let seed = 42;
  for (let i = 0; i < data.data.length; i += 4) {
    seed = (seed * 16807) % 2147483647;
    const v = 118 + (seed % 120);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  gtx.putImageData(data, 0, 0);
  return grainTile;
}

/** Lays print grain and a vignette over the whole cover for a finished-poster feel. */
function finishCover(ctx, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.globalCompositeOperation = 'overlay';
  const pattern = ctx.createPattern(getGrainTile(), 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.78);
  vig.addColorStop(0, 'rgba(10, 4, 20, 0)');
  vig.addColorStop(1, 'rgba(10, 4, 20, 0.30)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * Renders the whole cover described by `state` onto `canvas` at the canvas's own size.
 * `photos` is the list of loaded images the panels point into.
 */
export function renderCover(canvas, state, photos) {
  syncPanels(state);
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const palette = PALETTES[state.grade];
  // Paper-white ground: the gutters between panels and the frame around them.
  ctx.fillStyle = '#f7f1e3';
  ctx.fillRect(0, 0, w, h);
  paintTitleBand(ctx, w, h, palette, state.titleStyle ?? 'gradient');
  const gutter = Math.max(5, Math.round(w * 0.007));
  const rects = panelRects(state.template, w, h);
  rects.forEach((rect, i) => {
    const inset = {
      x: rect.x + gutter / 2,
      y: rect.y + gutter / 2,
      w: rect.w - gutter,
      h: rect.h - gutter,
    };
    if (i === 0) inset.y = rect.y + gutter; // the hero panel clears the band's accent line
    paintPanel(ctx, inset, state.panels[i], photos, state.grade, i);
    // An ink keyline inside each panel's edge, so the collage reads as printed plates, not tiles.
    ctx.save();
    ctx.strokeStyle = palette.ink;
    ctx.globalAlpha = 0.30;
    ctx.lineWidth = Math.max(2, Math.round(w * 0.0022));
    ctx.strokeRect(inset.x, inset.y, inset.w, inset.h);
    ctx.restore();
  });
  letterCaption(ctx, w, h, state, palette);
  finishCover(ctx, w, h);
}

/** Renders the cover onto a fresh offscreen canvas at an exact export size and returns it. */
export function renderCoverAt(state, photos, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  renderCover(canvas, state, photos);
  return canvas;
}

/** Exports the cover at the square post size, 1080 x 1080. */
export function exportSquareCover(state, photos) {
  return renderCoverAt(state, photos, 1080, 1080);
}

/** Exports the cover at the portrait post size, 1080 x 1350. */
export function exportPortraitCover(state, photos) {
  return renderCoverAt(state, photos, 1080, 1350);
}

/** Exports the cover at the landscape post size, 1920 x 1080 — the size that fills a wide frame. */
export function exportLandscapeCover(state, photos) {
  return renderCoverAt(state, photos, 1920, 1080);
}
