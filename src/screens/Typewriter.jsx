import { POSTCARD_FACE } from '../assets';

/**
 * Screens 6 and 7 — the machine, and the page it typed. The sheet is fed up out
 * of the platen, so the machine image sits over the sheet's bottom edge and a
 * gradient does the contact shading where the paper disappears behind the roller.
 */
export default function Typewriter({ v }) {
  if (!v.isTypewriter) return null;

  return (
    <div style={{
      // twAssemblyStyle carries margin:auto 0, which is what centres the
      // machine in the field — the justification stays flex-start as designed.
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      width: '100%', height: '100%', padding: '4px 20px 0',
    }}>
      <div style={v.twAssemblyStyle}>
        <div style={v.sheetStyle}>
          <img src={POSTCARD_FACE} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />

          {v.isS6 && (
            <textarea
              ref={v.twRef}
              value={v.twText}
              onChange={v.setTwText}
              spellCheck={v.spell}
              placeholder="Type. The machine follows."
              style={v.twWriteStyle}
            />
          )}

          {v.isS7 && <div style={v.twReadStyle}>{v.twText}</div>}

          {v.feedShadeStyle && <div style={v.feedShadeStyle} />}
        </div>

        {v.isS6 && (
          <div style={v.machineWrapStyle}>
            <img
              src={v.machineSrc} alt="A typewriter"
              style={{ width: '100%', display: 'block', filter: 'drop-shadow(0 14px 22px color-mix(in srgb, #201e1d 16%, transparent))' }}
            />
            {v.keyMarks.map((k) => <span key={k.key} style={k.style} />)}
          </div>
        )}
      </div>
    </div>
  );
}
