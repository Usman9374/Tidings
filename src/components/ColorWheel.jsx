import { useEffect, useRef, useState } from 'react';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  const n = m ? parseInt(m[1], 16) : 0xf3f2f2;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const rgbToHex = (rgb) => '#' + rgb.map((c) => Math.round(clamp(c, 0, 255)).toString(16).padStart(2, '0')).join('');

function rgbToHsv(rgb) {
  const [r, g, b] = rgb.map((c) => c / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}

function hsvToRgb({ h, s, v }) {
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
  };
  return [f(5), f(3), f(1)];
}

/**
 * A colour wheel: drag on the disc for hue (angle) and saturation (distance
 * from the centre), and use the slider for brightness. The disc is white
 * blended into a conic hue ring under a black overlay at 1 − brightness, which
 * is HSV exactly, so what you point at is what you get.
 */
export default function ColorWheel({ value, onChange, size = 156 }) {
  const disc = useRef(null);
  const [hsv, setHsv] = useState(() => rgbToHsv(hexToRgb(value)));
  const live = useRef(hsv);
  const sent = useRef(value);

  // Follow a colour picked elsewhere (a swatch) but not our own echo. Holding
  // hue and saturation here is what stops a trip through black losing the hue.
  useEffect(() => {
    if (!value || value.toLowerCase() === String(sent.current).toLowerCase()) return;
    sent.current = value;
    live.current = rgbToHsv(hexToRgb(value));
    setHsv(live.current);
  }, [value]);

  const emit = (next) => {
    live.current = next;
    setHsv(next);
    sent.current = rgbToHex(hsvToRgb(next));
    onChange(sent.current);
  };

  const pick = (ev) => {
    const r = disc.current.getBoundingClientRect();
    const R = r.width / 2;
    const dx = ev.clientX - (r.left + R);
    const dy = ev.clientY - (r.top + R);
    emit({
      h: ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360,
      s: Math.min(1, Math.hypot(dx, dy) / R),
      v: live.current.v,
    });
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    // from a near-black colour the disc would seem to do nothing, so lift it
    if (live.current.v < 0.25) live.current = Object.assign({}, live.current, { v: 0.85 });
    pick(e);
    const up = () => {
      window.removeEventListener('pointermove', pick);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    window.addEventListener('pointermove', pick);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const R = size / 2;
  const rad = (hsv.h * Math.PI) / 180;
  const hex = rgbToHex(hsvToRgb(hsv));
  const pure = rgbToHex(hsvToRgb({ h: hsv.h, s: hsv.s, v: 1 }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div
        ref={disc} role="slider" aria-label="Hue and saturation" aria-valuetext={hex}
        onPointerDown={onPointerDown}
        style={{
          position: 'relative', width: size, height: size, borderRadius: '50%', cursor: 'crosshair', touchAction: 'none',
          background: 'radial-gradient(closest-side, #fff, rgba(255,255,255,0)), conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
          boxShadow: 'inset 0 0 0 1px color-mix(in srgb, #201e1d 12%, transparent)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#000', opacity: 1 - hsv.v, pointerEvents: 'none' }} />
        <span style={{
          position: 'absolute', left: R + Math.sin(rad) * hsv.s * R, top: R - Math.cos(rad) * hsv.s * R,
          width: 14, height: 14, margin: '-7px 0 0 -7px', borderRadius: '50%', background: hex, pointerEvents: 'none',
          boxShadow: '0 0 0 2px #fff, 0 0 0 3px color-mix(in srgb, #201e1d 35%, transparent)',
        }} />
      </div>

      <input
        type="range" min="0" max="100" step="1" value={Math.round(hsv.v * 100)} aria-label="Brightness"
        onChange={(e) => emit(Object.assign({}, live.current, { v: e.target.value / 100 }))}
        className="td-range" style={{ width: size, background: `linear-gradient(to right, #000, ${pure})` }}
      />

      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600,
        fontVariantNumeric: 'tabular-nums', color: 'color-mix(in srgb, #201e1d 70%, transparent)',
      }}>
        <span style={{ width: 16, height: 16, borderRadius: '50%', background: hex, boxShadow: 'inset 0 0 0 1px color-mix(in srgb, #201e1d 20%, transparent)' }} />
        {hex.toUpperCase()}
      </div>
    </div>
  );
}
