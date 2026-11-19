// Fixed scenes for screenshots, driven by the page's query string:
//   ?shot=cover&photo=pier&caption=Sunset%20Heist   the cover alone, filling the stage
//   ?shot=editor&photo=boulevard                    the editor with that sample loaded
// `photo` names a bundled sample (samples/<photo>.jpg) or a comma list of them — a list is dealt
// across the panels in order, a different photo in each panel. `caption` sets the cover's words, the
// optional `grade`, `subtitle`, `template` and `title` params restyle the scene, and an editor scene
// also loads every sample it did not place into the tray. window.__shotReady is set once the scene
// has painted, fonts included, so a screenshot never catches a half-drawn cover.

// The bundled samples, in the order the editor's own boot loads them into the tray.
const SAMPLE_NAMES = ['pier', 'boulevard', 'neon', 'drive', 'pool'];

export async function runShot(shot, query, helpers) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (shot === 'editor') document.body.classList.add('shot-editor');
  const photoParam = query.get('photo') ?? 'pier';
  await helpers.loadSample(photoParam, query.get('caption') ?? 'Sunset Heist', query.get('grade'));
  if (shot === 'editor') {
    const placed = new Set(photoParam.split(',').map((s) => s.trim()));
    for (const name of SAMPLE_NAMES) {
      if (!placed.has(name)) await helpers.addSampleToTray(name);
    }
    helpers.redraw();
  }
  try {
    await document.fonts.ready;
  } catch {
    // Painting proceeds regardless; the font wait is a courtesy to the screenshot.
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
