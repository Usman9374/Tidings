import ImageSlot from '../components/ImageSlot';
import Transformable from '../components/Transformable';

const hiddenInput = { position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' };

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
      {v.showLetter && (
        <div ref={v.surfRef} onMouseDown={v.surfaceMouseDown} onClick={v.surfaceClick} style={v.surfaceStyle}>
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <img src={v.paperSrc} alt="" draggable="false" style={v.paperImgStyle} />
          </div>

          {!!v.paper.margin && <div style={v.marginRuleStyle} />}
          {v.drawnRules && <div style={v.rulesStyle} />}

          {v.isPostcard && (
            <>
              <div style={v.cardDividerStyle} />
              <div style={v.cardAddressStyle}>
                {v.addressLines.map((a) => (
                  <input
                    key={a.key} data-address="" value={a.value} onChange={a.onChange} aria-label={a.label}
                    readOnly={!v.editable} tabIndex={v.editable ? 0 : -1} spellCheck={v.spell}
                    maxLength={60} autoComplete="off" style={v.addressStyle}
                  />
                ))}
              </div>
            </>
          )}

          {v.editable && <div ref={v.mirrorRef} aria-hidden="true" style={v.mirrorStyle} />}

          {v.editable && (
            <div
              ref={v.writeRef}
              contentEditable="plaintext-only"
              suppressContentEditableWarning
              role="textbox" aria-multiline="true" aria-label="Your letter" data-text=""
              spellCheck={v.spell}
              onInput={v.onWrite}
              onCompositionStart={v.onCompositionStart}
              onCompositionEnd={v.onCompositionEnd}
              style={v.writeStyle}
            />
          )}

          {v.readOnly && <div data-text="" style={v.readStyle}>{v.shownText}</div>}

          {v.stickers.map((k) => (
            <Transformable key={k.id} {...k.t}>
              <img src={k.src} alt={k.title} draggable="false" style={k.imgStyle} />
            </Transformable>
          ))}

          {v.polaroids.map((p) => (
            <Transformable
              key={p.id} {...p.t}
              extra={p.canReplace && (
                <label onPointerDown={(e) => e.stopPropagation()} style={v.replacePhotoStyle}>
                  Replace photo
                  <input
                    type="file" accept="image/*" style={hiddenInput}
                    onChange={(e) => { p.onFile(e.target.files && e.target.files[0]); e.target.value = ''; }}
                  />
                </label>
              )}
            >
              <div style={p.frameStyle}>
                <div style={p.photoStyle}>
                  <ImageSlot
                    src={p.src} onFile={p.onFile} fit="cover" placeholder="Add a photo"
                    interactive={p.editable} pickOnClick={p.editable && !p.src}
                  />
                </div>
                <input
                  value={p.caption} onChange={p.setCaption} readOnly={!p.editable} tabIndex={p.editable ? 0 : -1}
                  maxLength={30} placeholder={p.editable ? 'Caption' : ''} aria-label="Photo caption"
                  style={p.captionStyle}
                />
              </div>
            </Transformable>
          ))}

          {v.signature && (
            <div data-obj="" style={v.sigStyle}>
              <ImageSlot
                src={v.signatureSrc} onFile={v.setSignature} fit="contain" placeholder="Add your signature"
                interactive={v.editable} pickOnClick={v.editable}
              />
            </div>
          )}
        </div>
      )}

      {v.showEnvelope && (
        <div style={v.envWrapStyle}>
          <div onClick={v.envelopeClick} style={v.envStyle}>
            {v.envImgSrc && (
              <img
                src={v.envImgSrc} alt="An envelope" draggable="false"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', zIndex: 1 }}
              />
            )}
            {v.envFlapStyle && <div style={v.envFlapStyle} />}
            {v.envAddrStyle && (
              <div style={v.envAddrStyle} onClick={(e) => e.stopPropagation()}>
                <div style={v.envAddrLabelStyle}>To</div>
                {v.envAddressLines.map((a) => (
                  <input
                    key={a.key} value={a.value} onChange={a.onChange} aria-label={a.label} placeholder={a.placeholder}
                    readOnly={!v.isS4} tabIndex={v.isS4 ? 0 : -1} spellCheck={v.spell}
                    maxLength={40} autoComplete="off" style={v.envAddressStyle}
                  />
                ))}
              </div>
            )}
            {v.envStamp && <img src={v.envStamp.img} alt="Stamp" style={v.envStampStyle} />}
            {v.envSealStyle && <img src={v.envSealSrc} alt="Wax seal" style={v.envSealStyle} />}
          </div>
        </div>
      )}

      {v.centreHint && <div style={v.hintStyle}>{v.centreHint}</div>}
    </div>
  );
}
