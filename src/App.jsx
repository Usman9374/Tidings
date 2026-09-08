import React from 'react';
import { R } from './assets';
import {
  A, SEED_FRONT, SEED_BACK, SEED_TW, SURFACES, OBJECTS, TRAY_ORDER,
  SEAL_CHOICES, BLANK, STAMPS, FORMATS, SKELETONS, DESKS, MACHINES,
  keyMapFor, words,
} from './data';
import Header from './screens/Header';
import Chooser from './screens/Chooser';
import Desk from './screens/Desk';
import Typewriter from './screens/Typewriter';
import Toolbar from './screens/Toolbar';
import ImageSlot from './components/ImageSlot';

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
  fieldRef = React.createRef();
  twRef = React.createRef();
  fileRef = React.createRef();

  state = {
    screen: (this.props && this.props.startScreen) || 1,
    medium: 'diary',
    paperId: 'dot',
    deskIdx: 0,
    deskSlot: false,
    sheets: [{ front: SEED_FRONT, back: SEED_BACK }],
    sheetIdx: 0,
    side: 'front',
    stickers: [
      { id: 1, kind: 'starGold', x: 92, y: 7, rot: -14 },
      { id: 2, kind: 'starRed', x: 6, y: 91, rot: 11 },
      { id: 3, kind: 'goldfish', x: 84, y: 92, rot: -5 },
    ],
    stickerMode: 'shadow',
    polaroids: [
      { id: 4, shape: 'landscape', x: 60, y: 62, rot: 2.4, caption: 'the kitchen table at four', src: A + 'typewriter1.jpeg' },
    ],
    hand: null,
    signature: false,
    spell: false,
    format: 'love letter',
    envAsked: false,
    envOn: false,
    envColour: '#efece7',
    seal: 'sealSun',
    country: 'JAPAN',
    stampIdx: 0,
    opened: false,
    flipped: false,
    flipping: false,
    copied: false,
    twText: SEED_TW,
    machine: 'olympia',
    envStyleId: 'plain',
    pressed: null,
    nextId: 20,
    docSeq: 0,
    fileTarget: 'letter',
  };

  componentDidMount() {
    this.onKey = (e) => {
      if (this.state.screen !== 6) return;
      const k = (e.key || '').toUpperCase();
      const key = e.key === ' ' ? ' ' : k;
      if (keyMapFor(this.state.machine)[key]) {
        this.setState({ pressed: key });
        clearTimeout(this.keyT);
        this.keyT = setTimeout(() => this.setState({ pressed: null }), 200);
      }
    };
    window.addEventListener('keydown', this.onKey);
    this.syncDoc();
  }

  // the writing surface is an uncontrolled contentEditable so it can carry
  // real columns and keep the caret; push text in only when the sheet changes
  docKey() {
    const s = this.state;
    return [s.medium, s.paperId, s.sheetIdx, s.side, s.docSeq, s.screen].join('|');
  }

  syncDoc() {
    const el = this.writeRef.current;
    const key = this.docKey();
    if (!el) { this._docKey = null; return; }
    if (this._docKey === key) return;
    this._docKey = key;
    el.innerText = this.activeText();
  }

  componentDidUpdate() { this.syncDoc(); }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKey);
    clearTimeout(this.keyT);
  }

  limit() { return (this.props && this.props.wordLimit) || 700; }
  paper() { const l = SURFACES[this.state.medium]; return l.find((p) => p.id === this.state.paperId) || l[0]; }
  sheet() { return this.state.sheets[this.state.sheetIdx] || { front: '', back: '' }; }
  activeText() { return this.sheet()[this.state.side] || ''; }
  totalWords() { return this.state.sheets.reduce((n, s) => n + words(s.front) + words(s.back), 0); }

  setSideText(v) {
    const cap = this.limit();
    const others = this.totalWords() - words(this.activeText());
    let next = v;
    if (others + words(v) > cap) {
      const keep = Math.max(0, cap - others);
      next = v.split(/(\s+)/).reduce((acc, part) => (words(acc) < keep ? acc + part : acc), '');
    }
    const trimmed = next !== v;
    this.setState((s) => ({
      sheets: s.sheets.map((sh, i) => (i === s.sheetIdx ? Object.assign({}, sh, { [s.side]: next }) : sh)),
      docSeq: trimmed ? s.docSeq + 1 : s.docSeq,
    }));
  }

  // typed straight onto the paper — read the surface, never write back to it
  // (docKey is unchanged while typing, so syncDoc leaves the caret alone)
  onWrite(e) {
    this.setSideText(e.currentTarget.innerText.replace(/\n$/, ''));
  }

  // pick an object up off the desk and carry it to the paper
  grabNew(e, kind) {
    e.preventDefault();
    this.setState({ hand: { kind, x: e.clientX, y: e.clientY } });
    const move = (ev) => this.setState((s) => ({ hand: s.hand ? Object.assign({}, s.hand, { x: ev.clientX, y: ev.clientY }) : null }));
    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      this.setState({ hand: null });
      const surf = this.surfRef.current;
      if (!surf) return;
      const r = surf.getBoundingClientRect();
      if (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom) return;
      const x = ((ev.clientX - r.left) / r.width) * 100;
      const y = ((ev.clientY - r.top) / r.height) * 100;
      const rot = Math.round((Math.random() - 0.5) * 26);
      this.setState((s) => {
        if (kind === 'polaroid') return { polaroids: s.polaroids.concat([{ id: s.nextId, shape: 'portrait', x: x - 9, y: y - 9, rot: rot / 3, caption: '', src: '' }]), nextId: s.nextId + 1 };
        if (kind === 'own') return { stickers: s.stickers.concat([{ id: s.nextId, kind: 'own', x, y, rot: rot / 2 }]), nextId: s.nextId + 1 };
        const k = kind === 'stamp' ? 'stamp' : kind;
        return { stickers: s.stickers.concat([{ id: s.nextId, kind: k, x, y, rot }]), nextId: s.nextId + 1 };
      });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  drag(e, id, coll) {
    e.preventDefault();
    e.stopPropagation();
    const surf = this.surfRef.current;
    if (!surf) return;
    const r = surf.getBoundingClientRect();
    const move = (ev) => {
      const x = Math.max(-10, Math.min(104, ((ev.clientX - r.left) / r.width) * 100));
      const y = Math.max(-10, Math.min(104, ((ev.clientY - r.top) / r.height) * 100));
      this.setState((s) => ({ [coll]: s[coll].map((o) => (o.id === id ? Object.assign({}, o, { x, y }) : o)) }));
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  copy(text) {
    try { navigator.clipboard.writeText(text); } catch (err) { /* clipboard unavailable */ }
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 1600);
  }

  download() {
    const blob = new Blob([this.state.twText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tidings.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  readFileIn(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const target = this.state.fileTarget;
    const fr = new FileReader();
    fr.onload = () => {
      const t = String(fr.result || '');
      if (target === 'tw') this.setState({ twText: t.slice(0, 4000) });
      else this.setSideText(t);
    };
    fr.readAsText(f);
    e.target.value = '';
  }

  word(label, go, opts) {
    const o = opts || {};
    return {
      label, go, title: o.title || label,
      style: {
        background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit',
        fontSize: '12px', letterSpacing: '0.13em', textTransform: 'uppercase',
        color: o.on ? 'var(--color-accent)' : (o.quiet ? 'color-mix(in srgb, var(--color-text) 42%, transparent)' : 'color-mix(in srgb, var(--color-text) 72%, transparent)'),
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
    const ink = (this.props && this.props.letterInk) || '#201e1d';
    const cap = this.limit();
    const tw = this.totalWords();
    const isS3 = s.screen === 3, isS4 = s.screen === 4, isS5 = s.screen === 5;
    const isDesk = s.screen >= 3 && s.screen <= 5;
    const askEnvelope = isS4 && s.medium === 'postcard' && !s.envAsked;
    const canFlip = !!(this.sheet().back || '').trim();
    const opened = s.opened || !s.envOn;
    const rule = (p.lh * 0.755).toFixed(3);
    const rulesBg = 'repeating-linear-gradient(to bottom, transparent 0, transparent calc(' + rule + 'cqw - 1px), color-mix(in srgb, ' + ink + ' 22%, transparent) calc(' + rule + 'cqw - 1px), color-mix(in srgb, ' + ink + ' 22%, transparent) ' + rule + 'cqw, transparent ' + rule + 'cqw, transparent ' + p.lh.toFixed(4) + 'cqw)';
    // the element IS the text area (insets, no padding) so overflow columns are
    // clipped outside it; column-* is only set when the surface really has leaves
    const textBase = {
      position: 'absolute', zIndex: 2, border: 0, outline: 'none', background: 'none',
      top: p.pad[0] + 'cqw', right: p.pad[1] + 'cqw', bottom: p.pad[2] + 'cqw', left: p.pad[3] + 'cqw',
      overflow: 'hidden', whiteSpace: 'pre-wrap',
      fontFamily: "'Courier Prime', ui-monospace, monospace",
      fontSize: p.fs + 'cqw', lineHeight: p.lh + 'cqw', color: ink,
      caretColor: 'var(--color-accent)',
    };
    if (p.cols > 1) {
      textBase.columnCount = p.cols;
      textBase.columnGap = (p.gap || 0) + 'cqw';
      textBase.columnFill = 'auto';
    }
    const polSize = { portrait: [18, 1.25], landscape: [24, 0.72], square: [20, 1] };
    const MACH = MACHINES[s.machine] || MACHINES.olympia;
    const KEY_MAP = keyMapFor(s.machine);
    const stampPick = (STAMPS[s.country] || [])[s.stampIdx] || STAMPS.JAPAN[0];
    const stampObj = { src: R(OBJECTS[stampPick.obj].src), value: stampPick.value };

    const centreHint = isS5 && !opened ? 'click the envelope' : (isS5 && opened && canFlip && !s.flipped ? 'something is written on the back — click the paper' : (isS3 ? 'drag anything from the desk below onto the letter · double-click to take it off' : null));

    // How wide the sheet may be before it is taller than the field it sits in.
    // 100cqh is the field's own height (it declares container-type: size), so
    // this stays a pure CSS rule and needs no measuring. The sheet does not get
    // the field to itself, though: the desk column adds its own padding, a 20px
    // gap and — on most screens — a line of text above or below. Reserving that
    // chrome is what keeps the sheet inside the field instead of 16px past it.
    const deskChrome = 40 + (centreHint ? 39 : 0) + (askEnvelope ? 42 : 0);
    const fitWidth = 'calc((' + (((isS4 || isS5) && s.envOn) ? 46 : 100) + 'cqh - ' + deskChrome + 'px) / ' + p.aspect + ')';

    const wordList = [];
    if (isS3) {
      SURFACES[s.medium].forEach((o) => wordList.push(this.word(o.label, () => this.setState({ paperId: o.id }), { on: o.id === s.paperId, title: 'paper: ' + o.label })));
      wordList.push(this.word(canFlip || s.side === 'back' ? 'turn over' : 'write on the back', () => this.setState((v) => ({ side: v.side === 'front' ? 'back' : 'front' })), { quiet: true }));
      wordList.push(this.word('add a page', () => this.setState((v) => ({ sheets: v.sheets.concat([{ front: '', back: '' }]), sheetIdx: v.sheets.length, side: 'front' })), { quiet: true }));
      wordList.push(this.word(s.signature ? 'unsign' : 'sign it', () => this.setState((v) => ({ signature: !v.signature })), { quiet: true, on: s.signature }));
      wordList.push(this.word(s.stickerMode === 'outline' ? 'white outline' : 'drop shadow', () => this.setState((v) => ({ stickerMode: v.stickerMode === 'outline' ? 'shadow' : 'outline' })), { quiet: true, title: 'how the objects sit on the paper' }));
      wordList.push(this.word('backdrop', () => this.setState((v) => ({ deskIdx: (v.deskIdx + 1) % DESKS.length, deskSlot: false })), { quiet: true }));
      wordList.push(this.word(s.deskSlot ? 'no backdrop' : 'my backdrop', () => this.setState((v) => ({ deskSlot: !v.deskSlot })), { quiet: true, on: s.deskSlot }));
      wordList.push(this.word('open a file', () => { this.setState({ fileTarget: 'letter' }); if (this.fileRef.current) this.fileRef.current.click(); }, { quiet: true }));
      wordList.push(this.word('spell check', () => this.setState((v) => ({ spell: !v.spell })), { quiet: true, on: s.spell }));
      wordList.push(this.word('done', () => this.setState({ screen: s.medium === 'postcard' ? 4 : 5, opened: false, flipped: false }), { on: true }));
    }
    if (isS4 && !askEnvelope) {
      wordList.push(this.word('keep writing', () => this.setState({ screen: 3 }), { quiet: true }));
      wordList.push(this.word(s.copied ? 'link copied' : 'copy the link', () => this.copy('https://tidings.letters/r/7f42a9'), { quiet: true }));
      wordList.push(this.word('send it', () => this.setState({ screen: 5, opened: false, flipped: false }), { on: true }));
    }
    if (isS5) {
      wordList.push(this.word(s.copied ? 'link copied' : 'copy the link', () => this.copy('https://tidings.letters/r/7f42a9'), { quiet: true }));
      ['whatsapp', 'mail', 'messages'].forEach((t) => wordList.push(this.word(t, () => this.copy('https://tidings.letters/r/7f42a9'), { quiet: true })));
      wordList.push(this.word('seal it again', () => this.setState({ opened: false, flipped: false, side: 'front' }), { quiet: true }));
    }
    if (s.screen === 6) {
      Object.keys(MACHINES).forEach((id) => wordList.push(this.word(MACHINES[id].label, () => this.setState({ machine: id }), { on: s.machine === id, title: 'switch machine' })));
      wordList.push(this.word('open a file', () => { this.setState({ fileTarget: 'tw' }); if (this.fileRef.current) this.fileRef.current.click(); }, { quiet: true }));
      wordList.push(this.word('spell check', () => this.setState((v) => ({ spell: !v.spell })), { quiet: true, on: s.spell }));
      wordList.push(this.word('send as a letter', () => this.setState((v) => ({ screen: 3, medium: 'page', paperId: 'cream', sheets: [{ front: v.twText, back: '' }], sheetIdx: 0, side: 'front' })), { quiet: true }));
      wordList.push(this.word('done', () => this.setState({ screen: 7 }), { on: true }));
    }
    if (s.screen === 7) {
      wordList.push(this.word('download the file', () => this.download(), { quiet: true }));
      wordList.push(this.word(s.copied ? 'copied' : 'copy the text', () => this.copy(s.twText), { quiet: true }));
      wordList.push(this.word('send as a letter', () => this.setState((v) => ({ screen: 3, medium: 'page', paperId: 'cream', sheets: [{ front: v.twText, back: '' }], sheetIdx: 0, side: 'front' })), { on: true }));
    }

    return {
      isS1: s.screen === 1, isS2: s.screen === 2, isS3, isS4, isS5, isS6: s.screen === 6, isS7: s.screen === 7,
      isDesk, isTypewriter: s.screen === 6 || s.screen === 7,
      desk: s.deskSlot ? '#e9e7e4' : DESKS[s.deskIdx],
      deskSlot: s.deskSlot,
      fieldRef: this.fieldRef,
      fieldStyle: {
        position: 'relative', minHeight: 0, overflow: isDesk ? 'auto' : 'hidden',
        containerType: 'size', display: 'flex',
        // Centre the screen's contents rather than pinning them to the top.
        // The desk keeps flex-start because its own column already centres
        // itself against min-height:100% — centring a scrollable flex container
        // as well would push its top edge out of reach when content overflows.
        alignItems: isDesk ? 'flex-start' : 'center',
        justifyContent: 'center',
      },

      restart: () => this.setState({ screen: 1, opened: false, flipped: false, envOn: false, envAsked: false }),
      backWord: s.screen === 1 ? null : (s.screen === 2 ? 'back' : (isS3 ? 'start again' : (s.screen === 6 ? 'back' : 'back'))),
      back: () => this.setState((v) => ({ screen: v.screen === 2 ? 1 : (v.screen === 3 ? 2 : (v.screen === 7 ? 6 : (v.screen === 6 ? 1 : 3))) })),
      topRight: isS3 ? 'sheet ' + (s.sheetIdx + 1) + ' of ' + s.sheets.length + ' · ' + s.side : (isS5 ? 'as your reader sees it' : null),

      pickLetterPath: () => this.setState({ screen: 2 }),
      pickTypewriterPath: () => this.setState({ screen: 6 }),
      pickDiary: () => this.setState({ medium: 'diary', paperId: 'dot', screen: 3, envOn: false, envAsked: false }),
      pickPage: () => this.setState({ medium: 'page', paperId: 'cream', screen: 3, envOn: false, envAsked: false }),
      pickPostcard: () => this.setState({ medium: 'postcard', paperId: 'cream', screen: 3, envOn: false, envAsked: false }),

      askEnvelope,
      envYes: () => this.setState({ envAsked: true, envOn: true }),
      envNo: () => this.setState({ envAsked: true, envOn: false }),

      showLetter: isS3 || (isS4 && !askEnvelope) || (isS5 && opened),
      editable: isS3,
      readOnly: !isS3,
      surfaceStyle: {
        position: 'relative', flex: 'none',
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
        animation: isS5 ? 'tdRise 700ms cubic-bezier(.2,.7,.2,1) both' : (s.flipping ? 'tdFlip 520ms ease-in-out both' : 'none'),
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
      cardDividerStyle: { position: 'absolute', zIndex: 1, top: '8cqw', bottom: '7cqw', left: '50cqw', width: '1px', background: 'color-mix(in srgb, ' + ink + ' 28%, transparent)' },
      cardAddressStyle: { position: 'absolute', zIndex: 1, left: '56cqw', right: '7cqw', top: '28cqw' },

      writeRef: this.writeRef,
      onWrite: (e) => this.onWrite(e),
      writeStyle: Object.assign({}, textBase, { cursor: 'text' }),
      readStyle: Object.assign({}, textBase, { pointerEvents: 'none' }),
      shownText: s.flipping ? '' : this.activeText(),
      spell: s.spell,
      surfRef: this.surfRef,
      surfaceClick: () => {
        if (isS5 && canFlip && !s.flipping) {
          this.setState({ flipping: true });
          setTimeout(() => this.setState((v) => ({ side: v.side === 'front' ? 'back' : 'front', flipped: true })), 250);
          setTimeout(() => this.setState({ flipping: false }), 540);
        }
      },

      stickers: s.stickers.map((k) => {
        const o = OBJECTS[k.kind];
        const base = {
          position: 'absolute', zIndex: 4, left: k.x + '%', top: k.y + '%',
          transform: 'translate(-50%, -50%) rotate(' + (k.rot || 0) + 'deg)',
          cursor: 'grab', touchAction: 'none', userSelect: 'none',
        };
        const common = {
          id: k.id,
          grab: (e) => this.drag(e, k.id, 'stickers'),
          remove: () => this.setState((v) => ({ stickers: v.stickers.filter((q) => q.id !== k.id) })),
        };
        if (!o) return Object.assign(common, { src: BLANK, style: Object.assign(base, { display: 'block', width: '13cqw', height: '13cqw', outline: '1px dashed color-mix(in srgb, var(--color-accent) 55%, transparent)', outlineOffset: '2px' }) });
        return Object.assign(common, {
          src: R(o.src),
          style: Object.assign(base, {
            display: 'block', width: o.w + 'cqw', height: 'auto',
            filter: this.lift(k.mode || s.stickerMode, 'cqw'),
          }),
        });
      }),

      polaroids: s.polaroids.map((o) => {
        const dim = polSize[o.shape] || polSize.square;
        return {
          id: o.id,
          slotId: 'tidings-polaroid-' + o.id,
          caption: o.caption, src: R(o.src || ''),
          grab: (e) => this.drag(e, o.id, 'polaroids'),
          setCaption: (e) => { const val = e.target.value; this.setState((v) => ({ polaroids: v.polaroids.map((q) => (q.id === o.id ? Object.assign({}, q, { caption: val }) : q)) })); },
          frameStyle: { position: 'absolute', zIndex: 5, left: o.x + '%', top: o.y + '%', width: dim[0] + 'cqw', transform: 'rotate(' + (o.rot || 0) + 'deg)', background: '#fbfaf8', padding: '0.9cqw 0.9cqw 0', filter: 'drop-shadow(0 0.5cqw 0.9cqw color-mix(in srgb, #201e1d 26%, transparent))' },
          gripStyle: { position: 'absolute', inset: '-0.9cqw -0.9cqw auto', height: '1.9cqw', cursor: 'grab', touchAction: 'none' },
          photoStyle: { position: 'relative', width: '100%', aspectRatio: '1 / ' + dim[1], background: '#e3e1de' },
          captionStyle: { width: '100%', border: 0, outline: 'none', background: 'none', textAlign: 'center', fontFamily: "'Courier Prime', ui-monospace, monospace", fontSize: '1.05cqw', lineHeight: 1.1, padding: '0.7cqw 0 1.1cqw', color: '#201e1d' },
        };
      }),

      signature: s.signature,
      sigStyle: { position: 'absolute', zIndex: 5, right: (p.pad[1] + 1) + 'cqw', bottom: (p.pad[2] + 1) + 'cqw', width: '22cqw', height: '7cqw', mixBlendMode: 'multiply' },

      showTray: isS3,
      tray: TRAY_ORDER.map((kind, i) => {
        const tilt = [-9, 6, -4, 11, -7, 3, -6, 8, -3, 5, -8, 4, 7, -5, 2, -10, 4, -3, 6, 0][i] || 0;
        const base = { cursor: 'grab', touchAction: 'none', userSelect: 'none', transition: 'transform 220ms cubic-bezier(.2,.7,.2,1)', transform: 'rotate(' + tilt + 'deg)' };
        if (kind === 'polaroid') return { key: kind, src: BLANK, title: 'polaroid', grab: (e) => this.grabNew(e, 'polaroid'), style: Object.assign({ display: 'block', width: '27px', height: '33px', flex: 'none', background: '#fbfaf8', boxShadow: 'inset 0 0 0 3px #fbfaf8, inset 0 0 0 4px #d8d3ce, 0 3px 4px color-mix(in srgb, #201e1d 26%, transparent)' }, base) };
        if (kind === 'own') return { key: kind, src: BLANK, title: 'drop in your own cut-out', grab: (e) => this.grabNew(e, 'own'), style: Object.assign({ display: 'block', width: '27px', height: '27px', flex: 'none', outline: '1px dashed color-mix(in srgb, var(--color-accent) 60%, transparent)', outlineOffset: '2px' }, base) };
        const o = OBJECTS[kind];
        return {
          key: kind,
          src: R(o.src), title: o.title,
          grab: (e) => this.grabNew(e, kind),
          style: Object.assign({ display: 'block', height: o.w > 14 ? '26px' : '32px', width: 'auto', flex: 'none', filter: this.lift('shadow', 'px') }, base),
        };
      }),
      trayNote: 'drag any of these onto the letter · double-click to take it off',

      hand: s.hand ? { src: R((OBJECTS[s.hand.kind] || {}).src || BLANK) } : null,
      handStyle: s.hand ? Object.assign(
        { position: 'fixed', left: s.hand.x + 'px', top: s.hand.y + 'px', zIndex: 90, pointerEvents: 'none', display: 'block' },
        s.hand.kind === 'polaroid' ? { width: '36px', height: '44px', background: '#fbfaf8', boxShadow: 'inset 0 0 0 4px #fbfaf8, inset 0 0 0 5px #d8d3ce', transform: 'translate(-50%, -50%)' }
          : s.hand.kind === 'own' ? { width: '36px', height: '36px', outline: '1px dashed var(--color-accent)', transform: 'translate(-50%, -50%)' }
            : { height: (OBJECTS[s.hand.kind] && OBJECTS[s.hand.kind].w > 14) ? '40px' : '46px', width: 'auto', transform: 'translate(-50%, -50%) rotate(-6deg)', filter: this.lift('shadow', 'px') }
      ) : null,

      // — envelope —
      showEnvelope: (isS4 && s.envOn && !askEnvelope) || (isS5 && s.envOn),
      envWrapStyle: {
        flex: 'none',
        // same fit-before-floor rule as the sheet, so a short window shrinks
        // the envelope rather than pushing the pair out of view
        width: 'min(100%, 560px, calc((34cqh - 34px) / 0.62))',
        minWidth: 'min(320px, calc((34cqh - 34px) / 0.62))',
        transition: 'transform 700ms cubic-bezier(.2,.7,.2,1)',
        transform: isS5 && s.opened ? 'translateY(10px)' : 'translateY(0)',
      },
      envStyle: {
        position: 'relative', width: '100%', aspectRatio: '100 / 62', background: s.envColour,
        containerType: 'inline-size', fontSize: '14px',
        filter: 'drop-shadow(0 18px 26px color-mix(in srgb, #201e1d 17%, transparent)) drop-shadow(0 2px 4px color-mix(in srgb, #201e1d 13%, transparent))',
        cursor: isS5 && !s.opened ? 'pointer' : 'default',
      },
      envFlapStyle: { position: 'absolute', left: 0, top: 0, right: 0, height: '63%', clipPath: 'polygon(0 0, 100% 0, 50% 100%)', background: 'linear-gradient(180deg, color-mix(in srgb, #201e1d 5%, transparent) 0%, color-mix(in srgb, #201e1d 11%, transparent) 100%)', zIndex: 2 },
      envelopeClick: () => { if (isS5 && !s.opened) this.setState({ opened: true }); },
      envStamp: s.stampIdx >= 0 ? { img: stampObj.src } : null,
      envStampStyle: { position: 'absolute', right: '7%', top: '8%', width: '15%', zIndex: 3, transform: 'rotate(2deg)', filter: 'drop-shadow(0 2px 3px color-mix(in srgb, #201e1d 26%, transparent))' },
      envSealSrc: R((OBJECTS[s.seal] || OBJECTS.sealSun).src),
      envSealStyle: s.seal === 'none' ? null : {
        position: 'absolute', left: '50%', top: '63%', transform: 'translate(-50%, -50%)', zIndex: 4,
        width: '13%', height: 'auto', filter: 'drop-shadow(0 3px 5px color-mix(in srgb, #201e1d 30%, transparent))',
      },

      showColours: isS4 && s.envOn && !askEnvelope,
      envColour: s.envColour,
      envColours: ['#f7f5f2', '#efece7', '#e2ded7', '#d8d5d2', '#cfe3ea', '#f2dbe6'].map((c) => ({
        title: c, pick: () => this.setState({ envColour: c }),
        style: { display: 'block', width: '22px', height: '22px', borderRadius: '50%', background: c, cursor: 'pointer', boxShadow: s.envColour === c ? '0 0 0 1.5px var(--color-accent), 0 1px 2px color-mix(in srgb, #201e1d 24%, transparent)' : '0 1px 2px color-mix(in srgb, #201e1d 24%, transparent)' },
      })),
      setEnvColour: (e) => this.setState({ envColour: e.target.value }),
      seals: SEAL_CHOICES.map((id) => ({
        key: id,
        title: id === 'none' ? 'no seal' : OBJECTS[id].title,
        src: id === 'none' ? BLANK : R(OBJECTS[id].src),
        pick: () => this.setState({ seal: id }),
        style: id === 'none'
          ? { display: 'block', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', outline: '1px dashed color-mix(in srgb, var(--color-text) 30%, transparent)', outlineOffset: '-1px', opacity: s.seal === 'none' ? 1 : 0.45 }
          : { display: 'block', width: '26px', height: 'auto', cursor: 'pointer', opacity: s.seal === id ? 1 : 0.42, filter: 'drop-shadow(0 2px 3px color-mix(in srgb, #201e1d 26%, transparent))' },
      })),
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

      // — typewriter —
      // the sheet is fed up out of the platen: the machine sits over its bottom edge
      machines: Object.keys(MACHINES).map((id) => this.word(MACHINES[id].label, () => this.setState({ machine: id }), { on: s.machine === id })),
      machineSrc: R(MACH.src),
      twAssemblyStyle: {
        position: 'relative', flex: 'none', minWidth: 'min(320px, 100%)', margin: 'auto 0',
        width: s.screen === 6
          ? 'min(100%, 680px, max(360px, calc(100cqh / ' + MACH.asm + ')))'
          : 'min(100%, 720px, max(480px, calc(100cqh / 0.5)))',
        aspectRatio: s.screen === 6 ? '1 / ' + MACH.asm : '1 / 0.5',
      },
      sheetStyle: s.screen === 6 ? {
        position: 'absolute', top: 0, left: MACH.sheet.left + '%', width: MACH.sheet.width + '%',
        aspectRatio: '1 / ' + MACH.sheet.aspect,
        containerType: 'inline-size', zIndex: 2, overflow: 'hidden',
        filter: 'drop-shadow(0 0.5cqw 1.1cqw color-mix(in srgb, #201e1d 16%, transparent))',
      } : {
        position: 'absolute', inset: 0, containerType: 'inline-size', zIndex: 2, overflow: 'hidden',
        filter: 'drop-shadow(0 0.4cqw 1.2cqw color-mix(in srgb, #201e1d 18%, transparent))',
      },
      // contact shading where the paper disappears behind the roller
      feedShadeStyle: s.screen === 6 ? {
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

      words: wordList,
      showFormats: isS3 || s.screen === 6,
      formats: FORMATS,
      format: s.format,
      setFormat: (e) => {
        const f = e.target.value;
        this.setState({ format: f });
        if (s.screen === 6) this.setState({ twText: SKELETONS[f] || '' });
        else this.setSideText(SKELETONS[f] || '');
      },
      counter: isS3 ? tw + ' / ' + cap : (s.screen === 6 || s.screen === 7 ? words(s.twText) + ' words' : null),
      counterStyle: { marginLeft: 'auto', fontSize: '12px', letterSpacing: '0.1em', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', color: tw >= cap ? 'var(--color-accent-2)' : 'color-mix(in srgb, var(--color-text) 40%, transparent)' },

      fileRef: this.fileRef,
      readFile: (e) => this.readFileIn(e),
    };
  }

  render() {
    const v = this.renderVals();
    return (
      <div style={{
        height: '100dvh', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto',
        overflow: 'hidden', background: v.desk, color: 'var(--color-text)', fontFamily: 'var(--font-body)',
      }}>
        <Header v={v} />

        <div ref={v.fieldRef} style={v.fieldStyle}>
          {v.deskSlot && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.9 }}>
              <ImageSlot id="tidings-desk" shape="rect" fit="cover" placeholder="Drop an HD backdrop" />
            </div>
          )}

          <Chooser v={v} />
          <Desk v={v} />
          <Typewriter v={v} />

          {v.hand && <img src={v.hand.src} alt="" draggable="false" style={v.handStyle} />}
        </div>

        <Toolbar v={v} />

        <input
          type="file" ref={v.fileRef} accept=".txt,.md,text/plain" onChange={v.readFile}
          style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
        />
      </div>
    );
  }
}
