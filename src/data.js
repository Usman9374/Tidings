// Design data for Tidings — paper geometry, cut-out objects, machines and the
// seed copy. Lifted verbatim from the Claude Design export: these numbers were
// measured off the real photographs, so treat them as the design's source of
// truth and change them only deliberately.

const A = 'uploads/tidings/';

const SEED_FRONT = `Dear Amal,

The rain came in off the sea this morning and did not stop, so I stayed in and wrote to you instead of going out. There is a particular kind of quiet that only arrives with weather, and I wanted to hand you some of it.

I have been keeping the small things for you: the bakery on the corner that opens at six, the tram that never quite comes on time, the way the light lands on the kitchen table at four. None of it is news. All of it is yours.

Write back when you can. I will keep the kettle on.

Yours,
Rae`;

const SEED_BACK = `P.S. — I found the photograph you were looking for. It was taped inside the front cover the whole time, exactly where you left it.`;

const SEED_TW = `TIDINGS, NO. 1
Typed on a machine, sent as a letter.
`;

// Paper geometry measured off the real files: pitch / first rule / margin are
// percentages of the surface WIDTH, so every value is written in cqw and the

const SURFACES = {
  // a letter, not a school page: letter proportions and generous margins
  page: [
    { id: 'cream', label: 'cream', img: A + 'page2.jpeg', aspect: 1.294, maxW: 620, pad: [11, 12, 10, 12], lh: 3.1, fs: 2.05, rule: 'none', fit: 'cover' },
    { id: 'ruled', label: 'feint ruled', img: A + 'page2.jpeg', aspect: 1.294, maxW: 620, pad: [11, 12, 10, 12], lh: 3.1, fs: 2.05, rule: 'drawn', fit: 'cover' },
    { id: 'ivory', label: 'ivory', img: A + 'page3.jpeg', aspect: 1.294, maxW: 620, pad: [11, 12, 10, 12], lh: 3.1, fs: 2.05, rule: 'none', fit: 'cover' },
    { id: 'stars', label: 'star paper', img: 'assets/paper-stars.jpg', aspect: 1.294, maxW: 620, pad: [11, 12, 10, 12], lh: 3.1, fs: 2.05, rule: 'none', fit: 'cover' },
    { id: 'notebook', label: 'notebook', img: A + 'page1.jpeg', aspect: 1.3699, maxW: 620, pad: [6.26, 7, 6, 14.5], lh: 3.1613, fs: 2.15, rule: 'none', fit: 'fill', margin: 11.473 },
  ],
  // the diary is the cut-out book itself — frame runs x 153–1114, y 270–1217 of 1280²
  diary: [
    { id: 'dot', label: 'dot grid', img: 'assets/notebook-open.png', aspect: 0.9854, maxW: 860, pad: [5.87, 3.77, 26.08, 5.66], lh: 3.49, fs: 2.29, rule: 'none', fit: 'fill', cols: 2, gap: 7.19, crop: { w: 133.2, l: -15.92, t: -28.1 }, cut: true },
    { id: 'ruled', label: 'ruled', img: 'assets/notebook-open.png', aspect: 0.9854, maxW: 860, pad: [5.87, 3.77, 26.08, 5.66], lh: 3.49, fs: 2.29, rule: 'drawn', fit: 'fill', cols: 2, gap: 7.19, crop: { w: 133.2, l: -15.92, t: -28.1 }, cut: true },
    { id: 'lined', label: 'lined', img: A + 'notebookview2.jpeg', aspect: 0.7306, maxW: 860, pad: [5.02, 6, 6, 6], lh: 3.538, fs: 1.95, rule: 'none', fit: 'fill', cols: 2, gap: 6 },
  ],
  postcard: [
    { id: 'cream', label: 'cream', img: A + 'page2.jpeg', aspect: 0.65, maxW: 780, pad: [8, 53, 7, 6], lh: 2.9, fs: 1.9, rule: 'none', fit: 'cover', card: true },
    { id: 'wide', label: 'wide ruled', img: A + 'notebooklines.jpeg', aspect: 0.6286, maxW: 780, pad: [6.16, 53, 6, 6], lh: 3.2299, fs: 2.05, rule: 'none', fit: 'fill', card: true },
    { id: 'ivory', label: 'ivory', img: A + 'page3.jpeg', aspect: 0.65, maxW: 780, pad: [8, 53, 7, 6], lh: 2.9, fs: 1.9, rule: 'drawn', fit: 'cover', card: true },
  ],
};

// Every object below is a real cut-out lifted from the board and knocked out
// to true transparency — nothing here is a drawn icon.
const OBJECTS = {
  starGold: { src: 'assets/star-01.png', w: 9, title: 'gold star' },
  star02: { src: 'assets/star-02.png', w: 9, title: 'star' },
  starRed: { src: 'assets/star-04.png', w: 9, title: 'red star' },
  star05: { src: 'assets/star-05.png', w: 9, title: 'star' },
  starEmber: { src: 'assets/star-07.png', w: 9, title: 'ember star' },
  star09: { src: 'assets/star-09.png', w: 9, title: 'star' },
  starYellow: { src: 'assets/star-11.png', w: 9, title: 'yellow star' },
  star12: { src: 'assets/star-12.png', w: 9, title: 'star' },
  starBlue: { src: 'assets/star-13.png', w: 9, title: 'iridescent star' },
  starPearl: { src: 'assets/star-16.png', w: 9, title: 'pearl star' },
  cardFloral: { src: 'assets/sm/card-floral.png', w: 20, title: 'floral card' },
  envelopeMini: { src: 'assets/sm/envelope-floral.png', w: 14, title: 'little envelope' },
  goldfish: { src: 'assets/sm/fish-goldfish.png', w: 17, title: 'goldfish' },
  jellyfish: { src: 'assets/sm/jellyfish.png', w: 12, title: 'jellyfish' },
  sealSun: { src: 'assets/sm/seal-sun.png', w: 11, title: 'sun wax seal' },
  sealFlower: { src: 'assets/sm/seal-flower.png', w: 11, title: 'flower wax seal' },
  stampNippon: { src: 'assets/sm/stamp-nippon.png', w: 11, title: 'nippon 62 · goldfish' },
  stampMalta: { src: 'assets/sm/stamp-malta.png', w: 10, title: 'malta 8c · pomegranate' },
};

const TRAY_ORDER = ['starGold', 'star02', 'starRed', 'star05', 'starEmber', 'star09', 'starYellow', 'star12', 'starBlue', 'starPearl', 'goldfish', 'jellyfish', 'sealSun', 'sealFlower', 'stampNippon', 'stampMalta', 'envelopeMini', 'cardFloral', 'polaroid', 'own'];

const SEAL_CHOICES = ['sealSun', 'sealFlower', 'none'];

// 1px transparent — for the objects that are drawn frames rather than photos
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const STAMPS = {
  JAPAN: [{ obj: 'stampNippon', value: '¥62' }, { obj: 'stampMalta', value: '¥110' }],
  MALTA: [{ obj: 'stampMalta', value: '8¢' }, { obj: 'stampNippon', value: '€0.19' }],
  PAKISTAN: [{ obj: 'stampNippon', value: 'RS 40' }, { obj: 'stampMalta', value: 'RS 75' }],
  'UNITED KINGDOM': [{ obj: 'stampMalta', value: '1ST' }, { obj: 'stampNippon', value: '2ND' }],
};

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


// Two machines, each with its key grid measured off its own photograph and its
// own paper geometry, so the sheet feeds out of the platen rather than floating.
const MACHINES = {
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
  night: {
    label: 'the night machine', src: 'assets/typewriter-night.png',
    asm: 1.0828, machineAspect: 0.7228,
    sheet: { left: 10, width: 80, aspect: 0.5, top: 5, bottom: 9 },
    space: { x: 55.92, y: 93.06, w: 46, h: 2.6 },
    rows: [
      { y: 61.18, start: 25.638, pitch: 6.422, keys: ['2', '3', '4', '5', '6', '7', '8', '9', '0', '-'] },
      { y: 69.88, start: 23.385, pitch: 6.316, keys: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'] },
      { y: 79.06, start: 25.638, pitch: 6.121, keys: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';'] },
      { y: 86.59, start: 28.403, pitch: 6.28, keys: ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '?', '.', '/'] },
    ],
    keyW: 4.6,
  },
};



export const keyMapFor = (id) => {
  const M = MACHINES[id] || MACHINES.olympia;
  const m = {};
  M.rows.forEach((r) => r.keys.forEach((k, i) => { m[k] = { x: r.start + i * r.pitch, y: r.y }; }));
  m[' '] = { x: M.space.x, y: M.space.y, wide: true };
  return m;
};

export const words = (t) => (t || '').trim().split(/\s+/).filter(Boolean).length;

export {
  A, SEED_FRONT, SEED_BACK, SEED_TW, SURFACES, OBJECTS, TRAY_ORDER,
  SEAL_CHOICES, BLANK, STAMPS, FORMATS, SKELETONS, DESKS, MACHINES,
};
