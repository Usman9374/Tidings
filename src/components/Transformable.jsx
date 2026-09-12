import { useRef } from 'react';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const ACCENT = 'var(--color-accent)';
const LIFT = '0 1px 3px color-mix(in srgb, #201e1d 28%, transparent)';

const frameStyle = { position: 'absolute', inset: '-6px', border: '1px solid ' + ACCENT, borderRadius: '2px', pointerEvents: 'none' };
const stemStyle = { position: 'absolute', left: '50%', top: '-26px', width: '1px', height: '20px', marginLeft: '-0.5px', background: ACCENT, pointerEvents: 'none' };
const knobStyle = {
  position: 'absolute', left: '50%', top: '-34px', width: '14px', height: '14px', marginLeft: '-7px',
  borderRadius: '50%', background: '#fff', boxShadow: '0 0 0 1.5px ' + ACCENT + ', ' + LIFT, cursor: 'grab', touchAction: 'none',
};
const gripStyle = {
  position: 'absolute', right: '-12px', bottom: '-12px', width: '12px', height: '12px',
  background: '#fff', boxShadow: '0 0 0 1.5px ' + ACCENT + ', ' + LIFT, cursor: 'nwse-resize', touchAction: 'none',
};
const removeStyle = {
  position: 'absolute', right: '-17px', top: '-17px', width: '22px', height: '22px',
  display: 'grid', placeItems: 'center', padding: 0, border: 0, borderRadius: '50%',
  background: '#201e1d', color: '#fbfaf8', cursor: 'pointer', boxShadow: LIFT,
};

/**
 * A sticker or polaroid on the sheet: drag it to move it, the knob above turns
 * it, the corner grip resizes it and × removes it.
 *
 * Positions are the object's centre in % of the sheet — x of its width, y of
 * its height — so only move deltas are converted; angles and distances are
 * taken in screen pixels, where the sheet isn't stretched. `scale` changes the
 * width rather than applying CSS scale, so the px-sized handles stay the same
 * size on screen. Updates are coalesced to one per animation frame.
 */
export default function Transformable({
  sheetRef, x, y, rot, scale, limits, editable, selected, style,
  onSelect, onChange, onRemove, extra, children,
}) {
  const moved = useRef(false);
  const frame = useRef(0);
  const pending = useRef(null);

  const flush = () => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    const patch = pending.current;
    pending.current = null;
    if (patch) onChange(patch);
  };
  const schedule = (patch) => {
    pending.current = Object.assign(pending.current || {}, patch);
    if (!frame.current) frame.current = requestAnimationFrame(flush);
  };

  // Moves are tracked on window rather than with pointer capture: capture
  // would retarget the click that follows, and the photo well needs its click.
  // preventDefault also suppresses the mousedown, so click-to-type never fires.
  const track = (e, move) => {
    e.preventDefault();
    e.stopPropagation();
    const end = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      flush();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  };

  const centre = () => {
    const r = sheetRef.current.getBoundingClientRect();
    return { r, cx: r.left + (x / 100) * r.width, cy: r.top + (y / 100) * r.height };
  };

  const onPointerDown = (e) => {
    if (!editable || e.button !== 0 || !sheetRef.current) return;
    e.stopPropagation();
    onSelect();
    if (e.target.closest('input, textarea, label, button')) return; // captions and handles act on their own
    const { r } = centre();
    const sx = e.clientX;
    const sy = e.clientY;
    moved.current = false;
    track(e, (ev) => {
      if (!moved.current && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 3) return;
      moved.current = true;
      schedule({
        x: clamp(x + ((ev.clientX - sx) / r.width) * 100, -5, 105),
        y: clamp(y + ((ev.clientY - sy) / r.height) * 100, -5, 105),
      });
    });
  };

  // A drag ends in a click; don't let it reach the photo well's file picker.
  const onClickCapture = (e) => {
    if (!moved.current) return;
    moved.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  const startRotate = (e) => {
    if (e.button !== 0) return;
    const { cx, cy } = centre();
    const a0 = Math.atan2(e.clientY - cy, e.clientX - cx);
    track(e, (ev) => {
      let deg = rot + ((Math.atan2(ev.clientY - cy, ev.clientX - cx) - a0) * 180) / Math.PI;
      deg = ((((deg + 180) % 360) + 360) % 360) - 180;
      deg = ev.shiftKey ? Math.round(deg / 15) * 15 : (Math.abs(deg) < 3 ? 0 : deg);
      schedule({ rot: Math.round(deg * 10) / 10 });
    });
  };

  const startResize = (e) => {
    if (e.button !== 0) return;
    const { cx, cy } = centre();
    const d0 = Math.max(8, Math.hypot(e.clientX - cx, e.clientY - cy));
    track(e, (ev) => {
      const s = clamp((scale * Math.hypot(ev.clientX - cx, ev.clientY - cy)) / d0, limits[0], limits[1]);
      schedule({ scale: Math.round(s * 1000) / 1000 });
    });
  };

  return (
    <div
      data-obj="" onPointerDown={onPointerDown} onClickCapture={onClickCapture}
      style={Object.assign({}, style, {
        touchAction: 'none', userSelect: 'none',
        pointerEvents: editable ? 'auto' : 'none', cursor: editable ? 'grab' : 'default',
      })}
    >
      {children}
      {editable && selected && (
        <>
          <span aria-hidden="true" style={frameStyle} />
          <span aria-hidden="true" style={stemStyle} />
          <span role="presentation" title="Turn · hold Shift to snap" onPointerDown={startRotate} style={knobStyle} />
          <span role="presentation" title="Resize" onPointerDown={startResize} style={gripStyle} />
          <button
            type="button" aria-label="Remove" title="Remove"
            onPointerDown={(e) => e.stopPropagation()} onClick={onRemove} style={removeStyle}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M2 2l6 6M8 2 2 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          {extra}
        </>
      )}
    </div>
  );
}
