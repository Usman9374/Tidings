import { LETTER_HERO, POSTCARD_HERO, DIARY_HERO, TYPEWRITER_HERO } from '../assets';

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

// Set in the UI face to match the masthead and toolbar.
const caption = { fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '14px', letterSpacing: '0.01em' };

// A ceiling on width derived from the height left over once the caption, the
// gap and the padding are paid for (~90px). Capping WIDTH rather than height
// keeps each object's aspect ratio intact as it shrinks. At any ordinary window
// size these never bind — they only stop a short window from clipping the row.
const fitW = (aspect) => `calc((100cqh - 90px) / ${aspect})`;

// A cut-out casts its own silhouette; a flat sheet of paper casts a rectangle.
const cutOut = (y, blur, pct) => ({
  filter: `drop-shadow(0 ${y}px ${blur}px color-mix(in srgb, #201e1d ${pct}%, transparent)) drop-shadow(0 3px 5px color-mix(in srgb, #201e1d 13%, transparent))`,
});
const sheet = {
  boxShadow: '0 20px 30px color-mix(in srgb, #201e1d 16%, transparent), 0 2px 5px color-mix(in srgb, #201e1d 12%, transparent)',
};

/** Screens 1 and 2 — choose how to write, then what to write on. */
export default function Chooser({ v }) {
  if (v.isS1) {
    return (
      <div style={{ ...row('clamp(38px, 8vw, 110px)'), animation: 'tdFade 700ms ease both' }}>
        <button type="button" onClick={v.pickLetterPath} className="td-lift" style={pick('20px')}>
          <img
            src={LETTER_HERO} alt="A sheet of ruled writing paper"
            style={{
              display: 'block', width: 'clamp(180px, 24vw, 330px)', maxWidth: fitW(0.7073),
              transform: 'rotate(-2.4deg)', ...sheet,
            }}
          />
          <span style={caption}>Write a letter</span>
        </button>

        <button type="button" onClick={v.pickTypewriterPath} className="td-lift" style={pick('20px')}>
          <img
            src={TYPEWRITER_HERO} alt="A burgundy portable typewriter"
            style={{ width: 'clamp(230px, 34vw, 470px)', maxWidth: fitW(0.7894), ...cutOut(26, 30, 20) }}
          />
          <span style={caption}>Use the typewriter</span>
        </button>
      </div>
    );
  }

  if (v.isS2) {
    return (
      <div style={{ ...row('clamp(30px, 6vw, 84px)'), animation: 'tdFade 520ms ease both' }}>
        <button type="button" onClick={v.pickDiary} className="td-lift" style={pick('18px')}>
          <img
            src={DIARY_HERO} alt="An open notebook"
            style={{ width: 'clamp(210px, 30vw, 430px)', maxWidth: fitW(0.6161), ...cutOut(24, 30, 18) }}
          />
          <span style={caption}>Diary</span>
        </button>

        <button type="button" onClick={v.pickPage} className="td-lift" style={pick('18px')}>
          <img
            src={LETTER_HERO} alt="A sheet of ruled writing paper"
            style={{
              display: 'block', width: 'clamp(170px, 23vw, 310px)', maxWidth: fitW(0.7073),
              transform: 'rotate(1.8deg)', ...sheet,
            }}
          />
          <span style={caption}>Letter</span>
        </button>

        <button type="button" onClick={v.pickPostcard} className="td-lift" style={pick('18px')}>
          <img
            src={POSTCARD_HERO} alt="A card bordered with gold stars"
            style={{
              display: 'block', width: 'clamp(170px, 23vw, 310px)', maxWidth: fitW(0.6664),
              transform: 'rotate(-1.4deg)', ...sheet,
            }}
          />
          <span style={caption}>Postcard</span>
        </button>
      </div>
    );
  }

  return null;
}
