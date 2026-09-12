// The letter fonts — Google Fonts, self-hosted through @fontsource. Their
// @font-face rules live in fontFaces.js, which loads on demand as its own
// chunk; Courier Prime is already in tokens.css and stays the default.
//
// Fonts differ in x-height and in where the baseline sits inside a line, so
// each one is fitted to Courier Prime before it is used: a size factor so the
// letters read at the same size, and a vertical shift so the baseline lands
// where Courier Prime's does — on the paper's photographed rules.

const HAND = 'cursive';
const SERIF = 'Georgia, serif';
const MONO = 'ui-monospace, monospace';
const SANS = 'system-ui, sans-serif';

const font = (id, name, group, fallback) => ({ id, label: name, group, family: `'${name}', ${fallback}` });

export const FONT_GROUPS = ['Handwriting', 'Script', 'Serif', 'Typewriter', 'Sans'];

export const LETTER_FONTS = [
  font('caveat', 'Caveat', 'Handwriting', HAND),
  font('kalam', 'Kalam', 'Handwriting', HAND),
  font('patrick-hand', 'Patrick Hand', 'Handwriting', HAND),
  font('indie-flower', 'Indie Flower', 'Handwriting', HAND),
  font('shadows-into-light', 'Shadows Into Light', 'Handwriting', HAND),
  font('homemade-apple', 'Homemade Apple', 'Handwriting', HAND),
  font('reenie-beanie', 'Reenie Beanie', 'Handwriting', HAND),
  font('nothing-you-could-do', 'Nothing You Could Do', 'Handwriting', HAND),
  font('cedarville-cursive', 'Cedarville Cursive', 'Handwriting', HAND),
  font('la-belle-aurore', 'La Belle Aurore', 'Handwriting', HAND),

  font('dancing-script', 'Dancing Script', 'Script', HAND),
  font('great-vibes', 'Great Vibes', 'Script', HAND),
  font('parisienne', 'Parisienne', 'Script', HAND),
  font('sacramento', 'Sacramento', 'Script', HAND),
  font('allura', 'Allura', 'Script', HAND),
  font('pinyon-script', 'Pinyon Script', 'Script', HAND),
  font('tangerine', 'Tangerine', 'Script', HAND),
  font('satisfy', 'Satisfy', 'Script', HAND),
  font('yellowtail', 'Yellowtail', 'Script', HAND),
  font('kaushan-script', 'Kaushan Script', 'Script', HAND),

  font('eb-garamond', 'EB Garamond', 'Serif', SERIF),
  font('cormorant-garamond', 'Cormorant Garamond', 'Serif', SERIF),
  font('libre-baskerville', 'Libre Baskerville', 'Serif', SERIF),
  font('lora', 'Lora', 'Serif', SERIF),
  font('playfair-display', 'Playfair Display', 'Serif', SERIF),
  font('crimson-pro', 'Crimson Pro', 'Serif', SERIF),
  font('old-standard-tt', 'Old Standard TT', 'Serif', SERIF),
  font('im-fell-english', 'IM Fell English', 'Serif', SERIF),
  font('vollkorn', 'Vollkorn', 'Serif', SERIF),
  font('bitter', 'Bitter', 'Serif', SERIF),

  font('courier-prime', 'Courier Prime', 'Typewriter', MONO),
  font('special-elite', 'Special Elite', 'Typewriter', MONO),
  font('cutive-mono', 'Cutive Mono', 'Typewriter', MONO),
  font('ibm-plex-mono', 'IBM Plex Mono', 'Typewriter', MONO),
  font('space-mono', 'Space Mono', 'Typewriter', MONO),

  font('josefin-sans', 'Josefin Sans', 'Sans', SANS),
  font('quicksand', 'Quicksand', 'Sans', SANS),
  font('nunito', 'Nunito', 'Sans', SANS),
  font('libre-franklin', 'Libre Franklin', 'Sans', SANS),
  font('alegreya-sans', 'Alegreya Sans', 'Sans', SANS),
];

export const DEFAULT_FONT = 'courier-prime';

const BY_ID = Object.fromEntries(LETTER_FONTS.map((f) => [f.id, f]));
export const fontById = (id) => BY_ID[id] || BY_ID[DEFAULT_FONT];

let faces = null;
export function loadFaces() {
  if (!faces) faces = import('./fontFaces.js').catch((err) => { faces = null; throw err; });
  return faces;
}

// Canvas metrics at 100px: `m` is where the baseline sits relative to the
// middle of a line (half of ascent − descent, per em), `xh` the x-height per em.
const metrics = new Map();
let ctx = null;

function measure(family) {
  ctx = ctx || document.createElement('canvas').getContext('2d');
  ctx.font = `100px ${family}`;
  const t = ctx.measureText('x');
  if (!t.fontBoundingBoxAscent || !t.actualBoundingBoxAscent) return null;
  return { m: (t.fontBoundingBoxAscent - t.fontBoundingBoxDescent) / 200, xh: t.actualBoundingBoxAscent / 100 };
}

export async function prepareFont(f) {
  if (metrics.has(f.id)) return metrics.get(f.id);
  const ref = BY_ID[DEFAULT_FONT];
  if (f.id !== DEFAULT_FONT) await loadFaces();
  await Promise.all([document.fonts.load(`100px ${ref.family}`, 'x'), document.fonts.load(`100px ${f.family}`, 'x')]);
  // Only cache a measurement that worked. Caching a null one meant a face that
  // lost its loading race once was never measured again for the rest of the
  // session — it simply stayed unfitted, at k = 1 and dy = 0.
  if (!metrics.has(ref.id)) { const r = measure(ref.family); if (r) metrics.set(ref.id, r); }
  const m = measure(f.family);
  if (m) metrics.set(f.id, m);
  return m;
}

export const prepareAll = () => Promise.all(LETTER_FONTS.map((f) => prepareFont(f).catch(() => null)));

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// How to set a font on paper whose type size is `fs` cqw: the size factor k,
// and dy, the cqw the text box moves down so the baseline matches Courier
// Prime's (with line-height L the baseline sits L/2 + size × m below a line's top).
export function fontFit(id, fs) {
  const ref = metrics.get(DEFAULT_FONT);
  const f = metrics.get(id);
  if (id === DEFAULT_FONT || !ref || !f) return { k: 1, dy: 0 };
  const k = clamp(ref.xh / f.xh, 0.5, 1.4);
  return { k, dy: fs * (ref.m - f.m * k) };
}

// The same size factor for the Font menu's previews (1 until measured).
export function previewScale(id) {
  const ref = metrics.get(DEFAULT_FONT);
  const f = metrics.get(id);
  return ref && f ? clamp(ref.xh / f.xh, 0.6, 1.4) : 1;
}
