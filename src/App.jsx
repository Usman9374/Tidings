import React from 'react';
import { R } from './assets';
import {
  SEED_FRONT, SEED_BACK, SEED_TW, SEED_PHOTO, SURFACES, OBJECTS, GROUPS, STICKER_TABS,
  SEAL_CHOICES, ENVELOPES, STAMPS, POLAROID_SHAPES, SCALE_LIMITS, FORMATS, SKELETONS,
  DESKS, BACKDROP_SWATCHES, BACKDROPS, BACKDROP_SPRITE, HD_MIN, MACHINES, MACHINE_SHEETS,
  keyMapFor, words, trimWords,
} from './data';
import {
  LETTER_FONTS, FONT_GROUPS, DEFAULT_FONT, fontById, fontFit, loadFaces, prepareFont, prepareAll, previewScale,
} from './fonts';
import {
  caretFromPoint, nextChar, textOffset, measureEnd, focusAt, padTo, replaceAll,
  selectionOffsets, spaceWidth, isTyping,
} from './editing';
import Header from './screens/Header';
import Chooser from './screens/Chooser';
import Desk from './screens/Desk';
import Typewriter from './screens/Typewriter';
import Toolbar from './screens/Toolbar';

const INK = '#201e1d';
const LIGHT_INK = '#f3f2f2';
const LINK = 'https://tidings.letters/r/7f42a9';

// A diary is not posted; a letter and a postcard both are, and so both get the
// envelope step — where "No envelope" is one of the choices.
const ENVELOPED = { page: true, postcard: true, diary: false };

// A letter is a stack of sheets, each written on both sides; a postcard carries
// its address lines on the side they were written on.
const sheetOf = (front, back) => ({
  front: front || '', back: back || '', addresses: { front: ['', '', ''], back: ['', '', ''] },
});

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const rule = (ink, pct) => `color-mix(in srgb, ${ink} ${pct}%, transparent)`;
const sentence = (t) => t.charAt(0).toUpperCase() + t.slice(1);

// The tray's cut-outs lie at slight angles, as they would in a box of them.
const TILT = [-9, 6, -4, 11, -7, 3, -6, 8, -3, 5, -8, 4];

// Relative luminance; below ~0.19 light ink out-contrasts the dark ink.
function luminance(hex) {
  const n = parseInt(String(hex).replace('#', ''), 16) || 0;
  const lin = (c) => { const x = c / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}
const isDark = (hex) => luminance(hex) < 0.19;

// A picture's average colour, from an 8×8 downscale of it.
function avgHex(img) {
  const c = document.createElement('canvas');
  c.width = 8;
  c.height = 8;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0, 8, 8);
  const d = g.getImageData(0, 0, 8, 8).data;
  const sum = [0, 0, 0];
  for (let i = 0; i < d.length; i += 4) { sum[0] += d[i]; sum[1] += d[i + 1]; sum[2] += d[i + 2]; }
  return '#' + sum.map((n) => Math.round(n / (d.length / 4)).toString(16).padStart(2, '0')).join('');
}

// Whether the chrome over a backdrop has to go light. Resolves once the picture
// itself has loaded, which for a library backdrop is the same fetch the field is
// already making — nothing is downloaded twice.
const averageDark = (url) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => { try { resolve(isDark(avgHex(img))); } catch (err) { reject(err); } };
  img.onerror = reject;
  img.src = url;
});

/**
 * Tidings — write a letter by hand or on a typewriter, dress it with cut-outs,
 * seal it in an envelope and send it.
 *
 * All state and every computed style lives here; `renderVals()` returns the one
 * object the screen components read from, so the screens stay presentational
 * and the design numbers stay in data.js.
 *
 * Screens: 1 pick a path · 2 pick a medium · 3 write · 4 envelope · 5 send
 *          6 typewriter · 7 typed result
 */
export default class App extends React.Component {
  surfRef = React.createRef();
  writeRef = React.createRef();
  mirrorRef = React.createRef();
  fieldRef = React.createRef();
  twRef = React.createRef();
  fileRef = React.createRef();

  flashT = {};                       // the transient() timers, cleared on unmount
  urls = new Set();                  // object URLs this app created, revoked on removal
  nav = { idx: 0, screens: [] };     // this session's slice of browser history
  composing = false;

  state = {
    screen: (this.props && this.props.startScreen) || 1,
    medium: 'diary',
    paperId: 'dot',
    sheets: [sheetOf(SEED_FRONT, SEED_BACK)],
    sheetIdx: 0,
    side: 'front',
    full: false,
    fontId: DEFAULT_FONT,
    fontsTick: 0,
    desk: DESKS[0],
    backdrop: null,
    backdropNote: '',
    stickers: [
      { id: 1, kind: 'foil01', x: 92, y: 7, rot: -14, scale: 1, z: 1 },
      { id: 2, kind: 'foil04', x: 6, y: 91, rot: 11, scale: 1, z: 2 },
      { id: 3, kind: 'goldfish', x: 84, y: 92, rot: -5, scale: 1, z: 3 },
    ],
    stickerMode: 'shadow',
    stickerTab: 'foil',
    polaroids: [
      // low and to the right, clear of the writing on every paper the app opens on
      { id: 4, shape: 'landscape', x: 77, y: 75, rot: 2.4, scale: 1, z: 4, caption: 'the kitchen table at four', src: SEED_PHOTO },
    ],
    selected: null,
    zTop: 4,
    signature: { on: false, src: '' },
    spell: false,
    format: 'love letter',
    envId: 'cream-open',
    envAddress: ['', '', ''],
    envColour: '#efece7',
    seal: 'sealSun',
    country: 'JAPAN',
    stampIdx: 0,
    opened: false,
    flipped: false,
    flipping: false,
    copied: null,      // which copy word last succeeded, so only that one reports it
    confirmSend: false,
    fileError: false,
    twText: SEED_TW,
    machine: 'burgundy',
    twSheet: 0,
    pressed: null,
    nextId: 20,
    docSeq: 0,
  };

  componentDidMount() {
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('popstate', this.onPop);
    document.addEventListener('beforeinput', this.onBeforeInput, true);
    this.nav = { idx: 0, screens: [this.state.screen] };
    window.history.replaceState({ td: 0, screen: this.state.screen }, '');
    prepareFont(fontById(DEFAULT_FONT)).catch(() => {});
    if (this.state.screen === 3) this.warmFaces();
    this.syncDoc();
  }

  // A fixed-height multi-column box overflows along the INLINE axis, so a full
  // diary spread grows scrollWidth, not scrollHeight: test both, on whichever
  // text element this screen has — the editor on 3, the reader's copy on 4 and 5.
  componentDidUpdate() {
    this.syncDoc();
    // Arriving at the machine with nothing focused means the first keystrokes
    // light up the keys and type nothing — so hand the paper the keyboard.
    if (this.state.screen === 6 && this._wasScreen !== 6 && this.twRef.current) this.twRef.current.focus();
    this._wasScreen = this.state.screen;
    const surf = this.surfRef.current;
    const el = surf && surf.querySelector('[data-text]');
    const full = !!el && (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2);
    if (full !== this.state.full) this.setState({ full });
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('popstate', this.onPop);
    document.removeEventListener('beforeinput', this.onBeforeInput, true);
    clearTimeout(this.keyT);
    Object.values(this.flashT).forEach(clearTimeout);
    this.urls.forEach((u) => URL.revokeObjectURL(u));
    this.urls.clear();
  }

  // The writing surface is an uncontrolled contentEditable so it can carry real
  // columns and keep the caret; text is pushed in only when the sheet changes.
  // The font isn't part of the key — changing it restyles, never re-pushes.
  docKey() {
    const s = this.state;
    return [s.medium, s.paperId, s.sheetIdx, s.side, s.docSeq, s.screen].join('|');
  }

  syncDoc() {
    const el = this.writeRef.current;
    if (!el) { this._docKey = null; return; }
    const key = this.docKey();
    if (this._docKey === key) return;
    this._docKey = key;
    el.textContent = this.activeText();
  }

  limit() { return (this.props && this.props.wordLimit) || 700; }
  paper() { const l = SURFACES[this.state.medium]; return l.find((p) => p.id === this.state.paperId) || l[0]; }
  // null when the letter travels without one
  envelope() { return this.state.envId === 'none' ? null : (ENVELOPES.find((e) => e.id === this.state.envId) || ENVELOPES[0]); }
  machine() { return MACHINES[this.state.machine] || MACHINES.burgundy; }
  sheet() { return this.state.sheets[this.state.sheetIdx] || this.state.sheets[0]; }
  activeText() { return this.sheet()[this.state.side] || ''; }
  totalWords() { return this.state.sheets.reduce((n, sh) => n + words(sh.front) + words(sh.back), 0); }

  // Every write lands on the sheet being written on, on the side facing up.
  setSideText(text, extra, done) {
    this.setState((s) => Object.assign({
      sheets: s.sheets.map((sh, i) => (i === s.sheetIdx ? Object.assign({}, sh, { [s.side]: text }) : sh)),
    }, typeof extra === 'function' ? extra(s) : extra), done);
  }

  // A fresh sheet on top of the stack, turned to its front. From the envelope or
  // the send screen this also goes back to the writing, which is the point of it.
  addPage() {
    if (this.state.screen !== 3) this.goBack(3);
    this.setState((s) => ({ sheets: s.sheets.concat([sheetOf()]), sheetIdx: s.sheets.length, side: 'front', full: false, selected: null }));
  }

  turnTo(idx) {
    this.setState((s) => ({ sheetIdx: clamp(idx, 0, s.sheets.length - 1), side: 'front', selected: null }));
  }

  // — navigation —
  // Browser history mirrors the screens: a forward move pushes an entry, and a
  // move back steps the browser to the earlier entry when it is in the stack.

  apply(screen, patch) {
    this.setState((s) => {
      const next = { screen, selected: null };
      if (s.screen === 5 && screen !== 5) Object.assign(next, { side: 'front', opened: false, flipped: false, flipping: false });
      if (screen === 1) Object.assign(next, { opened: false, flipped: false });
      const medium = (patch && patch.medium) || s.medium;
      if (screen === 4 && !ENVELOPED[medium]) next.screen = 3;
      return Object.assign(next, patch);
    });
    if (screen === 3) this.warmFaces();
  }

  go(screen, patch) {
    this.apply(screen, patch);
    const n = this.nav;
    n.screens.length = n.idx + 1;
    n.screens.push(screen);
    n.idx += 1;
    window.history.pushState({ td: n.idx, screen }, '');
  }

  goBack(screen) {
    const n = this.nav;
    for (let j = n.idx - 1; j >= 0; j -= 1) {
      if (n.screens[j] === screen) { window.history.go(j - n.idx); return; }
    }
    this.apply(screen);
    n.screens[n.idx] = screen;
    window.history.replaceState({ td: n.idx, screen }, '');
  }

  onPop = (e) => {
    const st = e.state;
    if (!st || typeof st.td !== 'number') return;
    this.nav.idx = st.td;
    this.nav.screens[st.td] = st.screen;
    this.apply(st.screen);
  };

  backTarget() {
    const s = this.state;
    return { 2: 1, 3: 2, 4: 3, 5: ENVELOPED[s.medium] ? 4 : 3, 6: 1, 7: 6 }[s.screen] || null;
  }

  steps() {
    const s = this.state;
    if (s.screen === 1) return null;
    const flow = s.screen >= 6
      ? [['Type', 6], ['Preview', 7]]
      : [['Choose', 2], ['Write', 3]].concat(ENVELOPED[s.medium] ? [['Envelope', 4]] : [], [['Send', 5]]);
    const at = flow.findIndex((f) => f[1] === s.screen);
    return flow.map(([label, screen], i) => ({
      label, current: i === at, go: i < at ? () => this.goBack(screen) : null,
    }));
  }

  // This replaces the whole letter, so when there is a letter to lose it asks
  // first — the word itself becomes the question, and pressing it again answers.
  hasLetter() { return this.state.sheets.some((sh) => (sh.front + sh.back).trim()); }

  sendAsLetter() {
    if (this.hasLetter() && !this.state.confirmSend) {
      this.transient('confirmSend', true, 5000);
      return;
    }
    clearTimeout(this.flashT.confirmSend);
    const cap = this.limit();
    const t = this.state.twText;
    this.setState({ confirmSend: false });
    this.go(3, {
      medium: 'page', paperId: 'cream', side: 'front',
      sheets: [sheetOf(words(t) > cap ? trimWords(t, cap) : t)], sheetIdx: 0, full: false,
    });
  }

  // — keys —

  onKey = (e) => {
    const s = this.state;
    if (s.screen === 6) {
      const key = e.key === ' ' ? ' ' : (e.key || '').toUpperCase();
      if (keyMapFor(s.machine)[key]) {
        this.setState({ pressed: key });
        clearTimeout(this.keyT);
        this.keyT = setTimeout(() => this.setState({ pressed: null }), 200);
      }
      return;
    }
    if (s.screen !== 3 || !s.selected || e.defaultPrevented) return;
    if (e.key === 'Escape') { this.setState({ selected: null }); return; }
    if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping(document.activeElement)) {
      e.preventDefault();
      this.removeObj(s.selected.coll, s.selected.id);
    }
  };

  // — the letter's text —

  // A new word at the limit is refused before it lands; trimming afterwards
  // would move the caret. Pastes and drops are trimmed in takeText instead.
  onBeforeInput = (e) => {
    const ed = this.writeRef.current;
    if (!ed || e.target !== ed || e.isComposing) return;
    if (e.inputType !== 'insertText' && e.inputType !== 'insertReplacementText') return;
    const data = e.data || '';
    if (!/\S/.test(data)) return;
    const cap = this.limit();
    const others = this.totalWords() - words(this.activeText());
    const text = ed.textContent;
    if (others + words(text) + words(data) <= cap) return;
    const sel = selectionOffsets(ed);
    if (sel && others + words(text.slice(0, sel.start) + data + text.slice(sel.end)) > cap) e.preventDefault();
  };

  onWrite = (e) => {
    if (this.composing || (e.nativeEvent && e.nativeEvent.isComposing)) return;
    this.takeText(e.currentTarget);
  };

  onCompositionStart = () => { this.composing = true; };

  onCompositionEnd = (e) => {
    this.composing = false;
    this.takeText(e.currentTarget);
  };

  takeText(el) {
    const cap = this.limit();
    const others = this.totalWords() - words(this.activeText());
    let text = el.textContent;
    if (others + words(text) > cap) {
      text = trimWords(text, Math.max(0, cap - others));
      el.textContent = text;
      focusAt(el, 'end');
    }
    this.setSideText(text);
  }

  // Click-and-type: a click on blank paper pads the letter with real line
  // breaks and spaces up to that point, so writing starts where the writer
  // clicked and the letter stays one flowing text. One undo removes the padding.
  clickToType(e) {
    if (e.button !== 0 || e.detail > 1 || e.shiftKey || this.composing) return;
    if (e.target.closest('[data-obj], input, textarea, label, button')) return;
    const ed = this.writeRef.current;
    const mirror = this.mirrorRef.current;
    const sheet = this.surfRef.current;
    if (!ed || !mirror || !sheet) return;
    const p = this.paper();
    const box = ed.getBoundingClientRect();
    const cq = sheet.getBoundingClientRect().width / 100;

    // the postcard's right half is the address side: go to the nearest line
    if (p.card && e.clientX > box.right + 2 * cq) {
      const lines = Array.from(sheet.querySelectorAll('[data-address]'));
      if (!lines.length) return;
      e.preventDefault();
      const dist = (el) => Math.abs(el.getBoundingClientRect().bottom - e.clientY);
      lines.reduce((a, b) => (dist(b) < dist(a) ? b : a)).focus();
      return;
    }

    const font = fontById(this.state.fontId);
    const fit = fontFit(font.id, p.fs);
    const L = p.lh * cq;
    const cols = p.cols || 1;
    const gap = (p.gap || 0) * cq;
    const colW = (box.width - gap * (cols - 1)) / cols;
    const perCol = Math.max(1, Math.floor(box.height / L + 0.01));
    const flow = (x, y) => {
      const col = clamp(Math.floor((x + gap / 2) / (colW + gap)), 0, cols - 1);
      const line = Math.max(0, Math.floor(y / L));
      return { idx: col * perCol + (cols > 1 ? Math.min(line, perCol - 1) : line), xIn: x - col * (colW + gap) };
    };

    // clicks in the margins map to the nearest line of the writing box
    const px = clamp(e.clientX, box.left + 1, box.right - 1);
    const py = clamp(e.clientY, box.top + 1, box.bottom - 1);
    const tX = px - box.left + ed.scrollLeft;
    const T = flow(tX, py - box.top + ed.scrollTop);
    const sp = spaceWidth(font.family, p.fs * fit.k * cq);
    const end = measureEnd(mirror, this.activeText());
    const endX = end.left - box.left;
    const E = flow(endX, end.top - box.top + end.height / 2);

    // the caret (or the text up to offset `at`) as a flow position, measured on the mirror
    const caretAt = (at) => {
      const text = ed.textContent;
      const sel = at === undefined ? selectionOffsets(ed) : null;
      const m = measureEnd(mirror, text.slice(0, at !== undefined ? at : (sel ? sel.start : text.length)));
      return flow(m.left - box.left, m.top - box.top + m.height / 2);
    };

    // past the end of the text: break lines down to the click, then space across
    if (T.idx > E.idx || (T.idx === E.idx && tX - endX > 1.5 * sp)) {
      e.preventDefault();
      focusAt(ed, 'end');
      if (!padTo(T, () => caretAt(), sp)) {
        const breaks = T.idx - E.idx;
        this.padFallback(breaks, Math.round((breaks ? T.xIn : tX - endX) / sp));
      }
      return;
    }

    // right of a line that ends in a newline: space across that line
    const pos = caretFromPoint(px, py);
    const inText = !!pos && ed.contains(pos.node);
    if (inText && nextChar(ed, pos) === '\n') {
      const C = caretAt(textOffset(ed, pos));
      if (C.idx === T.idx && T.xIn - C.xIn >= 1.5 * sp) {
        e.preventDefault();
        focusAt(ed, pos);
        if (!padTo(T, () => caretAt(), sp)) this.padFallback(0, Math.round((T.xIn - C.xIn) / sp));
        return;
      }
    }
    if (!ed.contains(e.target) && inText) {
      e.preventDefault();
      focusAt(ed, pos);
    }
  }

  // Used only when the browser refuses execCommand: splice the padding in and
  // re-sync, at the cost of the undo step.
  padFallback(breaks, spaces) {
    const ed = this.writeRef.current;
    const sel = ed && selectionOffsets(ed);
    const text = this.activeText();
    const at = sel ? sel.start : text.length;
    const pad = '\n'.repeat(breaks) + ' '.repeat(spaces);
    const next = text.slice(0, at) + pad + text.slice(at);
    this.setSideText(next, (s) => ({ docSeq: s.docSeq + 1 }), () => {
      const el = this.writeRef.current;
      if (el && el.firstChild) focusAt(el, { node: el.firstChild, offset: at + pad.length });
    });
  }

  // Any format, the current one included, replaces the text as one undo step.
  applyFormat(f) {
    const text = SKELETONS[f] || '';
    this.setState({ format: f });
    if (this.state.screen === 6) {
      const ta = this.twRef.current;
      if (ta) { ta.focus(); ta.select(); }
      if (!ta || !document.execCommand('insertText', false, text) || ta.value !== text) this.setState({ twText: text });
      return;
    }
    const ed = this.writeRef.current;
    if (ed && replaceAll(ed, text) && ed.textContent === text) return;
    this.setSideText(text, (s) => ({ docSeq: s.docSeq + 1 }));
  }

  // — stickers, polaroids, pictures —

  // Blur whichever text field has the keyboard — the letter, a caption, an
  // address line — so Delete goes to a selected object rather than the text.
  blurEditor() {
    const a = document.activeElement;
    if (isTyping(a)) a.blur();
  }

  select(coll, id) {
    this.blurEditor(); // so Delete removes the object instead of editing the letter
    this.setState((s) => {
      if (s.selected && s.selected.coll === coll && s.selected.id === id) return null;
      const z = s.zTop + 1;
      return { selected: { coll, id }, zTop: z, [coll]: s[coll].map((o) => (o.id === id ? Object.assign({}, o, { z }) : o)) };
    });
  }

  patchObj(coll, id, patch) {
    this.setState((s) => ({ [coll]: s[coll].map((o) => (o.id === id ? Object.assign({}, o, patch) : o)) }));
  }

  removeObj(coll, id) {
    const gone = this.state[coll].find((o) => o.id === id);
    if (gone && gone.src) this.revoke(gone.src);
    this.setState((s) => ({
      [coll]: s[coll].filter((o) => o.id !== id),
      selected: s.selected && s.selected.id === id ? null : s.selected,
    }));
  }

  addSticker(kind) {
    this.blurEditor();
    const x = 50 + (Math.random() - 0.5) * 12;
    const y = 45 + (Math.random() - 0.5) * 12;
    const rot = Math.round((Math.random() - 0.5) * 24);
    this.setState((s) => ({
      stickers: s.stickers.concat([{ id: s.nextId, kind, x, y, rot, scale: 1, z: s.zTop + 1 }]),
      selected: { coll: 'stickers', id: s.nextId }, nextId: s.nextId + 1, zTop: s.zTop + 1,
    }));
  }

  addPolaroid(shape) {
    this.blurEditor();
    const rot = Math.round((Math.random() - 0.5) * 80) / 10;
    // scattered like a sticker, so a second frame does not land exactly on the first
    const x = 50 + (Math.random() - 0.5) * 12;
    const y = 46 + (Math.random() - 0.5) * 12;
    this.setState((s) => ({
      polaroids: s.polaroids.concat([{ id: s.nextId, shape, x, y, rot, scale: 1, z: s.zTop + 1, caption: '', src: '' }]),
      selected: { coll: 'polaroids', id: s.nextId }, nextId: s.nextId + 1, zTop: s.zTop + 1,
    }));
  }

  own(file) {
    const url = URL.createObjectURL(file);
    this.urls.add(url);
    return url;
  }

  revoke(url) {
    if (this.urls.delete(url)) URL.revokeObjectURL(url);
  }

  setPhoto(id, file) {
    if (!file) return;
    const old = (this.state.polaroids.find((o) => o.id === id) || {}).src;
    if (old) this.revoke(old);
    this.patchObj('polaroids', id, { src: this.own(file) });
  }

  setSignature(file) {
    if (!file) return;
    if (this.state.signature.src) this.revoke(this.state.signature.src);
    const src = this.own(file);
    this.setState((s) => ({ signature: Object.assign({}, s.signature, { src }) }));
  }

  pickDesk(hex) {
    if (this.state.backdrop) this.revoke(this.state.backdrop.url);
    this.setState({ desk: hex, backdrop: null, backdropNote: '' });
  }

  // One of the forty-seven. It goes up at once — the ink follows a moment later,
  // once the picture has loaded and its average colour is known.
  pickBackdrop(b) {
    if (this.state.backdrop) this.revoke(this.state.backdrop.url);
    const url = R(b.img);
    this.setState({ backdrop: { url, id: b.id, dark: false }, backdropNote: '' });
    averageDark(url)
      .then((dark) => this.setState((s) => (s.backdrop && s.backdrop.id === b.id && s.backdrop.dark !== dark
        ? { backdrop: Object.assign({}, s.backdrop, { dark }) }
        : null)))
      .catch(() => {});
  }

  // An own backdrop must be HD. Its average colour decides the field's ink.
  takeBackdrop(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.setState({ backdropNote: 'That file is not a picture.' }); return; }
    const url = this.own(file);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (Math.max(w, h) < HD_MIN.long || Math.min(w, h) < HD_MIN.short) {
        this.revoke(url);
        this.setState({ backdropNote: `That picture is ${w} × ${h}. Use one at least ${HD_MIN.long} × ${HD_MIN.short}.` });
        return;
      }
      if (this.state.backdrop) this.revoke(this.state.backdrop.url);
      this.setState({ backdrop: { url, id: 'own', dark: isDark(avgHex(img)) }, backdropNote: '' });
    };
    img.onerror = () => {
      this.revoke(url);
      this.setState({ backdropNote: "That file couldn't be opened as a picture." });
    };
    img.src = url;
  }

  // — fonts —

  warmFaces() {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 400));
    idle(() => loadFaces().catch(() => {}));
  }

  warmFonts() {
    if (this.fontsWarm) return;
    this.fontsWarm = true;
    prepareAll().then(() => this.setState((s) => ({ fontsTick: s.fontsTick + 1 })));
  }

  pickFont(f) {
    prepareFont(f).catch(() => null).then(() => this.setState({ fontId: f.id }));
  }

  // — sharing —

  // A value that shows for a moment and then goes back to normal — the copy
  // words' confirmation, the file-read error, the send confirmation.
  transient(field, value, ms) {
    clearTimeout(this.flashT[field]);
    this.setState({ [field]: value });
    this.flashT[field] = setTimeout(() => this.setState({ [field]: field === 'copied' ? null : false }), ms);
  }

  // `key` names the word that was pressed, so WhatsApp reporting success no
  // longer makes the separate "Copy the link" word claim it instead.
  copy(text, key) {
    try {
      const w = navigator.clipboard && navigator.clipboard.writeText(text);
      if (w && w.catch) w.catch(() => {});
    } catch (err) { /* clipboard unavailable */ }
    this.transient('copied', key, 1600);
  }

  // A plain-text file wound into the machine, in place of typing it out.
  readFileIn(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => {
      this.setState({ twText: String(fr.result || '').slice(0, 4000) });
      // put the keyboard back on the paper, or the next keystroke goes nowhere
      const ta = this.twRef.current;
      if (ta) ta.focus();
    };
    fr.onerror = () => this.transient('fileError', true, 3000);
    fr.readAsText(f);
  }

  download() {
    const blob = new Blob([this.state.twText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tidings.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  // — styles —

  word(label, go, opts) {
    const o = opts || {};
    return {
      label, go, title: o.title || label, pressed: o.pressed,
      style: {
        display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 0, padding: '7px 0',
        cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '13px', lineHeight: 1.2,
        color: o.on ? 'var(--color-accent)' : (o.quiet ? 'color-mix(in srgb, var(--color-text) 58%, transparent)' : 'color-mix(in srgb, var(--color-text) 88%, transparent)'),
      },
    };
  }

  primary(label, go) {
    return {
      label, go,
      style: {
        background: 'transparent', border: '1.5px solid var(--color-text)', borderRadius: 'var(--radius-md)',
        padding: '8px 20px', cursor: 'pointer', whiteSpace: 'nowrap', color: 'var(--color-text)',
        fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.02em', lineHeight: 1.2,
        transition: 'background-color 160ms ease, color 160ms ease',
      },
    };
  }

  // drop-shadow on a transparent PNG casts the object's real silhouette
  lift(mode, unit) {
    const u = unit || 'cqw';
    if (mode === 'outline') {
      const o = '0.16' + u;
      return 'drop-shadow(' + o + ' 0 #fff) drop-shadow(-' + o + ' 0 #fff) drop-shadow(0 ' + o + ' #fff) drop-shadow(0 -' + o + ' #fff) drop-shadow(0 0.2' + u + ' 0.3' + u + ' color-mix(in srgb, #201e1d 26%, transparent))';
    }
    return 'drop-shadow(0 0.3' + u + ' 0.42' + u + ' color-mix(in srgb, #201e1d 32%, transparent))';
  }

  renderVals() {
    const s = this.state;
    const p = this.paper();
    const ink = (this.props && this.props.letterInk) || INK;
    const cap = this.limit();
    const tw = this.totalWords();
    const isS3 = s.screen === 3, isS4 = s.screen === 4, isS5 = s.screen === 5, isS6 = s.screen === 6, isS7 = s.screen === 7;
    const isDesk = s.screen >= 3 && s.screen <= 5;
    const env = this.envelope();
    // An envelope only exists for the media that get the envelope step. Without
    // this a diary — which skips that step — still arrived on screen 5 sealed
    // inside the default envelope, one nobody was ever given the chance to pick.
    const envOn = !!env && !!ENVELOPED[s.medium];
    // the burgundy is too dark to be written on in ink; the rest take the letter's
    const envInk = (env && env.ink) || INK;
    const canFlip = !!(this.sheet().back || '').trim();
    const opened = s.opened || !envOn;
    const font = fontById(s.fontId);
    const fit = fontFit(font.id, p.fs);

    // Type never sets below 11px: the sheet may shrink with a short window, the
    // reading size may not. The rules take the same floor, by the same factor,
    // so they stay in register with the lines of writing at every size.
    const MINFS = 11;
    const fsC = p.fs * fit.k;
    const lhPx = MINFS * p.lh / fsC;
    const FS = 'max(' + MINFS + 'px, ' + fsC.toFixed(3) + 'cqw)';
    const LH = 'max(' + lhPx.toFixed(2) + 'px, ' + p.lh.toFixed(4) + 'cqw)';
    const RULE = 'max(' + (lhPx * 0.755).toFixed(2) + 'px, ' + (p.lh * 0.755).toFixed(3) + 'cqw)';
    const INK22 = 'color-mix(in srgb, ' + ink + ' 22%, transparent)';
    const rulesBg = 'repeating-linear-gradient(to bottom, transparent 0, transparent calc(' + RULE + ' - 1px), ' + INK22 + ' calc(' + RULE + ' - 1px), ' + INK22 + ' ' + RULE + ', transparent ' + RULE + ', transparent ' + LH + ')';

    // The element IS the text area (insets, no padding) so overflow columns are
    // clipped outside it; column-* is only set when the surface really has
    // leaves. The editor, the reader's copy and the hidden mirror share this,
    // wrapping included, so they lay the text out identically. `fit` shifts the
    // box so every font's baseline sits where Courier Prime's does.
    const textBase = {
      position: 'absolute', zIndex: 2, margin: 0, padding: 0, border: 0, outline: 'none', background: 'none',
      top: (p.pad[0] + fit.dy) + 'cqw', right: p.pad[1] + 'cqw', bottom: (p.pad[2] - fit.dy) + 'cqw', left: p.pad[3] + 'cqw',
      overflow: 'hidden', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', WebkitLineBreak: 'after-white-space',
      fontFamily: font.family, fontSize: FS, lineHeight: LH, color: ink,
      caretColor: 'var(--color-accent)',
    };
    if (p.cols > 1) {
      textBase.columnCount = p.cols;
      textBase.columnGap = (p.gap || 0) + 'cqw';
      textBase.columnFill = 'auto';
    }
    const MACH = this.machine();
    const KEY_MAP = keyMapFor(s.machine);
    const twSheet = MACHINE_SHEETS[s.twSheet] || MACHINE_SHEETS[0];
    const stampPick = (STAMPS[s.country] || [])[s.stampIdx] || STAMPS.JAPAN[0];
    const stampObj = { src: R((OBJECTS[stampPick.obj] || OBJECTS.stampNippon).src), value: stampPick.value };

    const leaf = s.medium === 'postcard' ? 'card' : (s.medium === 'diary' ? 'page' : 'sheet');
    const centreHint = isS5 && !opened
      ? 'Click the envelope to open it.'
      : (isS5 && opened && canFlip && !s.flipped
        ? `There is more on the back — click the ${leaf} to turn it over.`
        : (isS3 ? 'Click anywhere on the paper to write. Click a sticker to move, turn or remove it.' : null));

    // How wide the sheet may be before it is taller than the field it sits in.
    // 100cqh is the field's own height (it declares container-type: size), so
    // this stays a pure CSS rule and needs no measuring. The sheet does not get
    // the field to itself, though: the desk column adds its own padding, a 20px
    // gap and — on most screens — a line of text above or below. Reserving that
    // chrome is what keeps the sheet inside the field instead of 16px past it.
    // With the envelope, card and envelope share the height equally and are the
    // same size; S5 always reserves its hint line and the opened envelope's
    // 10px drop, so opening it resizes nothing.
    const pair = (isS4 || isS5) && envOn;
    const deskChrome = 40 + ((isS5 || centreHint) ? 39 : 0) + (isS5 && envOn ? 10 : 0);
    // Paired, the sheet and the envelope split what height is left between them,
    // each turning its own half into a width through its own aspect — so a tall
    // envelope and a wide card still both land inside the field.
    const half = 'calc((100cqh - ' + (deskChrome + 20) + 'px) / ';
    const fitWidth = pair
      ? half + (2 * p.aspect) + ')'
      : 'calc((100cqh - ' + deskChrome + 'px) / ' + p.aspect + ')';
    const envFitWidth = half + (2 * (env ? env.aspect : 1)) + ')';

    const menus = [];
    const toggles = [];
    let primary = null;
    let counter = null;
    const formatMenu = {
      id: 'format', label: 'Format', width: 230, style: this.word('Format').style,
      items: FORMATS.map((f) => ({ label: sentence(f), on: f === s.format, pick: () => this.applyFormat(f) })),
    };

    if (isS3) {
      menus.push({
        id: 'paper', label: s.medium === 'diary' ? 'Book' : 'Paper', width: 250, maxHeight: 520,
        style: this.word('Paper').style,
        items: SURFACES[s.medium].map((o) => ({
          id: o.id, label: sentence(o.label), thumb: R(o.img), fit: o.cut ? 'contain' : 'cover',
          ruled: o.rule === 'drawn', on: o.id === s.paperId,
          pick: () => this.setState({ paperId: o.id }),
        })),
      });
      menus.push({
        id: 'font', label: 'Font', width: 290, maxHeight: 460, style: this.word('Font').style,
        onOpen: () => this.warmFonts(),
        groups: FONT_GROUPS.map((g) => ({
          name: g,
          fonts: LETTER_FONTS.filter((f) => f.group === g).map((f) => ({
            id: f.id, label: f.label, family: f.family, size: Math.round(18 * previewScale(f.id)),
            on: f.id === s.fontId, pick: () => this.pickFont(f),
          })),
        })),
      });
      menus.push(formatMenu);
      // One tray, seven drawers — a hundred and fifty real cut-outs. Only the
      // open drawer's thumbnails are in the DOM, and each one loads lazily.
      menus.push({
        id: 'stickers', label: 'Stickers', width: 300, maxHeight: 520, style: this.word('Stickers').style,
        tabs: STICKER_TABS.map((t) => ({
          id: t.id, label: t.label, on: t.id === s.stickerTab,
          pick: () => this.setState({ stickerTab: t.id }),
        })),
        items: (GROUPS[s.stickerTab] || GROUPS.foil).map((kind, i) => ({
          key: kind, src: R(OBJECTS[kind].src), title: OBJECTS[kind].title, add: () => this.addSticker(kind),
          style: {
            display: 'block', maxHeight: OBJECTS[kind].w > 12 ? '30px' : '34px', maxWidth: '100%', width: 'auto',
            filter: 'drop-shadow(0 1px 1.5px color-mix(in srgb, #201e1d 22%, transparent))',
            transition: 'transform 220ms cubic-bezier(.2,.7,.2,1)',
            transform: 'rotate(' + TILT[i % TILT.length] + 'deg)',
          },
        })),
        modes: [['shadow', 'Drop shadow'], ['outline', 'White outline']].map(([mode, label]) => ({
          label, on: s.stickerMode === mode, pick: () => this.setState({ stickerMode: mode }),
        })),
      });
      menus.push({
        id: 'photo', label: 'Photo', width: 200, style: this.word('Photo').style,
        items: Object.keys(POLAROID_SHAPES).map((shape) => ({
          key: shape, label: POLAROID_SHAPES[shape].label, w: POLAROID_SHAPES[shape].w, aspect: POLAROID_SHAPES[shape].aspect,
          add: () => this.addPolaroid(shape),
        })),
      });
      menus.push({
        id: 'backdrop', label: 'Desk', width: 300, maxHeight: 600, style: this.word('Desk').style,
        swatches: BACKDROP_SWATCHES.map((hex) => ({
          hex, on: !s.backdrop && hex.toLowerCase() === s.desk.toLowerCase(), pick: () => this.pickDesk(hex),
        })),
        // Forty-seven backdrops, their thumbnails cut out of four sprite strips,
        // so the whole grid costs four small requests and no photograph is
        // fetched until one is actually chosen.
        sprite: BACKDROP_SPRITE,
        pictures: BACKDROPS.map((b) => ({
          id: b.id, on: !!s.backdrop && s.backdrop.id === b.id, sprite: R(b.sprite), sx: b.sx, sy: b.sy,
          pick: () => this.pickBackdrop(b),
        })),
        image: s.backdrop && s.backdrop.id === 'own' ? { url: s.backdrop.url, remove: () => this.pickDesk(s.desk) } : null,
        upload: (file) => this.takeBackdrop(file),
        note: s.backdropNote,
        hd: HD_MIN.long + ' × ' + HD_MIN.short,
        wheel: { value: s.desk, onChange: (hex) => this.pickDesk(hex) },
      });

      toggles.push(this.word(canFlip || s.side === 'back' ? 'Turn over' : 'Write on the back', () => this.setState((v) => ({ side: v.side === 'front' ? 'back' : 'front', selected: null })), { quiet: true }));
      // The nudge only appears once the writing has actually run off the sheet.
      if (s.full) toggles.push(this.word('Sheet full — add another', () => this.addPage(), { title: 'Add a sheet and keep writing' }));
      toggles.push(this.word('Add a sheet', () => this.addPage(), { quiet: true }));
      toggles.push(this.word(s.signature.on ? 'Remove signature' : 'Sign it', () => this.setState((v) => ({ signature: Object.assign({}, v.signature, { on: !v.signature.on }) })), { quiet: true, on: s.signature.on, pressed: s.signature.on }));
      toggles.push(this.word('Spell check', () => this.setState((v) => ({ spell: !v.spell })), { quiet: true, on: s.spell, pressed: s.spell }));
      counter = tw + ' / ' + cap;
      primary = this.primary('Done', () => this.go(ENVELOPED[s.medium] ? 4 : 5, { opened: false, flipped: false }));
    }
    if (isS4) {
      menus.push({
        id: 'envelope', label: 'Envelope', width: 260, maxHeight: 520, style: this.word('Envelope').style,
        items: [{ id: 'none', label: 'No envelope', thumb: null, on: s.envId === 'none', pick: () => this.setState({ envId: 'none' }) }]
          .concat(ENVELOPES.map((e) => ({
            id: e.id, label: sentence(e.label), thumb: e.plain ? null : R(e.img),
            swatch: e.plain ? s.envColour : null, on: e.id === s.envId,
            pick: () => this.setState({ envId: e.id }),
          }))),
      });
      // a wax seal without an envelope to press it into would be nothing
      if (envOn) {
        menus.push({
          id: 'seal', label: 'Seal', width: 268, maxHeight: 420, style: this.word('Seal').style,
          items: SEAL_CHOICES.map((id) => ({
            key: id, on: s.seal === id,
            title: id === 'none' ? 'No seal' : sentence(OBJECTS[id].title),
            src: id === 'none' ? null : R(OBJECTS[id].src),
            pick: () => this.setState({ seal: id }),
          })),
        });
      }
      if (s.full) toggles.push(this.word('Writing runs off this sheet — add another', () => this.addPage(), { title: 'Back to the writing, on a fresh sheet' }));
      toggles.push(this.word('Keep writing', () => this.goBack(3), { quiet: true }));
      toggles.push(this.word(s.copied === 'link' ? 'Link copied' : 'Copy the link', () => this.copy(LINK, 'link'), { quiet: true }));
      primary = this.primary('Send it', () => this.go(5, { opened: false, flipped: false }));
    }
    if (isS5) {
      if (s.full) toggles.push(this.word('Writing runs off this sheet — add another', () => this.addPage(), { title: 'Back to the writing, on a fresh sheet' }));
      toggles.push(this.word(s.copied === 'link' ? 'Link copied' : 'Copy the link', () => this.copy(LINK, 'link'), { quiet: true }));
      ['WhatsApp', 'Mail', 'Messages'].forEach((t) => toggles.push(
        this.word(s.copied === t ? 'Copied' : t, () => this.copy(LINK, t), { quiet: true, title: 'Copy the link for ' + t }),
      ));
      toggles.push(this.word('Seal it again', () => this.setState({ opened: false, flipped: false, side: 'front' }), { quiet: true }));
    }
    if (isS6) {
      menus.push({
        id: 'machine', label: 'Machine', width: 260, maxHeight: 520, style: this.word('Machine').style,
        items: Object.keys(MACHINES).map((id) => ({
          id, label: sentence(MACHINES[id].label), thumb: R(MACHINES[id].src), fit: 'contain',
          on: id === s.machine, pick: () => this.setState({ machine: id, pressed: null }),
        })),
      });
      menus.push({
        id: 'sheet', label: 'Sheet', width: 230, style: this.word('Sheet').style,
        items: MACHINE_SHEETS.map((sh, i) => ({
          id: sh.id, label: sh.label, thumb: R(sh.img), fit: 'cover',
          on: i === s.twSheet, pick: () => this.setState({ twSheet: i }),
        })),
      });
      menus.push(formatMenu);
      toggles.push(this.word(s.fileError ? 'That file could not be read' : 'Open a text file', () => { if (this.fileRef.current) this.fileRef.current.click(); }, { quiet: true, on: s.fileError, title: 'Wind a plain-text file into the machine' }));
      toggles.push(this.word('Spell check', () => this.setState((v) => ({ spell: !v.spell })), { quiet: true, on: s.spell, pressed: s.spell }));
      toggles.push(this.word(s.confirmSend ? 'Replace your letter?' : 'Send as a letter', () => this.sendAsLetter(), { quiet: !s.confirmSend, on: s.confirmSend, title: 'Replaces the letter you have in progress' }));
      counter = words(s.twText) + ' words';
      primary = this.primary('Done', () => this.go(7));
    }
    if (isS7) {
      toggles.push(this.word('Download as text', () => this.download(), { quiet: true }));
      toggles.push(this.word(s.copied === 'text' ? 'Copied' : 'Copy the text', () => this.copy(s.twText, 'text'), { quiet: true }));
      counter = words(s.twText) + ' words';
      primary = this.primary(s.confirmSend ? 'Replace your letter?' : 'Send as a letter', () => this.sendAsLetter());
    }

    const isSel = (coll, id) => !!s.selected && s.selected.coll === coll && s.selected.id === id;
    const placed = (coll, o, base) => ({
      sheetRef: this.surfRef, x: o.x, y: o.y, rot: o.rot || 0, scale: o.scale || 1, limits: SCALE_LIMITS,
      editable: isS3, selected: isSel(coll, o.id),
      style: {
        position: 'absolute', left: o.x + '%', top: o.y + '%', width: (base * (o.scale || 1)) + 'cqw',
        transform: 'translate(-50%, -50%) rotate(' + (o.rot || 0) + 'deg)',
        zIndex: isSel(coll, o.id) ? 1000 : 10 + (o.z || 0),
      },
      onSelect: () => this.select(coll, o.id),
      onChange: (patch) => this.patchObj(coll, o.id, patch),
      onRemove: () => this.removeObj(coll, o.id),
    });

    const deskDark = isDark(s.desk);

    return {
      isS1: s.screen === 1, isS2: s.screen === 2, isS3, isS4, isS5, isS6, isS7,
      isDesk, isTypewriter: isS6 || isS7,

      // The desk — its colour and any backdrop on it — is the surface the letter
      // sits on, so it belongs to the writing screens and nowhere else. Choosing
      // one no longer follows you back to the chooser or over to the typewriter.
      rootStyle: Object.assign({
        height: '100dvh', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', overflow: 'hidden',
        background: isDesk ? s.desk : DESKS[0], color: 'var(--color-text)', fontFamily: 'var(--font-body)',
        '--desk': isDesk ? s.desk : DESKS[0],
      }, isDesk && deskDark ? { '--color-text': LIGHT_INK } : {}),
      backdropUrl: isDesk && s.backdrop ? s.backdrop.url : null,
      fieldRef: this.fieldRef,
      fieldStyle: Object.assign({
        gridArea: '2 / 1', position: 'relative', minHeight: 0,
        // The typewriter scrolls for the same reason the desk does: in a short
        // window the machine is taller than the field, and the keyboard — the
        // whole point of the screen — was being cut off with no way to reach it.
        overflow: isDesk || isS6 || isS7 ? 'auto' : 'hidden',
        containerType: 'size', display: 'flex',
        // Centre the screen's contents rather than pinning them to the top.
        // The desk keeps flex-start because its own column already centres
        // itself against min-height:100% — centring a scrollable flex container
        // as well would push its top edge out of reach when content overflows.
        alignItems: isDesk || isS6 || isS7 ? 'flex-start' : 'center',
        justifyContent: 'center',
      }, isDesk && s.backdrop ? { '--color-text': s.backdrop.dark ? LIGHT_INK : INK, color: 'var(--color-text)' } : {}),
      fieldPointerDown: isS3 ? (e) => { if (s.selected && !e.target.closest('[data-obj]')) this.setState({ selected: null }); } : undefined,

      home: () => this.goBack(1),
      back: () => { const t = this.backTarget(); if (t) this.goBack(t); },
      backTitle: { 1: 'the start', 2: 'choosing what to write on', 3: 'writing', 4: 'the envelope', 6: 'the typewriter' }[this.backTarget()] || null,
      steps: this.steps(),
      topRight: isS3 ? (s.side === 'front' ? 'Front' : 'Back') : (isS5 ? 'As your reader sees it' : null),
      // Paging through a stack belongs with the status it reports on, not in the
      // row of actions — so the toolbar stays a list of things you can do.
      // The pager belongs to every screen that shows a sheet, not just the
      // writing one: without it a letter of three sheets reached the reader as
      // whichever single sheet was selected when Done was pressed.
      sheetNav: (isS3 || isS4 || (isS5 && opened)) && s.sheets.length > 1 ? {
        label: 'Sheet ' + (s.sheetIdx + 1) + ' of ' + s.sheets.length,
        prev: s.sheetIdx > 0 ? () => this.turnTo(s.sheetIdx - 1) : null,
        next: s.sheetIdx < s.sheets.length - 1 ? () => this.turnTo(s.sheetIdx + 1) : null,
      } : null,

      pickLetterPath: () => this.go(2),
      pickTypewriterPath: () => this.go(6),
      pickDiary: () => this.go(3, { medium: 'diary', paperId: 'dot' }),
      // what you clicked is what you get: the chooser shows these very papers
      pickPage: () => this.go(3, { medium: 'page', paperId: 'starsruled' }),
      pickPostcard: () => this.go(3, { medium: 'postcard', paperId: 'goldstars' }),

      showLetter: isS3 || isS4 || (isS5 && opened),
      editable: isS3,
      readOnly: !isS3,
      surfaceStyle: {
        position: 'relative', flex: 'none', color: INK, '--color-text': INK,
        // A floor that keeps the type readable — but capped at the width that
        // still fits the field's height, so a short window shrinks the sheet
        // instead of pushing it off the bottom and forcing a scroll.
        minWidth: 'min(' + (isS3 ? Math.min(p.maxW, Math.round(1200 / p.fs)) : 320) + 'px, ' + fitWidth + ')',
        width: 'min(100%, ' + p.maxW + 'px, ' + fitWidth + ')',
        aspectRatio: '1 / ' + p.aspect,
        containerType: 'inline-size',
        filter: p.cut
          ? 'drop-shadow(0 24px 30px color-mix(in srgb, #201e1d 18%, transparent)) drop-shadow(0 3px 5px color-mix(in srgb, #201e1d 13%, transparent))'
          : 'drop-shadow(0 22px 30px color-mix(in srgb, #201e1d 15%, transparent)) drop-shadow(0 2px 4px color-mix(in srgb, #201e1d 12%, transparent))',
        cursor: isS5 && canFlip ? 'pointer' : 'default',
        // The flip has to outrank the rise, or it never plays; and the rise is a
        // one-off arrival, so it must not replay every time the sheet is turned.
        animation: s.flipping
          ? 'tdFlip 520ms ease-in-out both'
          : (isS5 && !s.flipped ? 'tdRise 700ms cubic-bezier(.2,.7,.2,1) both' : 'none'),
      },
      paper: p,
      paperSrc: R(p.img),
      paperImgStyle: p.crop ? {
        position: 'absolute', left: p.crop.l + 'cqw', top: p.crop.t + 'cqw',
        width: p.crop.w + 'cqw', height: p.crop.w + 'cqw', objectFit: 'fill',
        maxWidth: 'none', maxHeight: 'none',
      } : { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: p.fit },
      drawnRules: p.rule === 'drawn',
      rulesStyle: { position: 'absolute', zIndex: 1, pointerEvents: 'none', top: p.pad[0] + 'cqw', right: p.pad[1] + 'cqw', bottom: p.pad[2] + 'cqw', left: p.pad[3] + 'cqw', background: rulesBg },
      marginRuleStyle: { position: 'absolute', zIndex: 1, top: '2cqw', bottom: '2cqw', left: (p.margin || 0) + 'cqw', width: '1px', background: 'color-mix(in srgb, var(--color-accent-2) 70%, transparent)', pointerEvents: 'none' },
      isPostcard: !!p.card,
      cardDividerStyle: { position: 'absolute', zIndex: 1, top: '8cqw', bottom: '7cqw', left: '50cqw', width: '1px', background: 'color-mix(in srgb, ' + ink + ' 28%, transparent)', pointerEvents: 'none' },
      // the three address lines sit where the design drew them: 28cqw down, one every 16% of the block's width
      cardAddressStyle: { position: 'absolute', zIndex: 3, left: '56cqw', right: '7cqw', top: 'calc(22.08cqw + 1px)' },
      addressLines: [0, 1, 2].map((i) => ({
        key: i, label: 'Address line ' + (i + 1), value: this.sheet().addresses[s.side][i],
        onChange: (e) => {
          const val = e.target.value;
          this.setState((v) => ({
            sheets: v.sheets.map((sh, j) => {
              if (j !== v.sheetIdx) return sh;
              const lines = sh.addresses[v.side].slice();
              lines[i] = val;
              return Object.assign({}, sh, { addresses: Object.assign({}, sh.addresses, { [v.side]: lines }) });
            }),
          }));
        },
      })),
      addressStyle: {
        display: 'block', boxSizing: 'border-box', width: '100%', height: '5.92cqw', margin: 0, padding: '1.6cqw 0.4cqw 0',
        border: 0, borderBottom: '1px solid color-mix(in srgb, var(--color-text) 30%, transparent)', borderRadius: 0,
        background: 'none', outline: 'none', color: ink, caretColor: 'var(--color-accent)',
        fontFamily: font.family, fontSize: FS, lineHeight: 1,
        pointerEvents: isS3 ? 'auto' : 'none',
      },

      writeRef: this.writeRef,
      mirrorRef: this.mirrorRef,
      onWrite: this.onWrite,
      onCompositionStart: this.onCompositionStart,
      onCompositionEnd: this.onCompositionEnd,
      writeStyle: Object.assign({}, textBase, { cursor: 'text' }),
      readStyle: Object.assign({}, textBase, { pointerEvents: 'none' }),
      mirrorStyle: Object.assign({}, textBase, { zIndex: 0, visibility: 'hidden', pointerEvents: 'none' }),
      shownText: s.flipping ? '' : this.activeText(),
      spell: s.spell,
      surfRef: this.surfRef,
      surfaceMouseDown: isS3 ? (e) => this.clickToType(e) : undefined,
      surfaceClick: () => {
        if (isS5 && canFlip && !s.flipping) {
          this.setState({ flipping: true });
          setTimeout(() => this.setState((v) => ({ side: v.side === 'front' ? 'back' : 'front', flipped: true })), 250);
          setTimeout(() => this.setState({ flipping: false }), 540);
        }
      },

      stickers: s.stickers.filter((k) => OBJECTS[k.kind]).map((k) => {
        const o = OBJECTS[k.kind];
        return {
          id: k.id, src: R(o.src), title: o.title, t: placed('stickers', k, o.w),
          imgStyle: { display: 'block', width: '100%', height: 'auto', filter: this.lift(k.mode || s.stickerMode, 'cqw') },
        };
      }),

      polaroids: s.polaroids.map((o) => {
        const shape = POLAROID_SHAPES[o.shape] || POLAROID_SHAPES.square;
        const k = o.scale || 1;
        return {
          id: o.id, src: R(o.src), caption: o.caption, editable: isS3,
          canReplace: isS3 && !!o.src && isSel('polaroids', o.id),
          t: placed('polaroids', o, shape.w),
          onFile: (file) => this.setPhoto(o.id, file),
          setCaption: (e) => { const val = e.target.value; this.patchObj('polaroids', o.id, { caption: val }); },
          frameStyle: { background: '#fbfaf8', padding: (0.9 * k) + 'cqw ' + (0.9 * k) + 'cqw 0', filter: 'drop-shadow(0 0.5cqw 0.9cqw color-mix(in srgb, #201e1d 26%, transparent))' },
          photoStyle: { position: 'relative', width: '100%', aspectRatio: '1 / ' + shape.aspect, background: '#e3e1de' },
          captionStyle: {
            display: 'block', width: '100%', border: 0, outline: 'none', background: 'none', textAlign: 'center',
            fontFamily: "'Courier Prime', ui-monospace, monospace", fontSize: (1.05 * k) + 'cqw', lineHeight: 1.1,
            padding: (0.7 * k) + 'cqw 0 ' + (1.1 * k) + 'cqw', color: INK, cursor: isS3 ? 'text' : 'default',
          },
        };
      }),
      replacePhotoStyle: {
        position: 'absolute', left: '50%', top: 'calc(100% + 14px)', transform: 'translateX(-50%)', whiteSpace: 'nowrap',
        padding: '4px 10px', borderRadius: '999px', background: INK, color: '#fbfaf8', cursor: 'pointer',
        fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '11px', lineHeight: 1.3,
        boxShadow: '0 1px 3px color-mix(in srgb, #201e1d 28%, transparent)',
      },

      signature: s.signature.on,
      signatureSrc: s.signature.src,
      setSignature: (file) => this.setSignature(file),
      // multiply is what makes a signature read as ink rather than a pasted
      // rectangle — but applied to an empty slot it only greys out its own
      // dashed outline and prompt
      sigStyle: {
        position: 'absolute', zIndex: 9, right: (p.pad[1] + 1) + 'cqw', bottom: (p.pad[2] + 1) + 'cqw',
        width: '22cqw', height: '7cqw', pointerEvents: isS3 ? 'auto' : 'none',
        mixBlendMode: s.signature.src ? 'multiply' : 'normal',
      },

      // — envelope —
      // Ten of them, nine photographed and one plain, each with its own aspect
      // and its own places for the address, the stamp and the wax — or none at
      // all, in which case `env` is null and none of this is rendered.
      showEnvelope: envOn && (isS4 || isS5),
      envWrapStyle: envOn ? {
        flex: 'none',
        width: 'min(100%, ' + (env.plain ? 560 : 470) + 'px, ' + envFitWidth + ')',
        minWidth: 'min(240px, ' + envFitWidth + ')',
        transition: 'transform 700ms cubic-bezier(.2,.7,.2,1)',
        transform: isS5 && s.opened ? 'translateY(10px)' : 'translateY(0)',
      } : null,
      envStyle: envOn ? {
        position: 'relative', width: '100%', aspectRatio: '1 / ' + env.aspect,
        background: env.plain ? s.envColour : 'transparent',
        color: envInk, '--color-text': envInk, containerType: 'inline-size',
        filter: 'drop-shadow(0 18px 26px color-mix(in srgb, #201e1d 17%, transparent)) drop-shadow(0 2px 4px color-mix(in srgb, #201e1d 13%, transparent))',
        cursor: isS5 && !s.opened ? 'pointer' : 'default',
      } : null,
      envImgSrc: envOn && !env.plain ? R(env.img) : null,
      envFlapStyle: envOn && env.plain
        ? { position: 'absolute', left: 0, top: 0, right: 0, height: '63%', clipPath: 'polygon(0 0, 100% 0, 50% 100%)', background: 'linear-gradient(180deg, color-mix(in srgb, #201e1d 5%, transparent) 0%, color-mix(in srgb, #201e1d 11%, transparent) 100%)', zIndex: 2 }
        : null,

      // The address is written, not drawn: three real lines, in the same hand as
      // the letter, sized off the envelope so they hold up however small it gets.
      envAddrStyle: envOn && env.addr
        ? { position: 'absolute', left: env.addr[0] + '%', top: env.addr[1] + '%', width: env.addr[2] + '%', zIndex: 3, color: envInk }
        : null,
      envAddrLabelStyle: { fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 'max(9px, 3.6cqw)', letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.55, marginBottom: '0.6cqw' },
      envAddressLines: [0, 1, 2].map((i) => ({
        key: i, label: 'Envelope address line ' + (i + 1), value: s.envAddress[i],
        placeholder: isS4 && i === 0 ? 'Name' : '',
        onChange: (e) => {
          const val = e.target.value;
          this.setState((v) => { const a = v.envAddress.slice(); a[i] = val; return { envAddress: a }; });
        },
      })),
      envAddressStyle: {
        display: 'block', boxSizing: 'border-box', width: '100%', margin: 0, padding: '0 0.4cqw 0.7cqw',
        border: 0, borderBottom: '1px solid ' + rule(envInk, 48), borderRadius: 0, background: 'none', outline: 'none',
        marginBottom: '1.5cqw', color: envInk, caretColor: 'var(--color-accent)',
        fontFamily: font.family, fontSize: 'max(10px, 4.9cqw)', lineHeight: 1.25,
        // the block is kept clear of the wax seal, so a long line trails off rather than running under it
        textOverflow: 'ellipsis',
        pointerEvents: isS4 ? 'auto' : 'none',
      },

      envelopeClick: () => { if (isS5 && !s.opened) this.setState({ opened: true }); },
      envStamp: envOn && s.stampIdx >= 0 ? { img: stampObj.src } : null,
      envStampStyle: envOn ? { position: 'absolute', right: env.stamp[0] + '%', top: env.stamp[1] + '%', width: env.stamp[2] + '%', zIndex: 4, transform: 'rotate(2deg)', filter: 'drop-shadow(0 2px 3px color-mix(in srgb, #201e1d 26%, transparent))' } : null,
      envSealSrc: R((OBJECTS[s.seal] || OBJECTS.sealSun).src),
      envSealStyle: envOn && s.seal !== 'none' ? {
        position: 'absolute', left: env.seal[0] + '%', top: env.seal[1] + '%', transform: 'translate(-50%, -50%)', zIndex: 5,
        width: env.seal[2] + '%', height: 'auto', filter: 'drop-shadow(0 3px 5px color-mix(in srgb, #201e1d 30%, transparent))',
      } : null,

      // the stamp and its country belong to every envelope; the colours only to the plain one
      showEnvBar: isS4 && envOn,
      showColours: isS4 && envOn && env.plain,
      envColour: s.envColour,
      envColours: ['#f7f5f2', '#efece7', '#e2ded7', '#d8d5d2', '#cfe3ea', '#f2dbe6'].map((c) => ({
        title: c, pick: () => this.setState({ envColour: c }),
        style: { display: 'block', width: '22px', height: '22px', borderRadius: '50%', background: c, cursor: 'pointer', boxShadow: s.envColour === c ? '0 0 0 1.5px var(--color-accent), 0 1px 2px color-mix(in srgb, #201e1d 24%, transparent)' : '0 1px 2px color-mix(in srgb, #201e1d 24%, transparent)' },
      })),
      setEnvColour: (hex) => this.setState({ envColour: hex }),
      countries: Object.keys(STAMPS),
      country: s.country,
      setCountry: (e) => this.setState({ country: e.target.value, stampIdx: 0 }),
      stamps: (STAMPS[s.country] || []).map((st, i) => ({
        key: st.obj + i,
        img: R(OBJECTS[st.obj].src), title: s.country + ' ' + st.value,
        pick: () => this.setState({ stampIdx: i }),
        style: { display: 'block', width: '24px', height: 'auto', cursor: 'pointer', opacity: s.stampIdx === i ? 1 : 0.42, filter: 'drop-shadow(0 2px 3px color-mix(in srgb, #201e1d 24%, transparent))' },
      })),

      centreHint,
      // Over a photographed desk no amount of shadow makes italic 13px reliably
      // readable, so the hint takes a quiet plate of its own instead.
      hintStyle: Object.assign({
        fontSize: '13px', fontStyle: 'italic', animation: 'tdFade 600ms ease both',
        color: s.backdrop ? 'var(--color-text)' : rule('var(--color-text)', 55),
      }, s.backdrop ? {
        padding: '5px 14px', borderRadius: '999px',
        background: s.backdrop.dark ? 'rgba(22,20,19,0.46)' : 'rgba(251,250,248,0.74)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      } : {}),

      // — typewriter —
      // the sheet is fed up out of the platen: the machine sits over its bottom edge
      machineSrc: R(MACH.src),
      machineLabel: sentence(MACH.label),
      twSheetSrc: R(twSheet.img),
      twAssemblyStyle: {
        position: 'relative', flex: 'none', minWidth: 'min(320px, 100%)', margin: 'auto 0',
        color: INK, '--color-text': INK,
        width: isS6
          ? 'min(100%, 680px, max(360px, calc(100cqh / ' + MACH.asm + ')))'
          : 'min(100%, 720px, max(480px, calc(100cqh / 0.5)))',
        aspectRatio: isS6 ? '1 / ' + MACH.asm : '1 / 0.5',
      },
      sheetStyle: isS6 ? {
        position: 'absolute', top: 0, left: MACH.sheet.left + '%', width: MACH.sheet.width + '%',
        aspectRatio: '1 / ' + MACH.sheet.aspect,
        containerType: 'inline-size', zIndex: 2, overflow: 'hidden',
        filter: 'drop-shadow(0 0.5cqw 1.1cqw color-mix(in srgb, #201e1d 16%, transparent))',
      } : {
        position: 'absolute', inset: 0, containerType: 'inline-size', zIndex: 2, overflow: 'hidden',
        filter: 'drop-shadow(0 0.4cqw 1.2cqw color-mix(in srgb, #201e1d 18%, transparent))',
      },
      // contact shading where the paper disappears behind the roller
      feedShadeStyle: isS6 ? {
        position: 'absolute', left: 0, right: 0, bottom: 0, height: (MACH.sheet.bottom + 6) + 'cqw',
        zIndex: 3, pointerEvents: 'none',
        background: 'linear-gradient(to top, color-mix(in srgb, #201e1d 30%, transparent) 0%, color-mix(in srgb, #201e1d 9%, transparent) 42%, transparent 100%)',
      } : null,
      machineWrapStyle: { position: 'absolute', left: 0, bottom: 0, width: '100%', aspectRatio: '1 / ' + MACH.machineAspect, zIndex: 4 },
      twWriteStyle: {
        position: 'absolute', left: '9cqw', right: '9cqw', top: MACH.sheet.top + 'cqw', bottom: MACH.sheet.bottom + 'cqw',
        border: 0, outline: 'none', background: 'none', resize: 'none', overflow: 'hidden',
        fontFamily: "'Courier Prime', ui-monospace, monospace",
        fontSize: 'max(10px, 1.75cqw)', lineHeight: 'max(14px, 2.6cqw)', letterSpacing: '0.01em',
        color: ink, caretColor: 'var(--color-accent)', whiteSpace: 'pre-wrap',
      },
      twReadStyle: {
        position: 'absolute', left: '9cqw', right: '9cqw', top: '5cqw', bottom: '4cqw',
        fontFamily: "'Courier Prime', ui-monospace, monospace",
        fontSize: 'max(11px, 1.55cqw)', lineHeight: 'max(15px, 2.3cqw)', letterSpacing: '0.01em',
        color: ink, whiteSpace: 'pre-wrap', overflow: 'hidden',
      },
      twText: s.twText,
      twRef: this.twRef,
      setTwText: (e) => this.setState({ twText: e.target.value }),
      keyMarks: Object.keys(KEY_MAP).filter((k) => k === s.pressed).map((k) => ({
        key: k,
        style: {
          position: 'absolute', zIndex: 3, left: KEY_MAP[k].x + '%', top: KEY_MAP[k].y + '%',
          transform: 'translate(-50%, -50%)',
          width: KEY_MAP[k].wide ? MACH.space.w + '%' : MACH.keyW + '%', height: KEY_MAP[k].wide ? MACH.space.h + '%' : 'auto',
          aspectRatio: KEY_MAP[k].wide ? 'auto' : '1', borderRadius: KEY_MAP[k].wide ? '3px' : '50%',
          background: 'color-mix(in srgb, var(--color-accent) 38%, transparent)',
          boxShadow: '0 0 12px color-mix(in srgb, var(--color-accent) 55%, transparent)',
          pointerEvents: 'none',
        },
      })),

      // — toolbar —
      menus,
      toggles,
      primary,
      counter,
      counterStyle: {
        fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '12px', letterSpacing: '0.02em',
        fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
        color: isS3 && tw >= cap ? 'var(--color-accent-2)' : 'color-mix(in srgb, var(--color-text) 45%, transparent)',
      },
    };
  }

  render() {
    const v = this.renderVals();
    return (
      <div style={v.rootStyle}>
        <Header v={v} />

        {v.backdropUrl && (
          <div
            aria-hidden="true"
            style={{ gridArea: '2 / 1', backgroundImage: `url("${v.backdropUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        )}

        <div ref={v.fieldRef} onPointerDown={v.fieldPointerDown} style={v.fieldStyle}>
          <Chooser v={v} />
          <Desk v={v} />
          <Typewriter v={v} />
        </div>

        <Toolbar v={v} />

        <input
          ref={this.fileRef} type="file" accept=".txt,.md,text/plain" aria-label="Open a text file"
          onChange={(e) => this.readFileIn(e)}
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
        />
      </div>
    );
  }
}
