// Fixed scenes for screenshots, driven by the page's query string:
//   ?shot=cover&photo=pier&caption=Sunset%20Heist   the cover alone, filling the stage
//   ?shot=editor&photo=boulevard                    the editor with that sample loaded
// `photo` names a bundled sample (samples/<photo>.jpg), `caption` the cover's words, and the optional
// `grade` and `subtitle` params restyle the scene. window.__shotReady is set once the scene has painted,
// fonts included, so a screenshot never catches a half-drawn cover.
export async function runShot(shot, query, helpers) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (shot === 'editor') document.body.classList.add('shot-editor');
  await helpers.loadSample(query.get('photo') ?? 'pier', query.get('caption') ?? 'Sunset Heist', query.get('grade'));
  try {
    await document.fonts.ready;
  } catch {
    // Painting proceeds regardless; the font wait is a courtesy to the screenshot.
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
