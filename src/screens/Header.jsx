/** The masthead: title, the way back, and the running status on the right. */
export default function Header({ v }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '18px', padding: '22px 26px 0', zIndex: 20 }}>
      <button
        type="button" onClick={v.restart} title="Tidings" className="td-link"
        style={{
          background: 'none', border: 0, padding: 0, cursor: 'pointer',
          fontFamily: 'var(--font-heading)', fontSize: '15px', letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--color-text)',
        }}
      >Tidings</button>

      {v.backWord && (
        <button
          type="button" onClick={v.back} className="td-link"
          style={{
            background: 'none', border: 0, padding: 0, cursor: 'pointer',
            fontSize: '13px', fontStyle: 'italic',
            color: 'color-mix(in srgb, var(--color-text) 52%, transparent)',
          }}
        >{v.backWord}</button>
      )}

      <span style={{ marginLeft: 'auto' }} />

      {v.topRight && (
        <span style={{
          fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'color-mix(in srgb, var(--color-text) 45%, transparent)',
        }}>{v.topRight}</span>
      )}
    </div>
  );
}
