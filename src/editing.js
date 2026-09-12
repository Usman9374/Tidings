// The letter editor's DOM work: where a click lands, where text ends, and
// inserting text through execCommand so each change is one native undo step.
// The inserts return false when the browser refuses, so callers can fall back
// to writing the text themselves.

export function caretFromPoint(x, y) {
  if (document.caretPositionFromPoint) {
    const p = document.caretPositionFromPoint(x, y);
    return p && p.offsetNode ? { node: p.offsetNode, offset: p.offset } : null;
  }
  if (document.caretRangeFromPoint) {
    const r = document.caretRangeFromPoint(x, y);
    return r ? { node: r.startContainer, offset: r.startOffset } : null;
  }
  return null;
}

// The character after a caret position, looking across the adjacent text
// nodes execCommand leaves behind; a <br> reads as a newline, '' is the end.
export function nextChar(root, pos) {
  const r = document.createRange();
  r.setStart(pos.node, pos.offset);
  r.setEnd(root, root.childNodes.length);
  const walk = document.createTreeWalker(r.cloneContents(), NodeFilter.SHOW_ALL);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (n.nodeName === 'BR') return '\n';
    if (n.nodeType === 3 && n.data.length) return n.data[0];
  }
  return '';
}

// A caret position as a character offset into the root's text.
export function textOffset(root, pos) {
  const r = document.createRange();
  r.selectNodeContents(root);
  r.setEnd(pos.node, pos.offset);
  return r.toString().length;
}

// Where a run of text ends, measured on a hidden copy of the editor with a
// zero-width marker after the last character. (A caret after a trailing
// newline measures as zeros, and the editor itself may be scrolled.)
export function measureEnd(mirror, text) {
  mirror.textContent = text;
  const mark = document.createElement('span');
  mark.textContent = '\u200b';
  mirror.appendChild(mark);
  const q = mark.getBoundingClientRect();
  return { left: q.left, top: q.top, height: q.height };
}

// Focus an editable and put the caret at 'end', select 'all', or at a {node, offset}.
export function focusAt(el, where) {
  el.focus({ preventScroll: true });
  const range = document.createRange();
  if (where === 'end' || where === 'all') {
    range.selectNodeContents(el);
    if (where === 'end') range.collapse(false);
  } else {
    range.setStart(where.node, where.offset);
    range.collapse(true);
  }
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

// Pad from the caret with real line breaks, then spaces, until it reaches the
// target position ({ idx: line in reading order, xIn: x within its column }).
// `caretAt()` re-measures the caret after every break rather than trusting
// arithmetic: at the end of a text that ends in a newline, the browser puts the
// first break before that newline. Consecutive typing commands share one undo
// step. False means nothing could be inserted.
export function padTo(target, caretAt, spaceW) {
  let c = caretAt();
  let inserted = false;
  for (let guard = target.idx - c.idx + 2; c.idx < target.idx && guard > 0; guard -= 1) {
    if (!document.execCommand('insertLineBreak')) break;
    inserted = true;
    c = caretAt();
  }
  if (c.idx !== target.idx) return inserted;
  const spaces = Math.round((target.xIn - c.xIn) / spaceW);
  if (spaces <= 0) return true;
  return document.execCommand('insertText', false, ' '.repeat(spaces)) || inserted;
}

const escapeHtml = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Replace everything in the editor as one undoable step.
export function replaceAll(el, text) {
  focusAt(el, 'all');
  if (!text) return document.execCommand('delete');
  return document.execCommand('insertHTML', false, escapeHtml(text));
}

// The selection as character offsets into an editor's text.
export function selectionOffsets(el) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return null;
  const r = sel.getRangeAt(0);
  if (!el.contains(r.startContainer)) return null;
  const start = textOffset(el, { node: r.startContainer, offset: r.startOffset });
  return { start, end: start + r.toString().length };
}

let ctx = null;
export function spaceWidth(family, px) {
  ctx = ctx || document.createElement('canvas').getContext('2d');
  ctx.font = `${px}px ${family}`;
  return ctx.measureText(' ').width || px * 0.3;
}

export const isTyping = (el) => !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
