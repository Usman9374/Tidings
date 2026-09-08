/**
 * The desk below the field: the tray of cut-outs to drag onto the paper, the
 * envelope's colours, seals and stamps, and the row of action words.
 */
export default function Toolbar({ v }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '13px', padding: '0 26px 18px', zIndex: 20 }}>
      {v.showTray && (
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: '11px', height: '40px', flexWrap: 'nowrap',
          minWidth: 0, overflowX: 'auto', overflowY: 'visible', paddingBottom: '2px',
        }}>
          {v.tray.map((t) => (
            <img
              key={t.key} src={t.src} alt={t.title} draggable="false"
              onPointerDown={t.grab} title={t.title} style={t.style} className="td-tray"
            />
          ))}
        </div>
      )}

      {v.showColours && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flexWrap: 'wrap' }}>
          {v.envColours.map((c) => (
            <span key={c.title} onClick={c.pick} title={c.title} style={c.style} />
          ))}
          <input
            type="color" value={v.envColour} onChange={v.setEnvColour} title="Any colour"
            style={{ width: '26px', height: '26px', padding: 0, border: 0, background: 'none', cursor: 'pointer' }}
          />

          <span style={{ width: '14px' }} />
          {v.seals.map((s) => (
            <img key={s.key} src={s.src} alt={s.title} draggable="false" onClick={s.pick} title={s.title} style={s.style} />
          ))}

          <span style={{ width: '14px' }} />
          {v.stamps.map((s) => (
            <img key={s.key} src={s.img} alt={s.title} draggable="false" onClick={s.pick} title={s.title} style={s.style} />
          ))}

          <select
            value={v.country} onChange={v.setCountry} className="td-ink"
            style={{
              background: 'none', border: 0, padding: 0, cursor: 'pointer', fontSize: '11px',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'color-mix(in srgb, var(--color-text) 55%, transparent)',
            }}
          >
            {v.countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '18px', flexWrap: 'wrap' }}>
        {v.words.map((w) => (
          <button key={w.label} type="button" onClick={w.go} title={w.title} style={w.style}>{w.label}</button>
        ))}

        {v.showFormats && (
          <select
            value={v.format} onChange={v.setFormat} className="td-ink"
            style={{
              background: 'none', border: 0, padding: 0, cursor: 'pointer', fontSize: '12px',
              letterSpacing: '0.13em', textTransform: 'uppercase',
              color: 'color-mix(in srgb, var(--color-text) 55%, transparent)',
            }}
          >
            {v.formats.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        )}

        {v.counter && <span style={v.counterStyle}>{v.counter}</span>}
        <span style={{ flex: 1 }} />
      </div>
    </div>
  );
}
