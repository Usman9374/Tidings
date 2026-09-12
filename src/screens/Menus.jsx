import ColorWheel from '../components/ColorWheel';

/**
 * The toolbar menus' panels, keyed by menu id. Each reads the descriptor App
 * built for it (`m`) and gets `close` from the Menu that hosts it.
 *
 * Anything that is a list of photographed things to choose from — papers, books,
 * envelopes, machines, the sheet in the platen — is the same panel, ThumbMenu,
 * so adding a drawer is adding a row in data.js and a descriptor in App.
 */

const INK = '#201e1d';
const heading = { padding: '6px 10px 4px', fontSize: '12px', fontWeight: 600, color: `color-mix(in srgb, ${INK} 50%, transparent)` };
const row = {
  display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '7px 10px',
  border: 0, borderRadius: '3px', background: 'none', cursor: 'pointer', textAlign: 'left',
  font: 'inherit', fontWeight: 600, color: INK,
};
const rule = { height: '1px', margin: '8px 2px', background: `color-mix(in srgb, ${INK} 10%, transparent)` };
const hairline = `0 0 0 1px color-mix(in srgb, ${INK} 12%, transparent), 0 1px 2px color-mix(in srgb, ${INK} 15%, transparent)`;
const ring = '0 0 0 2px #fbfaf8, 0 0 0 3.5px var(--color-accent)';
const hiddenInput = { position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' };
const tabRow = { display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '2px 4px 8px' };

function Check({ on }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"
      style={{ marginLeft: 'auto', flex: 'none', color: 'var(--color-accent)', visibility: on ? 'visible' : 'hidden' }}
    >
      <path d="M2.5 6.2 5 8.6l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Tab({ t }) {
  return (
    <button
      type="button" onClick={t.pick} aria-pressed={t.on}
      style={{
        padding: '4px 9px', borderRadius: '999px', cursor: 'pointer', font: 'inherit', fontWeight: 600, fontSize: '11.5px',
        border: '1px solid ' + (t.on ? 'var(--color-accent)' : `color-mix(in srgb, ${INK} 14%, transparent)`),
        background: t.on ? 'color-mix(in srgb, var(--color-accent) 9%, transparent)' : 'none',
        color: t.on ? 'var(--color-accent-700)' : `color-mix(in srgb, ${INK} 70%, transparent)`,
      }}
    >{t.label}</button>
  );
}

/** One photographed thing per row: paper, book, envelope, machine, sheet. */
function ThumbMenu({ m, close }) {
  return m.items.map((it) => (
    <button
      key={it.id} type="button" className="td-row" aria-pressed={it.on}
      onClick={() => { it.pick(); close(); }} style={row}
    >
      <span style={{
        position: 'relative', width: 38, height: 28, flex: 'none', borderRadius: 2, overflow: 'hidden',
        background: it.swatch || 'none',
        display: it.thumb || it.swatch ? 'block' : 'grid', placeItems: 'center',
        boxShadow: it.thumb || it.swatch ? (it.fit === 'contain' && !it.swatch ? 'none' : hairline) : 'none',
        outline: it.thumb || it.swatch ? 'none' : `1px dashed color-mix(in srgb, ${INK} 28%, transparent)`,
        outlineOffset: -1,
      }}>
        {it.thumb && (
          <img
            src={it.thumb} alt="" draggable="false" loading="lazy" decoding="async"
            style={{ width: '100%', height: '100%', objectFit: it.fit || 'cover' }}
          />
        )}
        {it.ruled && (
          <span style={{
            position: 'absolute', inset: '4px 5px',
            background: `repeating-linear-gradient(to bottom, transparent 0 4px, color-mix(in srgb, ${INK} 30%, transparent) 4px 5px)`,
          }} />
        )}
      </span>
      {it.label}
      <Check on={it.on} />
    </button>
  ));
}

function FontMenu({ m, close }) {
  return m.groups.map((g) => (
    <div key={g.name} role="group" aria-label={g.name}>
      <div style={heading}>{g.name}</div>
      {g.fonts.map((f) => (
        <button
          key={f.id} type="button" className="td-row" aria-pressed={f.on}
          onClick={() => { f.pick(); close(); }}
          style={Object.assign({}, row, { fontWeight: 400, padding: '3px 10px', minHeight: 36 })}
        >
          <span style={{ fontFamily: f.family, fontSize: f.size + 'px', lineHeight: 1.3, whiteSpace: 'nowrap' }}>{f.label}</span>
          <Check on={f.on} />
        </button>
      ))}
    </div>
  ));
}

function FormatMenu({ m, close }) {
  return m.items.map((it) => (
    <button key={it.label} type="button" className="td-row" onClick={() => { close(); it.pick(); }} style={row}>
      {it.label}
      <Check on={it.on} />
    </button>
  ));
}

/** The tray: seven drawers of cut-outs, one open at a time. */
function StickerMenu({ m, close }) {
  return (
    <>
      <div style={tabRow}>
        {m.tabs.map((t) => <Tab key={t.id} t={t} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
        {m.items.map((it) => (
          <button
            key={it.key} type="button" title={it.title} aria-label={'Add ' + it.title} className="td-row"
            onClick={() => { it.add(); close(); }}
            style={{ display: 'grid', placeItems: 'center', height: 48, padding: 0, border: 0, borderRadius: 3, background: 'none', cursor: 'pointer' }}
          >
            <img src={it.src} alt="" draggable="false" loading="lazy" decoding="async" className="td-tray" style={it.style} />
          </button>
        ))}
      </div>
      <div style={rule} />
      <div style={heading}>How stickers sit</div>
      <div style={{ display: 'flex', gap: '6px', padding: '2px 8px 4px' }}>
        {m.modes.map((mode) => (
          <button
            key={mode.label} type="button" aria-pressed={mode.on} onClick={mode.pick}
            style={{
              flex: 1, padding: '6px 8px', borderRadius: 3, cursor: 'pointer', font: 'inherit', fontWeight: 600, fontSize: '12px',
              border: '1px solid ' + (mode.on ? 'var(--color-accent)' : `color-mix(in srgb, ${INK} 16%, transparent)`),
              background: mode.on ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'none',
              color: mode.on ? 'var(--color-accent-700)' : INK,
            }}
          >{mode.label}</button>
        ))}
      </div>
    </>
  );
}

/** Eighteen wax seals, and the choice of none. */
function SealMenu({ m, close }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
      {m.items.map((it) => (
        <button
          key={it.key} type="button" title={it.title} aria-label={it.title} aria-pressed={it.on} className="td-row"
          onClick={() => { it.pick(); close(); }}
          style={{
            display: 'grid', placeItems: 'center', height: 46, padding: 0, borderRadius: 3, cursor: 'pointer',
            border: '1px solid ' + (it.on ? 'var(--color-accent)' : 'transparent'),
            background: it.on ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'none',
          }}
        >
          {it.src ? (
            <img
              src={it.src} alt="" draggable="false" loading="lazy" decoding="async"
              style={{
                display: 'block', maxWidth: '80%', maxHeight: 32, width: 'auto',
                filter: 'drop-shadow(0 1px 2px color-mix(in srgb, #201e1d 26%, transparent))',
              }}
            />
          ) : (
            <span style={{
              display: 'block', width: 24, height: 24, borderRadius: '50%',
              outline: `1px dashed color-mix(in srgb, ${INK} 32%, transparent)`, outlineOffset: -1,
            }} />
          )}
        </button>
      ))}
    </div>
  );
}

function PhotoMenu({ m, close }) {
  return m.items.map((it) => (
    <button key={it.key} type="button" className="td-row" onClick={() => { it.add(); close(); }} style={row}>
      <span aria-hidden="true" style={{ width: 30, display: 'grid', placeItems: 'center', flex: 'none' }}>
        <span style={{ display: 'block', width: it.w, padding: '2px 2px 5px', background: '#fff', boxShadow: hairline }}>
          <span style={{ display: 'block', width: '100%', aspectRatio: '1 / ' + it.aspect, background: `color-mix(in srgb, ${INK} 18%, transparent)` }} />
        </span>
      </span>
      {it.label}
    </button>
  ));
}

function BackdropMenu({ m }) {
  const sp = m.sprite;
  return (
    <>
      <div style={heading}>Desk colour</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', padding: '4px 8px 6px', justifyItems: 'center' }}>
        {m.swatches.map((sw) => (
          <button
            key={sw.hex} type="button" title={sw.hex} aria-label={'Backdrop colour ' + sw.hex} aria-pressed={sw.on}
            className="td-swatch" onClick={sw.pick}
            style={{
              width: 30, height: 30, padding: 0, border: 0, borderRadius: '50%', cursor: 'pointer', background: sw.hex,
              boxShadow: sw.on ? ring : `inset 0 0 0 1px color-mix(in srgb, ${INK} 14%, transparent)`,
            }}
          />
        ))}
      </div>

      <div style={rule} />
      <div style={heading}>Backdrops</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '4px 8px 6px' }}>
        {m.pictures.map((b) => (
          <button
            key={b.id} type="button" title={b.id} aria-label={'Backdrop ' + b.id} aria-pressed={b.on}
            className="td-swatch" onClick={b.pick}
            style={{
              width: sp.w, height: sp.h, padding: 0, border: 0, borderRadius: 2, cursor: 'pointer',
              backgroundImage: `url("${b.sprite}")`,
              backgroundSize: `${sp.sheet[0]}px ${sp.sheet[1]}px`,
              backgroundPosition: `-${b.sx}px -${b.sy}px`,
              boxShadow: b.on ? ring : `inset 0 0 0 1px color-mix(in srgb, ${INK} 14%, transparent)`,
            }}
          />
        ))}
      </div>

      <div style={rule} />
      <div style={heading}>Your own</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 10px 2px' }}>
        <label
          title={'Add an HD picture, at least ' + m.hd} className="td-swatch"
          style={{
            position: 'relative', width: 52, height: 38, flex: 'none', display: 'grid', placeItems: 'center', borderRadius: 3, cursor: 'pointer',
            border: `1.5px dashed color-mix(in srgb, ${INK} 32%, transparent)`, color: `color-mix(in srgb, ${INK} 65%, transparent)`,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="file" accept="image/*" aria-label="Add your own backdrop picture" style={hiddenInput}
            onChange={(e) => { m.upload(e.target.files && e.target.files[0]); e.target.value = ''; }}
          />
        </label>

        {m.image && (
          <span style={{
            position: 'relative', width: 52, height: 38, flex: 'none', borderRadius: 3, boxShadow: ring,
            backgroundImage: `url("${m.image.url}")`, backgroundSize: 'cover', backgroundPosition: 'center',
          }}>
            <button
              type="button" aria-label="Remove the backdrop picture" title="Remove" onClick={m.image.remove}
              style={{
                position: 'absolute', right: -8, top: -8, width: 18, height: 18, padding: 0, border: 0, borderRadius: '50%',
                display: 'grid', placeItems: 'center', background: INK, color: '#fbfaf8', cursor: 'pointer',
              }}
            >
              <svg width="8" height="8" viewBox="0 0 10 10" aria-hidden="true">
                <path d="M2 2l6 6M8 2 2 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </span>
        )}

        <span style={{
          fontSize: '12px', lineHeight: 1.35,
          color: m.note ? 'var(--color-accent-2-700)' : `color-mix(in srgb, ${INK} 55%, transparent)`,
        }}>{m.note || 'At least ' + m.hd}</span>
      </div>

      <div style={rule} />
      <div style={heading}>Custom colour</div>
      <div style={{ padding: '6px 0 4px' }}>
        <ColorWheel value={m.wheel.value} onChange={m.wheel.onChange} />
      </div>
    </>
  );
}

export const MENU_BODIES = {
  paper: ThumbMenu,
  envelope: ThumbMenu,
  machine: ThumbMenu,
  sheet: ThumbMenu,
  font: FontMenu,
  format: FormatMenu,
  stickers: StickerMenu,
  seal: SealMenu,
  photo: PhotoMenu,
  backdrop: BackdropMenu,
};
