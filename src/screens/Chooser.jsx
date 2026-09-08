import { R, PAPER_STACK, TYPEWRITER_HERO, POSTCARD_FACE } from '../assets';

// The objects share a ground line — align-items:flex-end is what makes them
// read as things resting on a desk rather than floating. The row itself is
// auto-height so the field can centre the whole group; giving it height:100%
// is what used to strand everything at the bottom of the window.
const row = (gap) => ({
  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  gap, width: '100%', padding: '8px 26px 0',
});

const pick = (gapLabel) => ({
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: gapLabel,
  background: 'none', border: 0, padding: 0, cursor: 'pointer', color: 'inherit',
  transition: 'transform 320ms cubic-bezier(.2,.7,.2,1)',
});

const caption = { fontSize: '12.5px', letterSpacing: '0.2em', textTransform: 'uppercase' };

// A ceiling on width derived from the height left over once the caption, the
// gap and the padding are paid for (~90px). Capping WIDTH rather than height
// keeps each object's aspect ratio intact as it shrinks. At any ordinary window
// size these never bind — they only stop a short window from clipping the row.
const fitW = (aspect) => `calc((100cqh - 90px) / ${aspect})`;

/** Screens 1 and 2 — choose how to write, then what to write on. */
export default function Chooser({ v }) {
  if (v.isS1) {
    return (
      <div style={{ ...row('clamp(38px, 8vw, 110px)'), animation: 'tdFade 700ms ease both' }}>
        <button type="button" onClick={v.pickLetterPath} className="td-lift" style={pick('20px')}>
          <img
            src={PAPER_STACK} alt="A letter on a stack of paper"
            style={{
              width: 'clamp(150px, 19vw, 260px)', maxWidth: fitW(0.741),
              transform: 'rotate(-2.4deg)',
              filter: 'drop-shadow(0 22px 30px color-mix(in srgb, #201e1d 17%, transparent)) drop-shadow(0 2px 4px color-mix(in srgb, #201e1d 13%, transparent))',
            }}
          />
          <span style={caption}>write a letter</span>
        </button>

        <button type="button" onClick={v.pickTypewriterPath} className="td-lift" style={pick('20px')}>
          <img
            src={TYPEWRITER_HERO} alt="A red portable typewriter"
            style={{
              width: 'clamp(230px, 34vw, 470px)', maxWidth: fitW(1),
              filter: 'drop-shadow(0 26px 30px color-mix(in srgb, #201e1d 20%, transparent)) drop-shadow(0 3px 5px color-mix(in srgb, #201e1d 16%, transparent))',
            }}
          />
          <span style={caption}>use the typewriter</span>
        </button>
      </div>
    );
  }

  if (v.isS2) {
    return (
      <div style={{ ...row('clamp(30px, 6vw, 84px)'), animation: 'tdFade 520ms ease both' }}>
        <button type="button" onClick={v.pickDiary} className="td-lift" style={pick('18px')}>
          <img
            src={R('assets/notebook-open.png')} alt="An open notebook"
            style={{
              width: 'clamp(210px, 30vw, 430px)', maxWidth: fitW(1),
              filter: 'drop-shadow(0 24px 30px color-mix(in srgb, #201e1d 18%, transparent)) drop-shadow(0 3px 5px color-mix(in srgb, #201e1d 13%, transparent))',
            }}
          />
          <span style={caption}>a diary</span>
        </button>

        <button type="button" onClick={v.pickPage} className="td-lift" style={pick('18px')}>
          <img
            src={PAPER_STACK} alt="A letter on writing paper"
            style={{
              width: 'clamp(150px, 18vw, 250px)', maxWidth: fitW(0.741),
              transform: 'rotate(1.8deg)',
              filter: 'drop-shadow(0 20px 28px color-mix(in srgb, #201e1d 16%, transparent)) drop-shadow(0 2px 4px color-mix(in srgb, #201e1d 12%, transparent))',
            }}
          />
          <span style={caption}>a letter</span>
        </button>

        <button type="button" onClick={v.pickPostcard} className="td-lift" style={pick('18px')}>
          <span style={{
            display: 'block', width: 'clamp(170px, 22vw, 290px)', maxWidth: fitW(0.65),
            aspectRatio: '1 / 0.65', overflow: 'hidden', transform: 'rotate(-1.4deg)',
            boxShadow: '0 20px 30px color-mix(in srgb, #201e1d 16%, transparent), 0 2px 5px color-mix(in srgb, #201e1d 12%, transparent)',
          }}>
            <img src={POSTCARD_FACE} alt="A post card" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </span>
          <span style={caption}>a post card</span>
        </button>
      </div>
    );
  }

  return null;
}
