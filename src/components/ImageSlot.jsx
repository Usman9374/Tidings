import { useRef, useState } from 'react';

/**
 * A picture well — the polaroid photos and the signature. Controlled: it shows
 * `src` and hands a picked or dropped file to `onFile`; App owns the object
 * URLs, so a picture survives the sheet unmounting between screens. With
 * `interactive` off (the reader's view) it is just the picture, or nothing.
 */
export default function ImageSlot({
  src = '', onFile, fit = 'cover', shape = 'rect', placeholder = 'Add a picture',
  interactive = true, pickOnClick = true,
}) {
  const input = useRef(null);
  const [over, setOver] = useState(false);

  const take = (file) => {
    if (file && file.type.startsWith('image/') && onFile) onFile(file);
  };

  const box = {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', borderRadius: shape === 'circle' ? '50%' : 0,
  };
  const picture = src
    ? <img src={src} alt="" draggable="false" style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }} />
    : null;

  if (!interactive) return picture ? <div style={box}>{picture}</div> : null;

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files && e.dataTransfer.files[0]); }}
      onClick={(e) => { if (pickOnClick && input.current && e.target !== input.current) input.current.click(); }}
      style={Object.assign({}, box, {
        cursor: pickOnClick ? 'pointer' : 'inherit',
        background: 'var(--slot-bg, transparent)',
        outline: src ? 'none' : '1px dashed color-mix(in srgb, var(--color-text) 26%, transparent)',
        outlineOffset: '-1px',
        boxShadow: over ? 'inset 0 0 0 2px var(--color-accent)' : 'none',
      })}
    >
      {picture || (
        <span style={{
          fontSize: '11px', letterSpacing: '0.06em', textAlign: 'center', padding: '0 8px',
          color: 'color-mix(in srgb, var(--color-text) 40%, transparent)', pointerEvents: 'none',
        }}>{placeholder}</span>
      )}
      <input
        ref={input} type="file" accept="image/*"
        onChange={(e) => { take(e.target.files && e.target.files[0]); e.target.value = ''; }}
        style={{ display: 'none' }}
      />
    </div>
  );
}
