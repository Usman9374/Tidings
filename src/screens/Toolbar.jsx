import Menu from '../components/Menu';
import ColorWheel from '../components/ColorWheel';
import { MENU_BODIES } from './Menus';

const wheelDot = {
  display: 'block', width: 22, height: 22, borderRadius: '50%',
  background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
  boxShadow: '0 1px 2px color-mix(in srgb, #201e1d 24%, transparent)',
};

/**
 * The bar below the field: on S4 the envelope's colours, seals and stamps;
 * then the row of dropdown menus and quiet toggles, with the running count and
 * the screen's primary action held right-most even when the row wraps.
 */
export default function Toolbar({ v }) {
  return (
    <div style={{ gridRow: 3, display: 'flex', flexDirection: 'column', gap: '10px', padding: '6px 26px 16px', zIndex: 20 }}>
      {v.showEnvBar && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flexWrap: 'wrap' }}>
          {v.showColours && (
            <>
              {v.envColours.map((c) => (
                <span key={c.title} onClick={c.pick} title={c.title} style={c.style} />
              ))}
              <Menu
                label={<span aria-hidden="true" style={wheelDot} />} title="Any colour" chevron={false} width={204}
                className="td-swatch"
                style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, padding: 0, border: 0, background: 'none', cursor: 'pointer' }}
              >
                {() => (
                  <div style={{ padding: '8px 0 4px' }}>
                    <ColorWheel value={v.envColour} onChange={v.setEnvColour} />
                  </div>
                )}
              </Menu>
              <span style={{ width: '14px' }} />
            </>
          )}

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

      <div style={{ display: 'flex', alignItems: 'center', columnGap: '20px', rowGap: '4px', flexWrap: 'wrap', minHeight: '36px' }}>
        {v.menus.map((m) => {
          const Body = MENU_BODIES[m.id];
          return (
            <Menu
              key={m.id} label={m.label} title={m.label} width={m.width} maxHeight={m.maxHeight}
              align={m.align} onOpen={m.onOpen} style={m.style}
            >
              {(close) => <Body m={m} close={close} />}
            </Menu>
          );
        })}

        {v.menus.length > 0 && v.toggles.length > 0 && (
          <span aria-hidden="true" style={{ width: '1px', height: '16px', background: 'color-mix(in srgb, var(--color-text) 18%, transparent)' }} />
        )}

        {v.toggles.map((w) => (
          <button
            key={w.label} type="button" onClick={w.go} title={w.title} aria-pressed={w.pressed}
            className="td-word" style={w.style}
          >{w.label}</button>
        ))}

        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '18px', paddingLeft: '8px' }}>
          {v.counter && <span style={v.counterStyle}>{v.counter}</span>}
          {v.primary && (
            <button type="button" onClick={v.primary.go} className="td-primary" style={v.primary.style}>{v.primary.label}</button>
          )}
        </span>
      </div>
    </div>
  );
}
