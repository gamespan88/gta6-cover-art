// VICE FRAME — Cover Lab: a working gta6-cover-art-01 entry (Node 22, standard library only).
// The app is this directory's app/ folder, plain static files a desktop browser loads offline
// (app/index.html and its ES modules, no library and no network request), and this program hands it
// in: it copies app/ and screenshots/ from beside this file to /output and writes /output/dossier.json,
// the summary the judge reads, with the vendored make.fun library.
//
// The app itself: a multi-panel GTA-style cover maker. A person's own photos fill a collage of panels
// (seven layouts), each panel cropped, panned and zoomed, graded Sunset / Neon Nights / Heatwave /
// Ultraviolet / Duotone Ink / Halftone Print / Raw, lettered with a story title, its tagline and a
// neon script line, and exported as a PNG at 1080 x 1080, 1080 x 1350 or 1920 x 1080. Its lettering
// is Anton (SIL Open Font License, vendored under app/fonts/) and every ornament on the cover — the
// retro sun, the palm silhouettes, the skyline — is drawn by its own canvas code: no Rockstar Games
// logo, artwork or font anywhere.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const APP_TITLE = 'Vice Frame — Cover Lab';

// The gate's screenshot caps, checked here first so a bad capture fails this program with a plain
// message instead of reaching the scorer: 3 or 4 shots, each a PNG or JPEG of at most 256 KiB whose
// long side is at most 1280 px and whose short side is at least 480 px. JPEG dimensions are read from
// the SOF marker and PNG dimensions from the IHDR chunk, so no image library is needed.
function imageSize(path: string): { width: number; height: number } {
  const bytes = readFileSync(path);
  if (bytes.length > 24 && bytes[0] === 0x89 && bytes[1] === 0x50) {
    // PNG: the IHDR chunk after the 8-byte signature holds width and height as big-endian u32s.
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (bytes.length > 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    // JPEG: walk the markers to a start-of-frame segment, whose payload is precision, height, width.
    let at = 2;
    while (at + 9 < bytes.length) {
      if (bytes[at] !== 0xff) { at += 1; continue; }
      const marker = bytes[at + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { width: bytes.readUInt16BE(at + 7), height: bytes.readUInt16BE(at + 5) };
      }
      at += 2 + bytes.readUInt16BE(at + 2);
    }
  }
  throw new Error(`${APP_TITLE}: ${path} is not a PNG or JPEG screenshot`);
}

/** Refuses the run, naming the shot, when screenshots/ breaks a cap the gate would refuse it for. */
function checkScreenshots(dir: string): void {
  const shots = readdirSync(dir).filter((name) => !name.startsWith('.')).sort();
  if (shots.length < 3 || shots.length > 4) {
    throw new Error(`${APP_TITLE}: screenshots/ holds ${shots.length} shots; the gate wants 3 or 4`);
  }
  for (const name of shots) {
    const path = join(dir, name);
    const bytes = statSync(path).size;
    if (bytes > 262144) throw new Error(`${APP_TITLE}: ${name} is ${bytes} bytes; the cap is 262144`);
    const { width, height } = imageSize(path);
    const long = Math.max(width, height);
    const short = Math.min(width, height);
    if (long > 1280 || short < 480) {
      throw new Error(`${APP_TITLE}: ${name} is ${width}x${height}; long side at most 1280, short side at least 480`);
    }
  }
}

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
checkScreenshots(join(out, 'screenshots'));
console.log(`${APP_TITLE}: app and ${readdirSync(join(out, 'screenshots')).length} screenshots handed in`);

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files, in all, or a path under app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
