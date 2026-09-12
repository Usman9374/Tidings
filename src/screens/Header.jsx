import { Fragment } from 'react';

/** One arrow of the sheet pager; greyed and unclickable at either end of the stack. */
function Step({ onClick, label, d }) {
  return (
    <button
      type="button" onClick={onClick || undefined} disabled={!onClick} aria-label={label} title={label}
      className={onClick ? 'td-step' : undefined}
      style={{
        display: 'grid', placeItems: 'center', width: 18, height: 18, padding: 0, border: 0, borderRadius: '50%',
        background: 'none', color: 'inherit', cursor: onClick ? 'pointer' : 'default', opacity: onClick ? 1 : 0.3,
      }}
    >
      <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true">
        <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** The masthead: the wordmark, the way back, the steps of the flow and the running status. */
export default function Header({ v }) {
  return (
    <header style={{
      gridRow: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)', alignItems: 'center',
      columnGap: '20px', padding: '14px 26px 6px', zIndex: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '22px', minWidth: 0 }}>
        <button
          type="button" onClick={v.home} title="Tidings — back to the start" className="td-wordmark"
          style={{
            background: 'none', border: 0, padding: 0, cursor: 'pointer', color: 'var(--color-text)',
            fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '28px', lineHeight: 1.1, letterSpacing: '-0.01em',
          }}
        >Tidings</button>

        {v.backTitle && (
          <button
            type="button" onClick={v.back} title={'Back to ' + v.backTitle} className="td-back"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 0, padding: '6px 0',
              cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '14px', color: 'var(--color-text)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 3.5 5.5 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
        )}
      </div>

      <nav
        aria-label="Steps" className="td-steps"
        style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-ui)', fontSize: '13px', whiteSpace: 'nowrap' }}
      >
        {(v.steps || []).map((st, i) => (
          <Fragment key={st.label}>
            {i > 0 && <span aria-hidden="true" style={{ color: 'color-mix(in srgb, var(--color-text) 30%, transparent)' }}>›</span>}
            {st.go ? (
              <button
                type="button" onClick={st.go} className="td-step"
                style={{
                  background: 'none', border: 0, padding: '4px 0', cursor: 'pointer', font: 'inherit', fontWeight: 600,
                  color: 'color-mix(in srgb, var(--color-text) 62%, transparent)',
                }}
              >{st.label}</button>
            ) : (
              <span
                aria-current={st.current ? 'step' : undefined}
                style={{
                  fontWeight: st.current ? 700 : 600,
                  color: st.current ? 'var(--color-text)' : 'color-mix(in srgb, var(--color-text) 34%, transparent)',
                }}
              >{st.label}</span>
            )}
          </Fragment>
        ))}
      </nav>

      <div style={{
        gridColumn: 3, justifySelf: 'end', display: 'flex', alignItems: 'center', gap: '12px',
        whiteSpace: 'nowrap', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '13px',
        color: 'color-mix(in srgb, var(--color-text) 55%, transparent)',
      }}>
        {v.sheetNav && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Step onClick={v.sheetNav.prev} label="Previous sheet" d="M10 3.5 5.5 8l4.5 4.5" />
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{v.sheetNav.label}</span>
            <Step onClick={v.sheetNav.next} label="Next sheet" d="M6 3.5 10.5 8 6 12.5" />
          </span>
        )}
        {v.topRight}
      </div>
    </header>
  );
}
