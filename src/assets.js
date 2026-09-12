// The design's picture library — papers, books, envelopes, machines, cut-outs
// and the 47 backdrops — lives in public/ under exactly the paths the design
// data refers to (`assets/paper/p-roses.jpg`, `uploads/tidings/page2.jpeg`).
//
// Serving it from public/ rather than importing it is deliberate: ~230 photographs
// and cut-outs, 26 MB of them, never enter the module graph, so dev start and
// `vite build` stay instant, the browser fetches only the handful an open drawer
// actually shows, and adding art is dropping a file in and naming it in data.js.
// (The eighteen woff2 letter faces stay in src/assets — tokens.css points at them.)

const BASE = import.meta.env.BASE_URL || '/';

// Resolve a logical path to its served URL. Anything already a URL — a dropped-in
// photo's blob:, the 1px BLANK data:, an absolute http(s) — passes straight through.
export const R = (p) => {
  if (!p) return p;
  if (/^(?:[a-z]+:|\/\/|\/)/i.test(p)) return p;
  return BASE + p;
};

// What the chooser screens rest on the desk. The letter and the postcard show
// the papers themselves — ruled stars and gold stars — rather than a stack.
export const LETTER_HERO = R('assets/paper/p-stars-ruled.jpg');
export const POSTCARD_HERO = R('assets/paper/p-stars-gold.jpg');
export const DIARY_HERO = R('assets/diary/d-green-blank.png');
export const TYPEWRITER_HERO = R('assets/tw/tw-burgundy.png');
