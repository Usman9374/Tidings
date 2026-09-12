// Design data for Tidings — paper geometry, cut-out objects, envelopes, machines
// and the seed copy. Lifted verbatim from the Claude Design export: these numbers
// were measured off the real photographs, so treat them as the design's source of
// truth and change them only deliberately.
//
// Every `img`/`src` here is a logical path into public/ (see assets.js): a row is
// all it takes to put another photographed paper or cut-out in a drawer.

const A = 'uploads/tidings/';
const P = 'assets/paper/';
const D = 'assets/diary/';
const E = 'assets/env/';
const T = 'assets/tw/';
const S = 'assets/st/';
const BG = 'uploads/backgrounds/';

const SEED_FRONT = `Dear Amal,

The rain came in off the sea this morning and did not stop, so I stayed in and wrote to you instead of going out. The bakery on the corner opens at six now, and the tram is still never on time. None of it is news — all of it is yours.

Write back when you can. I will keep the kettle on.

Yours,
Rae`;

const SEED_BACK = `P.S. — I found the photograph you were looking for. It was taped inside the front cover the whole time, exactly where you left it.`;

const SEED_TW = `TIDINGS, NO. 1
Typed on a machine, sent as a letter.
`;

const SEED_PHOTO = A + 'typewriter1.jpeg';

// Paper geometry measured off the real files: pitch / first rule / margin are
// percentages of the surface WIDTH, so every value is written in cqw and the
// text always lands on the printed rule.
const SURFACES = {
  page: [
    { id: 'cream', label: 'cream', img: A + 'page2.jpeg', aspect: 1.294, maxW: 620, pad: [11, 12, 10, 12], lh: 3.1, fs: 2.05, rule: 'none', fit: 'cover' },
    { id: 'ruled', label: 'feint ruled', img: A + 'page2.jpeg', aspect: 1.294, maxW: 620, pad: [11, 12, 10, 12], lh: 3.1, fs: 2.05, rule: 'drawn', fit: 'cover' },
    { id: 'ivory', label: 'ivory', img: A + 'page3.jpeg', aspect: 1.294, maxW: 620, pad: [11, 12, 10, 12], lh: 3.1, fs: 2.05, rule: 'none', fit: 'cover' },
    { id: 'stars', label: 'star paper', img: 'assets/paper-stars.jpg', aspect: 1.294, maxW: 620, pad: [11, 12, 10, 12], lh: 3.1, fs: 2.05, rule: 'none', fit: 'cover' },
    { id: 'notebook', label: 'school page', img: A + 'page1.jpeg', aspect: 1.3699, maxW: 620, pad: [6.26, 7, 6, 14.5], lh: 3.1613, fs: 2.15, rule: 'none', fit: 'fill', margin: 11.473 },
    { id: 'kraft', label: 'kraft', img: P + 'p-kraft-stack.png', aspect: 1.367, maxW: 580, pad: [12, 11, 15, 11], lh: 3.2, fs: 2.05, rule: 'none', fit: 'fill', cut: true },
    { id: 'roses', label: 'roses', img: P + 'p-roses.jpg', aspect: 1.4107, maxW: 520, pad: [37.4, 9, 54, 26], lh: 7.733, fs: 4.6, rule: 'none', fit: 'fill' },
    { id: 'peanuts', label: 'peanuts', img: P + 'p-peanuts.jpg', aspect: 1.4838, maxW: 560, pad: [34, 9, 20, 9], lh: 3.6, fs: 2.3, rule: 'none', fit: 'fill' },
    { id: 'starsruled', label: 'ruled stars', img: P + 'p-stars-ruled.jpg', aspect: 0.7073, maxW: 860, pad: [7.4, 12, 6, 9], lh: 3.99, fs: 2.5, rule: 'none', fit: 'fill' },
    { id: 'starscrayon', label: 'crayon stars', img: P + 'p-stars-crayon.jpg', aspect: 0.6664, maxW: 860, pad: [10, 11, 9, 10], lh: 3.2, fs: 2.05, rule: 'none', fit: 'fill' },
    { id: 'starspastel', label: 'pastel stars', img: P + 'p-stars-pastel.jpg', aspect: 0.6667, maxW: 860, pad: [12, 14, 11, 13], lh: 3.2, fs: 2.05, rule: 'none', fit: 'fill' },
    { id: 'starsgold', label: 'gold stars', img: P + 'p-stars-gold.jpg', aspect: 0.6664, maxW: 860, pad: [9, 10, 8, 9], lh: 3.2, fs: 2.05, rule: 'none', fit: 'fill' },
    { id: 'cinnamon', label: 'pink frame', img: P + 'p-cinnamon.jpg', aspect: 0.7467, maxW: 820, pad: [14, 17, 14, 17], lh: 3.2, fs: 2.05, rule: 'none', fit: 'fill' },
    { id: 'cardgold', label: 'gold border', img: P + 'p-card-gold.jpg', aspect: 0.6837, maxW: 700, pad: [11, 11, 10, 11], lh: 3.1, fs: 2.0, rule: 'none', fit: 'fill' },
    { id: 'cardbow', label: 'bow card', img: P + 'p-card-bow.png', aspect: 0.7112, maxW: 660, pad: [27, 13, 11, 13], lh: 3.2, fs: 2.05, rule: 'none', fit: 'fill', cut: true },
    { id: 'thankyou', label: 'thank you', img: P + 'p-card-thankyou.png', aspect: 0.7429, maxW: 680, pad: [21, 14, 22, 14], lh: 3.1, fs: 2.0, rule: 'none', fit: 'fill', cut: true },
    { id: 'noteyellow', label: 'yellow note', img: P + 'p-note-yellow.png', aspect: 0.6912, maxW: 680, pad: [11, 13, 13, 11], lh: 3.3, fs: 2.1, rule: 'none', fit: 'fill', cut: true },
    { id: 'indexcard', label: 'index card', img: P + 'p-index-card.png', aspect: 0.7086, maxW: 660, pad: [8.2, 11, 10, 22], lh: 6.0, fs: 3.7, rule: 'none', fit: 'fill', cut: true },
  ],
  // the diary is the cut-out book itself — frame runs x 153–1114, y 270–1217 of 1280²
  diary: [
    { id: 'dot', label: 'dot grid', img: 'assets/notebook-open.png', aspect: 0.9854, maxW: 860, pad: [5.87, 3.77, 26.08, 5.66], lh: 3.49, fs: 2.29, rule: 'none', fit: 'fill', cols: 2, gap: 7.19, crop: { w: 133.2, l: -15.92, t: -28.1 }, cut: true },
    { id: 'dotruled', label: 'dot grid, ruled', img: 'assets/notebook-open.png', aspect: 0.9854, maxW: 860, pad: [5.87, 3.77, 26.08, 5.66], lh: 3.49, fs: 2.29, rule: 'drawn', fit: 'fill', cols: 2, gap: 7.19, crop: { w: 133.2, l: -15.92, t: -28.1 }, cut: true },
    { id: 'lined', label: 'lined', img: A + 'notebookview2.jpeg', aspect: 0.7306, maxW: 860, pad: [5.02, 6, 6, 6], lh: 3.538, fs: 1.95, rule: 'none', fit: 'fill', cols: 2, gap: 6 },
    { id: 'creamruled', label: 'cream ruled', img: D + 'd-ruled-cream.jpg', aspect: 0.6667, maxW: 980, pad: [5.6, 7, 6, 7], lh: 2.606, fs: 1.69, rule: 'none', fit: 'fill', cols: 2, gap: 6 },
    { id: 'vintage', label: 'vintage', img: D + 'd-vintage-blank.jpg', aspect: 0.8617, maxW: 900, pad: [8, 9, 9, 9], lh: 3.0, fs: 1.9, rule: 'none', fit: 'fill', cols: 2, gap: 7 },
    { id: 'greenbook', label: 'green book', img: D + 'd-green-blank.png', aspect: 0.6161, maxW: 980, pad: [6.5, 11, 6.5, 11], lh: 2.9, fs: 1.85, rule: 'none', fit: 'fill', cols: 2, gap: 9, cut: true },
    { id: 'redspiral', label: 'red spiral', img: D + 'd-red-spiral.jpg', aspect: 0.6368, maxW: 900, pad: [8, 8, 8, 54], lh: 3.0, fs: 1.9, rule: 'none', fit: 'fill' },
    { id: 'spiral', label: 'spiral pad', img: D + 'd-spiral-blue.png', aspect: 1.3326, maxW: 540, pad: [9.5, 8, 9, 17], lh: 4.241, fs: 2.63, rule: 'none', fit: 'fill', cut: true },
    { id: 'clipboard', label: 'clipboard', img: D + 'd-clipboard.png', aspect: 1.512, maxW: 500, pad: [31, 15, 13, 15], lh: 3.6, fs: 2.25, rule: 'none', fit: 'fill', cut: true },
  ],
  // the post card is the original: a plain card, its own drawn divider and
  // address rules — just more papers to choose from
  postcard: [
    { id: 'cream', label: 'cream', img: A + 'page2.jpeg', aspect: 0.65, maxW: 780, pad: [8, 53, 7, 6], lh: 2.9, fs: 1.9, rule: 'none', fit: 'cover', card: true },
    { id: 'wide', label: 'wide ruled', img: A + 'notebooklines.jpeg', aspect: 0.6286, maxW: 780, pad: [6.16, 53, 6, 6], lh: 3.2299, fs: 2.05, rule: 'none', fit: 'fill', card: true },
    { id: 'ivory', label: 'ivory', img: A + 'page3.jpeg', aspect: 0.65, maxW: 780, pad: [8, 53, 7, 6], lh: 2.9, fs: 1.9, rule: 'drawn', fit: 'cover', card: true },
    { id: 'stars', label: 'star paper', img: 'assets/paper-stars.jpg', aspect: 0.65, maxW: 780, pad: [8, 53, 7, 6], lh: 2.9, fs: 1.9, rule: 'none', fit: 'cover', card: true },
    { id: 'kraft', label: 'kraft', img: P + 'p-kraft-stack.png', aspect: 0.65, maxW: 780, pad: [8, 53, 7, 6], lh: 2.9, fs: 1.9, rule: 'none', fit: 'cover', card: true },
    { id: 'gold', label: 'gold border', img: P + 'p-card-gold.jpg', aspect: 0.6837, maxW: 780, pad: [10, 53, 9, 9], lh: 2.9, fs: 1.9, rule: 'none', fit: 'fill', card: true },
    { id: 'goldstars', label: 'gold stars', img: P + 'p-stars-gold.jpg', aspect: 0.6664, maxW: 780, pad: [8, 53, 7, 8], lh: 2.9, fs: 1.9, rule: 'none', fit: 'fill', card: true },
    { id: 'pastel', label: 'pastel stars', img: P + 'p-stars-pastel.jpg', aspect: 0.6667, maxW: 780, pad: [10, 53, 9, 11], lh: 2.9, fs: 1.9, rule: 'none', fit: 'fill', card: true },
    { id: 'crayon', label: 'crayon stars', img: P + 'p-stars-crayon.jpg', aspect: 0.6664, maxW: 780, pad: [9, 53, 8, 9], lh: 2.9, fs: 1.9, rule: 'none', fit: 'fill', card: true },
    { id: 'ruledstars', label: 'ruled stars', img: P + 'p-stars-ruled.jpg', aspect: 0.7073, maxW: 780, pad: [7.4, 53, 6, 9], lh: 3.99, fs: 2.4, rule: 'none', fit: 'fill', card: true },
    { id: 'yellow', label: 'yellow', img: P + 'p-note-yellow.png', aspect: 0.6912, maxW: 780, pad: [9, 53, 10, 9], lh: 2.9, fs: 1.9, rule: 'none', fit: 'fill', card: true, cut: true },
  ],
};

// Every object below is a real cut-out lifted from the board and knocked out
// to true transparency — nothing here is a drawn icon. `w` is its width in cqw
// of the sheet it is dropped on.
const OBJECTS = {
  cardFloral: { src: 'assets/sm/card-floral.png', w: 20, title: 'floral card', group: 'paper' },
  envelopeMini: { src: 'assets/sm/envelope-floral.png', w: 14, title: 'little envelope', group: 'paper' },
  goldfish: { src: 'assets/sm/fish-goldfish.png', w: 17, title: 'goldfish', group: 'paper' },
  jellyfish: { src: 'assets/sm/jellyfish.png', w: 12, title: 'jellyfish', group: 'paper' },
  sealSun: { src: 'assets/sm/seal-sun.png', w: 11, title: 'sun wax seal', group: 'seals' },
  sealFlower: { src: 'assets/sm/seal-flower.png', w: 11, title: 'flower wax seal', group: 'seals' },
  stampNippon: { src: 'assets/sm/stamp-nippon.png', w: 11, title: 'nippon 62 · goldfish', group: 'stamps' },
  stampMalta: { src: 'assets/sm/stamp-malta.png', w: 10, title: 'malta 8c · pomegranate', group: 'stamps' },
};

const add = (key, src, w, title, group) => { OBJECTS[key] = { src, w, title, group }; return key; };

// The tray's seven trays, filled from the cut-out sets on the board.
const GROUPS = { foil: [], confetti: [], folded: [], seals: [], stamps: [], charms: [], paper: ['cardFloral', 'envelopeMini', 'goldfish', 'jellyfish'] };

'01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16'.split(' ').forEach((n) => {
  GROUPS.foil.push(add('foil' + n, 'assets/star-' + n + '.png', 9, 'foil star', 'foil'));
});
for (let i = 1; i <= 14; i += 1) {
  const n = String(i).padStart(2, '0');
  GROUPS.confetti.push(add('gold' + n, S + 'star-gold-' + n + '.png', 8, 'gold confetti star', 'confetti'));
}
for (let i = 1; i <= 8; i += 1) {
  const n = String(i).padStart(2, '0');
  GROUPS.confetti.push(add('conf' + n, S + 'star-foil-' + n + '.png', 8, 'gold star', 'confetti'));
}
for (let i = 1; i <= 14; i += 1) {
  const n = String(i).padStart(2, '0');
  GROUPS.folded.push(add('paper' + n, S + 'star-paper-' + n + '.png', 10, 'folded paper star', 'folded'));
}
[['anemone-wine', 'anemone wax seal'], ['rose-burgundy', 'wild rose seal'], ['rose-bronze', 'bronze rosebud seal'], ['rose-crimson', 'crimson rose seal'],
  ['boot-blue', 'blue boot seal'], ['sun-gold', 'gold sun seal'], ['sprig-olive', 'olive sprig seal'], ['bloom-pink', 'pink bloom seal'],
  ['saturn-lilac', 'lilac saturn seal'], ['lily-sage', 'lily of the valley seal'], ['moon-navy', 'navy moon seal'], ['bow-blush', 'blush bow seal'],
  ['muse-rust', 'rust muse seal'], ['crown-wine', 'wine crown seal'], ['tree-green', 'green tree seal'], ['moth-gold', 'gold moth seal']]
  .forEach(([n, t]) => { GROUPS.seals.push(add('seal_' + n.replace(/-/g, '_'), S + 'seal-' + n + '.png', 11, t, 'seals')); });
['sealSun', 'sealFlower'].forEach((k) => GROUPS.seals.push(k));
[['wave-brown', 'cancel wave'], ['wave-red', 'red cancel wave'], ['wave-ink', 'ink cancel wave'], ['hatch-gold', 'gold hatch'],
  ['wave-thin', 'thin cancel wave'], ['ref-box', 'reference no.'], ['address-box', 'name · address · date'], ['postmark-ink', 'postmark'],
  ['no-circle', 'no. 123456'], ['ref-circle', 'reference ring'], ['airmail', 'air mail'], ['blank-box', 'blank box']]
  .forEach(([n, t]) => { GROUPS.stamps.push(add('mark_' + n.replace(/-/g, '_'), S + 'mark-' + n + '.png', n === 'airmail' || n === 'ref-box' || n === 'address-box' || n === 'blank-box' ? 15 : 17, t, 'stamps')); });
['stampNippon', 'stampMalta'].forEach((k) => GROUPS.stamps.push(k));
'03 04 05 06 07 08 09 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 27 28 29 30 31'.split(' ').forEach((n) => {
  GROUPS.charms.push(add('charm' + n, S + 'charm-' + n + '.png', 11, 'die-cut charm', 'charms'));
});

const STICKER_TABS = [
  { id: 'foil', label: 'Foil stars' },
  { id: 'confetti', label: 'Confetti' },
  { id: 'folded', label: 'Paper stars' },
  { id: 'seals', label: 'Wax seals' },
  { id: 'stamps', label: 'Stamps & marks' },
  { id: 'charms', label: 'Charms' },
  { id: 'paper', label: 'Paper things' },
];

// What may be pressed into the envelope's wax.
const SEAL_CHOICES = GROUPS.seals.concat(['none']);

// 1px transparent — for the objects that are drawn frames rather than photos
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// Each envelope carries its own geometry, as percentages of its own width:
// where the address block, the stamp and the wax seal sit on that photograph.
// `ink` is only given where the paper is too dark to be written on in ink.
const ENVELOPES = [
  { id: 'plain', label: 'plain', plain: true, aspect: 0.62, addr: [10, 58, 46], stamp: [7, 8, 15], seal: [50, 63, 13] },
  { id: 'cream-open', label: 'cream', img: E + 'env-cream-open.png', aspect: 1.2988, addr: [14, 72, 40], stamp: [10, 50, 16], seal: [50, 70, 15] },
  { id: 'cream-mono', label: 'monogram', img: E + 'env-cream-mono.png', aspect: 1.2521, addr: null, stamp: [9, 40, 15], seal: [50, 66, 13] },
  { id: 'burgundy', label: 'burgundy & gold', img: E + 'env-burgundy-gold.jpg', aspect: 0.6942, addr: [10, 56, 44], ink: '#f0e6d2', stamp: [6, 7, 15], seal: [50, 47, 13] },
  { id: 'red-card', label: 'red', img: E + 'env-red-card.png', aspect: 1.0617, addr: null, stamp: [8, 43, 15], seal: [50, 72, 14] },
  { id: 'red-note', label: 'red, open', img: E + 'env-red-note.png', aspect: 1.2261, addr: null, stamp: [9, 46, 14], seal: [50, 74, 13] },
  { id: 'cream-heart', label: 'red heart', img: E + 'env-cream-heart.png', aspect: 0.9731, addr: null, stamp: [7, 8, 14], seal: [30, 74, 13] },
  { id: 'white-card', label: 'white', img: E + 'env-white-card.png', aspect: 1.1804, addr: null, stamp: [9, 48, 14], seal: [50, 76, 13] },
  { id: 'pink-floral', label: 'pink floral', img: E + 'env-pink-floral.png', aspect: 1.3013, addr: null, stamp: [10, 52, 15], seal: [50, 72, 14] },
  { id: 'pink-note', label: 'pink', img: E + 'env-pink-note.png', aspect: 1.0192, addr: null, stamp: [8, 12, 14], seal: [40, 72, 13] },
];

const STAMPS = {
  JAPAN: [{ obj: 'stampNippon', value: '¥62' }, { obj: 'stampMalta', value: '¥110' }, { obj: 'mark_postmark_ink', value: 'cancelled' }],
  MALTA: [{ obj: 'stampMalta', value: '8¢' }, { obj: 'stampNippon', value: '€0.19' }, { obj: 'mark_airmail', value: 'air mail' }],
  PAKISTAN: [{ obj: 'stampNippon', value: 'RS 40' }, { obj: 'stampMalta', value: 'RS 75' }, { obj: 'mark_no_circle', value: 'no. 123456' }],
  'UNITED KINGDOM': [{ obj: 'stampMalta', value: '1ST' }, { obj: 'stampNippon', value: '2ND' }, { obj: 'mark_ref_circle', value: 'reference' }],
};

// Polaroid frames: base width in cqw of the sheet, and the photo's height / width.
const POLAROID_SHAPES = {
  square: { label: 'Square', w: 20, aspect: 1 },
  portrait: { label: 'Portrait', w: 18, aspect: 1.25 },
  landscape: { label: 'Landscape', w: 24, aspect: 0.72 },
};

// How far a placed sticker or polaroid can be shrunk or enlarged.
const SCALE_LIMITS = [0.4, 3];

const FORMATS = ['love letter', 'holiday letter', 'resignation letter', 'reference letter', 'application letter', 'cover letter', 'job acceptance letter', 'get well letter'];

const SKELETONS = {
  'love letter': 'My dear ,\n\nI have been meaning to tell you\n\n\nYours, always\n',
  'holiday letter': 'Dear all,\n\nThis year we\n\nWishing you a warm and quiet season,\n',
  'resignation letter': 'Dear ,\n\nI am writing to give notice of my resignation from the post of , effective .\n\nThank you for the years.\n\nSincerely,\n',
  'reference letter': 'To whom it may concern,\n\nI have known  for  years, in the capacity of .\n\nI recommend them without reservation.\n\nSincerely,\n',
  'application letter': 'Dear ,\n\nI am writing to apply for the post of , advertised on .\n\nI would welcome the chance to speak with you.\n\nSincerely,\n',
  'cover letter': 'Dear ,\n\nPlease find enclosed my application for .\n\nThank you for your time and consideration.\n\nSincerely,\n',
  'job acceptance letter': 'Dear ,\n\nI am delighted to accept the post of , starting on .\n\nWith thanks,\n',
  'get well letter': 'Dear ,\n\nI was sorry to hear you have been unwell.\n\nRest, and come back slowly.\n\nWith love,\n',
};

const DESKS = ['#f3f2f2', '#efece7', '#e7e6e4', '#eceff0'];

// The Backdrop menu's swatches: the four desk tones, then a few stationery
// colours — kraft, sage, dusk blue, rose and a dark ink.
const BACKDROP_SWATCHES = DESKS.concat(['#e4d9c6', '#dde3d5', '#d5dee6', '#ecd9d9', '#2f2b28']);

// 47 backdrops. Their thumbnails come packed six to a row in four sprite strips
// — 188 KB for the whole grid — so opening the drawer costs one small request
// each and the 5 MB photograph itself is fetched only when one is picked.
const BACKDROP_SPRITE = { w: 54, h: 36, cols: 6, sheet: [324, 72] };
const BACKDROPS = [];
for (let i = 1; i <= 47; i += 1) {
  const strip = Math.floor((i - 1) / 12) + 1;
  const k = (i - 1) % 12;
  BACKDROPS.push({
    id: 'bg' + i,
    img: BG + 'bg' + i + (i === 11 ? '.gif' : '.jpg'),
    sprite: 'assets/bg/sprite-' + strip + '.jpg',
    sx: (k % BACKDROP_SPRITE.cols) * BACKDROP_SPRITE.w,
    sy: Math.floor(k / BACKDROP_SPRITE.cols) * BACKDROP_SPRITE.h,
  });
}

// An uploaded backdrop has to be HD: at least 1280 × 720 on its long and short edge.
const HD_MIN = { long: 1280, short: 720 };

// Each machine carries its own paper geometry, so the sheet feeds out of the
// platen rather than floating; key grids are measured off the photographs.
const MACHINES = {
  burgundy: {
    label: 'the burgundy', src: T + 'tw-burgundy.png',
    asm: 1.3494, machineAspect: 0.7894,
    sheet: { left: 21, width: 60, aspect: 1.294, top: 6, bottom: 36 },
    space: { x: 53, y: 86.3, w: 41, h: 4.5 },
    rows: [
      { y: 53.8, start: 19.8, pitch: 5.96, keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] },
      { y: 62.3, start: 21.2, pitch: 6.0, keys: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'] },
      { y: 70.6, start: 22.7, pitch: 6.02, keys: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'] },
      { y: 78.9, start: 24.8, pitch: 6.02, keys: ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'] },
    ],
    keyW: 4.6,
  },
  olympia: {
    label: 'the olympia', src: 'assets/typewriter-olympia.png',
    asm: 1.328, machineAspect: 1,
    sheet: { left: 19, width: 62, aspect: 0.839, top: 6, bottom: 36 },
    space: { x: 50, y: 81.75, w: 52, h: 3.4 },
    rows: [
      { y: 56.92, start: 22.17, pitch: 4.962, keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] },
      { y: 62.92, start: 24.15, pitch: 5.02, keys: ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P'] },
      { y: 68.5, start: 24.25, pitch: 5.21, keys: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'] },
      { y: 73.42, start: 27.67, pitch: 5.19, keys: ['Y', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '-'] },
    ],
    keyW: 4.3,
  },
  olympiaBlack: {
    label: 'the studio olympia', src: T + 'tw-olympia-black.png',
    asm: 1.5071, machineAspect: 0.8071,
    sheet: { left: 19, width: 62, aspect: 1.294, top: 6, bottom: 17 },
    space: { x: 50, y: 90.5, w: 46, h: 3.2 },
    rows: [
      { y: 56.5, start: 15.5, pitch: 6.34, keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] },
      { y: 63.4, start: 17.6, pitch: 6.34, keys: ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P'] },
      { y: 70.3, start: 19.1, pitch: 6.34, keys: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'] },
      { y: 77.2, start: 20.6, pitch: 6.34, keys: ['Y', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '-'] },
    ],
    keyW: 4.4,
  },
  underwood: {
    label: 'the underwood', src: T + 'tw-underwood.png',
    asm: 1.4206, machineAspect: 0.8006,
    sheet: { left: 22, width: 58, aspect: 1.294, top: 6, bottom: 22 },
    space: { x: 50, y: 90, w: 44, h: 3.4 },
    rows: [
      { y: 64.5, start: 23.5, pitch: 5.6, keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] },
      { y: 71.5, start: 24.8, pitch: 5.6, keys: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'] },
      { y: 78, start: 26.2, pitch: 5.6, keys: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'] },
      { y: 84.5, start: 27.6, pitch: 5.6, keys: ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'] },
    ],
    keyW: 4.2,
  },
  portable: {
    label: 'the portable', src: T + 'tw-portable.png',
    asm: 1.3851, machineAspect: 0.7151,
    sheet: { left: 21, width: 58, aspect: 1.294, top: 6, bottom: 14 },
    space: { x: 50, y: 88, w: 44, h: 3.4 },
    rows: [
      { y: 60.5, start: 19.5, pitch: 6.1, keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] },
      { y: 67.5, start: 20.6, pitch: 6.1, keys: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'] },
      { y: 74.5, start: 22, pitch: 6.1, keys: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'] },
      { y: 81.5, start: 23.4, pitch: 6.1, keys: ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'] },
    ],
    keyW: 4.4,
  },
  antique: {
    label: 'the antique', src: T + 'tw-antique.png',
    asm: 1.2623, machineAspect: 0.7023,
    sheet: { left: 25, width: 51, aspect: 1.294, top: 6, bottom: 22 },
    space: { x: 50, y: 89, w: 40, h: 4 },
    rows: [
      { y: 52, start: 25.5, pitch: 5.2, keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] },
      { y: 62, start: 22.5, pitch: 5.4, keys: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'] },
      { y: 71, start: 24, pitch: 5.4, keys: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'] },
      { y: 80, start: 25.5, pitch: 5.4, keys: ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'] },
    ],
    keyW: 4.6,
  },
  omont: {
    label: 'the omont', src: T + 'tw-omont.png',
    asm: 1.4001, machineAspect: 0.5861,
    sheet: { left: 15.3, width: 71.4, aspect: 1.294, top: 6, bottom: 16 },
    space: { x: 50, y: 92, w: 40, h: 5 },
    rows: [
      { y: 80, start: 18.5, pitch: 5.72, keys: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S'] },
    ],
    keyW: 4.2,
  },
};

// What can be wound into the platen.
const MACHINE_SHEETS = [
  { id: 'cream', label: 'Cream', img: A + 'page2.jpeg' },
  { id: 'ivory', label: 'Ivory', img: A + 'page3.jpeg' },
  { id: 'stars', label: 'Star paper', img: 'assets/paper-stars.jpg' },
  { id: 'kraft', label: 'Kraft', img: P + 'p-kraft-stack.png' },
];

export const keyMapFor = (id) => {
  const M = MACHINES[id] || MACHINES.olympia;
  const m = {};
  M.rows.forEach((r) => r.keys.forEach((k, i) => { m[k] = { x: r.start + i * r.pitch, y: r.y }; }));
  m[' '] = { x: M.space.x, y: M.space.y, wide: true };
  return m;
};

export const words = (t) => (t || '').trim().split(/\s+/).filter(Boolean).length;

// Cut text back to its first n words, keeping the whitespace between them.
export const trimWords = (t, n) => (t || '').split(/(\s+)/).reduce((acc, part) => (words(acc) < n ? acc + part : acc), '');

export {
  SEED_FRONT, SEED_BACK, SEED_TW, SEED_PHOTO, SURFACES, OBJECTS, GROUPS, STICKER_TABS,
  SEAL_CHOICES, BLANK, ENVELOPES, STAMPS, POLAROID_SHAPES, SCALE_LIMITS, FORMATS, SKELETONS,
  DESKS, BACKDROP_SWATCHES, BACKDROPS, BACKDROP_SPRITE, HD_MIN, MACHINES, MACHINE_SHEETS,
};
