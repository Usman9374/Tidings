import ImageSlot from '../components/ImageSlot';

/**
 * Screens 3–5 — the writing surface itself, everything pinned to it, and the
 * envelope it travels in. The column carries min-height:100% with its content
 * centred, which is what keeps the sheet in the middle of the field.
 */
export default function Desk({ v }) {
  if (!v.isDesk) return null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '20px', width: '100%', minHeight: '100%', padding: '6px 26px 10px',
    }}>
      {v.askEnvelope && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', animation: 'tdFade 400ms ease both' }}>
          <span style={{ fontSize: '15px', fontStyle: 'italic' }}>Shall it travel in an envelope?</span>
          <button
            type="button" onClick={v.envYes} className="td-accent-600"
            style={{
              background: 'none', border: 0, padding: 0, cursor: 'pointer', fontSize: '13px',
              letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent)',
            }}
          >yes</button>
          <button
            type="button" onClick={v.envNo} className="td-ink"
            style={{
              background: 'none', border: 0, padding: 0, cursor: 'pointer', fontSize: '13px',
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'color-mix(in srgb, var(--color-text) 50%, transparent)',
            }}
          >no, just send it</button>
        </div>
      )}

      {v.showLetter && (
        <div ref={v.surfRef} onClick={v.surfaceClick} style={v.surfaceStyle}>
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <img src={v.paperSrc} alt="" style={v.paperImgStyle} />
          </div>

          {!!v.paper.margin && <div style={v.marginRuleStyle} />}
          {v.drawnRules && <div style={v.rulesStyle} />}

          {v.isPostcard && (
            <>
              <div style={v.cardDividerStyle} />
              <div style={v.cardAddressStyle}>
                <span style={{ display: 'block', height: '1px', background: 'color-mix(in srgb, var(--color-text) 30%, transparent)', marginBottom: '16%' }} />
                <span style={{ display: 'block', height: '1px', background: 'color-mix(in srgb, var(--color-text) 30%, transparent)', marginBottom: '16%' }} />
                <span style={{ display: 'block', height: '1px', background: 'color-mix(in srgb, var(--color-text) 30%, transparent)' }} />
              </div>
            </>
          )}

          {v.editable && (
            <div
              ref={v.writeRef}
              contentEditable
              suppressContentEditableWarning
              onInput={v.onWrite}
              spellCheck={v.spell}
              data-text="1"
              style={v.writeStyle}
            />
          )}

          {v.readOnly && <div data-text="1" style={v.readStyle}>{v.shownText}</div>}

          {v.stickers.map((s) => (
            <img
              key={s.id} src={s.src} alt="" draggable="false"
              onPointerDown={s.grab} onDoubleClick={s.remove} style={s.style}
            />
          ))}

          {v.polaroids.map((p) => (
            <div key={p.id} style={p.frameStyle}>
              <div onPointerDown={p.grab} style={p.gripStyle} />
              <div style={p.photoStyle}>
                <ImageSlot id={p.slotId} shape="rect" fit="cover" src={p.src} placeholder="drop a photo" />
              </div>
              <input
                value={p.caption} onChange={p.setCaption} maxLength={30}
                placeholder="write something" style={p.captionStyle}
              />
            </div>
          ))}

          {v.signature && (
            <div style={v.sigStyle}>
              <ImageSlot id="tidings-signature" shape="rect" fit="contain" placeholder="Drop your signature" />
            </div>
          )}
        </div>
      )}

      {v.showEnvelope && (
        <div style={v.envWrapStyle}>
          <div onClick={v.envelopeClick} style={v.envStyle}>
            <div style={v.envFlapStyle} />
            <div style={{ position: 'absolute', left: '10%', top: '58%', right: '46%', zIndex: 3 }}>
              <div style={{ fontSize: '0.9em', fontStyle: 'italic', opacity: 0.5, marginBottom: '7px' }}>to</div>
              <div style={{ height: '1px', background: 'color-mix(in srgb, var(--color-text) 34%, transparent)', marginBottom: '12px' }} />
              <div style={{ height: '1px', background: 'color-mix(in srgb, var(--color-text) 34%, transparent)', marginBottom: '12px' }} />
              <div style={{ height: '1px', background: 'color-mix(in srgb, var(--color-text) 34%, transparent)', width: '62%' }} />
            </div>
            {v.envStamp && <img src={v.envStamp.img} alt="Stamp" style={v.envStampStyle} />}
            {v.envSealStyle && <img src={v.envSealSrc} alt="Wax seal" style={v.envSealStyle} />}
          </div>
        </div>
      )}

      {v.centreHint && (
        <div style={{
          fontSize: '13px', fontStyle: 'italic',
          color: 'color-mix(in srgb, var(--color-text) 55%, transparent)',
          animation: 'tdFade 600ms ease both',
        }}>{v.centreHint}</div>
      )}
    </div>
  );
}
