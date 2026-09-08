// Every image the app uses, imported so Vite fingerprints and emits it as a
// real file. The keys are the logical paths the design data (data.js) refers
// to, which keeps those tables readable and identical to the original design.
import notebookOpen from './assets/notebook-open.png';
import paperStars from './assets/paper-stars.jpg';
import typewriterOlympia from './assets/typewriter-olympia.png';
import typewriterNight from './assets/typewriter-night.png';

import star01 from './assets/star-01.png';
import star02 from './assets/star-02.png';
import star04 from './assets/star-04.png';
import star05 from './assets/star-05.png';
import star07 from './assets/star-07.png';
import star09 from './assets/star-09.png';
import star11 from './assets/star-11.png';
import star12 from './assets/star-12.png';
import star13 from './assets/star-13.png';
import star16 from './assets/star-16.png';

import cardFloral from './assets/sm/card-floral.png';
import envelopeFloral from './assets/sm/envelope-floral.png';
import fishGoldfish from './assets/sm/fish-goldfish.png';
import jellyfish from './assets/sm/jellyfish.png';
import paperStack from './assets/sm/paper-stack.png';
import sealFlower from './assets/sm/seal-flower.png';
import sealSun from './assets/sm/seal-sun.png';
import stampMalta from './assets/sm/stamp-malta.png';
import stampNippon from './assets/sm/stamp-nippon.png';

import notebooklines from './assets/uploads/notebooklines.jpg';
import notebookview2 from './assets/uploads/notebookview2.jpg';
import page1 from './assets/uploads/page1.jpg';
import page2 from './assets/uploads/page2.jpg';
import page3 from './assets/uploads/page3.jpg';
import typewriter1 from './assets/uploads/typewriter1.jpg';

const ASSETS = {
  'assets/notebook-open.png': notebookOpen,
  'assets/paper-stars.jpg': paperStars,
  'assets/typewriter-olympia.png': typewriterOlympia,
  'assets/typewriter-night.png': typewriterNight,

  'assets/star-01.png': star01,
  'assets/star-02.png': star02,
  'assets/star-04.png': star04,
  'assets/star-05.png': star05,
  'assets/star-07.png': star07,
  'assets/star-09.png': star09,
  'assets/star-11.png': star11,
  'assets/star-12.png': star12,
  'assets/star-13.png': star13,
  'assets/star-16.png': star16,

  'assets/sm/card-floral.png': cardFloral,
  'assets/sm/envelope-floral.png': envelopeFloral,
  'assets/sm/fish-goldfish.png': fishGoldfish,
  'assets/sm/jellyfish.png': jellyfish,
  'assets/sm/paper-stack.png': paperStack,
  'assets/sm/seal-flower.png': sealFlower,
  'assets/sm/seal-sun.png': sealSun,
  'assets/sm/stamp-malta.png': stampMalta,
  'assets/sm/stamp-nippon.png': stampNippon,

  'uploads/tidings/notebooklines.jpeg': notebooklines,
  'uploads/tidings/notebookview2.jpeg': notebookview2,
  'uploads/tidings/page1.jpeg': page1,
  'uploads/tidings/page2.jpeg': page2,
  'uploads/tidings/page3.jpeg': page3,
  'uploads/tidings/typewriter1.jpeg': typewriter1,
};

// Resolve a logical path to its built URL. Anything already a URL or data URI
// (a dropped-in photo, the 1px BLANK) passes straight through.
export const R = (p) => (p && ASSETS[p]) || p;

export { paperStack as PAPER_STACK, typewriterOlympia as TYPEWRITER_HERO, page2 as POSTCARD_FACE };
export default ASSETS;
