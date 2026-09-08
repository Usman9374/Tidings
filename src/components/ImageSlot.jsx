import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A drop-in picture well: the backdrop, the polaroid photos and the signature.
 * Empty it shows a faint dashed placeholder; drop or click to fill it with a
 * local image, which is held as an object URL for the life of the slot.
 *
 * Replaces the <image-slot> element the design tool provided.
 */
export default function ImageSlot({ id, shape = 'rect', fit = 'cover', src = '', placeholder = 'drop an image' }) {
  const [url, setUrl] = useState('');
  const ownedUrl = useRef('');
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);

  useEffect(() => () => { if (ownedUrl.current) URL.revokeObjectURL(ownedUrl.current); }, []);

  const take = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (ownedUrl.current) URL.revokeObjectURL(ownedUrl.current);
    ownedUrl.current = URL.createObjectURL(file);
    setUrl(ownedUrl.current);
  }, []);

  const shown = url || src;

  return (
    <div
      data-slot={id}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files && e.dataTransfer.files[0]); }}
      onClick={() => inputRef.current && inputRef.current.click()}
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', cursor: 'pointer', background: 'var(--slot-bg, transparent)',
        borderRadius: shape === 'circle' ? '50%' : 0,
        outline: shown ? 'none' : '1px dashed color-mix(in srgb, var(--color-text) 26%, transparent)',
        outlineOffset: '-1px',
        boxShadow: over ? 'inset 0 0 0 2px var(--color-accent)' : 'none',
      }}
    >
      {shown ? (
        <img src={shown} alt="" draggable="false" style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }} />
      ) : (
        <span style={{
          fontSize: '11px', letterSpacing: '0.06em', textAlign: 'center', padding: '0 8px',
          color: 'color-mix(in srgb, var(--color-text) 40%, transparent)', pointerEvents: 'none',
        }}>{placeholder}</span>
      )}
      <input
        ref={inputRef} type="file" accept="image/*"
        onChange={(e) => { take(e.target.files && e.target.files[0]); e.target.value = ''; }}
        style={{ display: 'none' }}
      />
    </div>
  );
}
