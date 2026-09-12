# Tidings

Write a letter by hand or on a typewriter, dress it with stars, wax seals and
photographs, seal it in an envelope and send it.

A React port of the original single-file Claude Design export.
`docs/Tidings.docx` is the product brief the app was built from — the
screen-by-screen spec.

## Running it

```bash
npm install
npm run dev
```

`npm run build` emits a static `dist/`; `npm run preview` serves it.

## Layout

```
docs/Tidings.docx       the product brief
docs/Tidings.dc.html    the Claude Design canvas this was ported from — the
                        source of every number in data.js (reference only; it
                        needs the canvas runtime to render)
src/
  main.jsx              mounts the app, pulls in the stylesheets and the chrome fonts
  App.jsx               all state, all computed styles — renderVals() returns the
                        single object every screen reads from
  data.js               the design tables: paper geometry for 38 surfaces, ~150
                        cut-outs in seven trays, 10 envelopes, 7 machines, the 47
                        backdrops, polaroid shapes, seed copy
  assets.js             logical path -> served URL (public/), and the chooser art
  fonts.js              the 40 letter fonts, loading them, and fitting each one
                        to the paper's rules
  fontFaces.js          the letter fonts' @font-face imports (loaded as its own chunk)
  editing.js            caret hit-testing and execCommand inserts for the letter
  components/
    ImageSlot.jsx       a controlled picture well (polaroid photos, signature)
    Menu.jsx            a toolbar dropdown, portaled above its trigger
    Transformable.jsx   move, turn, resize and remove for stickers and polaroids
    ColorWheel.jsx      a hue/saturation disc with a brightness slider
  screens/
    Header.jsx          wordmark, Back, the step trail, status
    Chooser.jsx         screens 1-2 — pick a path, then a medium
    Desk.jsx            screens 3-5 — the writing surface and the envelope
    Typewriter.jsx      screens 6-7 — the machine and the page it typed
    Toolbar.jsx         the bottom bar: menus, toggles, count, primary action
    Menus.jsx           the menu panels — paper/envelope/machine/sheet all share
                        ThumbMenu; font, format, stickers, seal, photo, backdrop
  styles/
    tokens.css          design-system tokens + @font-face (from the export) + chrome type
    app.css             page reset, keyframes, hover states
  assets/fonts/         the 18 woff2 subsets tokens.css points at
public/
  assets/               the picture library — papers, books, envelopes, machines,
                        cut-outs, and the four backdrop sprite strips
  uploads/tidings/      the five photographed papers and the seed polaroid
  uploads/backgrounds/  the 47 backdrops, full size
```

The picture library is served from `public/` rather than imported: ~230 files,
26 MB, that never enter the module graph. `vite build` stays under a second, the
browser fetches only the handful an open drawer shows, and the paths in `data.js`
are the design's own (`assets/paper/p-roses.jpg`) — adding art is dropping a file
in and naming it in the table. `R()` in `assets.js` resolves those paths against
`BASE_URL` and passes blob:/data: URLs straight through.

`App.jsx` holds the state and computes every style; the screens are presentational
and read from the `v` object it passes down. That is the same split the export
had — its template consumed a values object — so screens can be moved or
restyled without touching the state machine. Components keep only short-lived
interaction state (a menu's open flag, a drag in progress, the wheel's hue).

### Screens

| # | State | Screen |
|---|-------|--------|
| 1 | `isS1` | letter or typewriter |
| 2 | `isS2` | diary, letter or postcard |
| 3 | `isS3` | write, decorate, choose paper |
| 4 | `isS4` | envelope, address, colour, seal, stamp (letters and postcards) |
| 5 | `isS5` | as your reader sees it |
| 6 | `isS6` | the typewriter |
| 7 | `isS7` | the typed page |

## Bug fixes (12 September 2026)

Defects found by reading the code against what it claims to do, each reproduced
before it was changed and checked in a browser afterwards.

- **A diary arrived sealed in an envelope it was never offered.** `showEnvelope`
  never consulted the table that decides which media get the envelope step, so a
  diary — which skips that step — still reached the send screen inside the
  default envelope.
- **A letter of more than one sheet reached the reader as a single sheet.** The
  pager was gated on the writing screen, so the envelope and send screens showed
  whichever sheet happened to be selected and gave no way to turn the page.
- **"Send as a letter" destroyed the letter in progress without asking.** When
  there is a letter to lose the word now becomes "Replace your letter?" and a
  second press goes ahead.
- **The app opened in an error state.** The sample letter was 133 words and the
  paper the Letter button lands on could not hold it, so "Sheet full — add
  another" was showing before the writer had done anything. The sample is now 68
  words and fits the paper every entry point opens on; the seeded photograph
  moved clear of the writing on all three.
- **The typewriter had no keyboard on arrival** — the keys lit up and nothing
  typed. The paper takes focus on entry, and again after a file is opened.
- **An addressed envelope could not be opened.** The address block stopped the
  click that opens it; it now does that only while it can be typed in.
- **The flip animation never played.** On the send screen the arrival animation
  unconditionally won, so turning the sheet over just blanked the text. The flip
  now outranks it, and the arrival no longer replays on every turn.
- **One shared flag meant the wrong word reported a copy** — pressing WhatsApp
  made "Copy the link" claim it. Each word now reports its own.
- **The typewriter could not be scrolled to in a short window**, so the keyboard
  — the whole point of the screen — was unreachable.
- **A font that lost its loading race stayed unfitted for the session**, because
  a failed measurement was cached as if it had succeeded.
- **A file that could not be read did nothing at all**, and a backdrop that was
  not a picture was refused silently. Both say so now.
- **Multiply was dimming the empty signature slot's own outline and prompt.**
- **Every new photograph landed on exactly the same spot**; they scatter now, as
  stickers already did.

Also removed at Usman's request: **the night machine**, its photograph and its
key grid. Seven machines remain.

## Copy and conduct (12 September 2026)

A pass for register and for things that only half worked. The rule everywhere is
sentence case, plain nouns, no questions put to the writer.

- **The envelope is chosen, not asked about.** "Shall it travel in an envelope?
  Yes / No, just send it" is gone. Screen 4 simply shows the Envelope menu, whose
  first entry is **No envelope** — there is no separate state to get out of step,
  since `envOn` is now just "is an envelope chosen".
- **A letter gets the envelope step too.** Before, only a postcard did, which is
  backwards: a letter is the thing that goes in an envelope. A diary, not being
  posted, still goes straight to Send.
- **The envelope can be addressed.** Its "to" block was three decorative rules at
  34% ink — invisible at envelope size, and untypeable. It is now a proper **To**
  label and three real lines, written in the same hand as the letter, sized off
  the envelope so they hold up however small it gets.
- **Menu labels are one shape.** Paper · Book · Font · Format · Stickers · Photo ·
  Desk · Envelope · Seal · Machine · Sheet. No more mixing "Paper type" with
  "The desk", and **Stickers** is called Stickers.
- **The desk stays on the desk.** A chosen colour or backdrop is the surface the
  letter sits on, so it now shows only on screens 3–5. Picking one no longer
  follows you back to the chooser or over to the typewriter. Over a photograph
  the hint line takes a quiet plate of its own rather than fighting the picture.
- **The chooser shows the papers themselves** — ruled stars for the letter, gold
  stars for the postcard — and picking one starts you on that very paper.
- **Paging moved to the header**: `‹ Sheet 2 of 3 ›` sits with the status it
  reports on, so the toolbar stays a list of things you can do.
- Smaller: "Unsign" → "Remove signature"; "Add a page" → "Add a sheet"; "Open a
  file" → "Open a text file"; "Download the file" → "Download as text"; hints are
  sentence case and end in a full stop; "post card" is one word throughout; the
  Seal menu hides itself when there is no envelope to press it into.

## What changed (12 September 2026)

Bringing over the *Tidings Interactive Letter Prototype* canvas from Claude
Design. The design's tables were lifted verbatim into `data.js`; the app's own
machinery — history, the 40 fonts, click-and-type, Transformable, ImageSlot —
was kept and extended to carry them.

- **The picture library moved to `public/`** at the design's own paths, and
  `assets.js` shrank from 60 hand-written imports to a five-line resolver. See
  the note under Layout for why.
- **Paper.** 18 letter papers, 9 books and 11 post cards, up from 5 / 3 / 3 —
  kraft, roses, peanuts, four star papers, gold border, bow card, thank-you,
  yellow note, index card; cream-ruled, vintage, green book, red spiral, spiral
  pad, clipboard.
- **Things.** One tray with seven drawers — foil stars, confetti, paper stars,
  wax seals, stamps & marks, charms, paper things — about 150 real cut-outs,
  up from 12. Only the open drawer is in the DOM and its thumbnails load lazily.
- **Envelopes.** Nine photographed envelopes plus the plain one, each with its
  own aspect and its own places for the address, the stamp and the wax; the card
  and the envelope now size off their own aspects when they share the field.
  The burgundy carries a light ink, since dark ink on it was invisible.
- **Seals.** Eighteen, in their own menu, where there used to be three in the bar.
- **Machines.** Eight, each with its own key grid, platen geometry and paper
  feed, and four sheets to wind into them. The key that lights when you type is
  read off the chosen machine.
- **Backdrops.** The 47 from the design, their thumbnails cut from four sprite
  strips (188 KB for the whole grid) so opening the drawer costs four small
  requests and the photograph itself is fetched only when one is picked. Its
  average colour then decides whether the chrome goes light, as an upload's does.
- **Pages are back.** A letter is a stack of sheets again: "Add a page", ‹ Page /
  Page ›, and a nudge when the writing runs off the sheet — measured on both
  axes, since a full diary spread overflows sideways, not down. Each sheet keeps
  its own two sides and its own post card address. "Open a file" is back too, on
  the typewriter. Both had been removed earlier at Usman's request and are in the
  new design; say the word and they go again.
- **Type has a floor.** 11px, with the printed rules taking the same floor by the
  same factor, so a short window shrinks the sheet without making it unreadable
  and without pulling the writing off its rules.
- **The chooser** rests on the design's objects: the burgundy portable, the green
  notebook and the airmail card.

## What changed (September 2026)

Asked for by Usman after reviewing the port.

- **Toolbar.** The bottom bar is dropdown menus — Paper type, Font, Format,
  Stickers, Polaroid, Backdrop — then Turn over, Sign it and Spell check, with
  the word count and the screen's primary action (Done, Send it, Send as a
  letter) always right-most. The always-on sticker tray, "add a page", "open a
  file", "my backdrop", "the night machine" and the one-word-per-paper row are gone.
- **Stickers** are the ten stars and the two wax seals, added from the menu.
  Click a placed sticker or polaroid to select it: drag to move, the knob turns
  it (Shift snaps to 15°), the corner resizes it, × or Delete removes it.
- **Polaroids** come from the Polaroid menu as square, portrait or landscape. The
  photo well opens a picker; a selected polaroid can replace its photo. Nothing is
  pinned to the letter any more, and pictures survive moving between screens.
- **Stars.** Nine of the star cut-outs had a near-black ring baked into their
  colour at full opacity (the knock-out edge). Those edge pixels were recoloured
  from a smoothed sample of the star's own interior, and the silhouette's jaggies
  softened on the edge only.
- **Write anywhere.** A click on blank paper pads the letter with real line breaks
  and spaces up to that point (click-and-type), so the letter stays one flowing
  text and one undo removes the padding. The postcard's address lines take text.
- **Formats** apply on click, as one undoable step. (Before, the uncontrolled
  editor never re-synced, so choosing a format appeared to do nothing.)
- **Fonts.** 40 Google Fonts through @fontsource, in five groups, loaded on
  demand. Each is fitted to Courier Prime at runtime — a size factor from the
  x-height and a vertical shift from ascent and descent — so the baseline stays
  on the photographed rules.
- **Backdrop** menu: swatches, a colour wheel, and a + for your own HD picture
  (at least 1280 × 720). On a dark backdrop the chrome's ink turns light while
  the paper and envelope keep dark ink. The envelope's "any colour" uses the same wheel.
- **Envelope** is exactly the postcard's size; the two share the field's height.
- **Navigation.** Back with an arrow on every screen, a step trail whose finished
  steps are clickable, and browser Back/Forward between screens. Fixed on the way:
  flipping the card on S5 no longer leaves the writer on the back, going from S4
  back to S3 asks about the envelope again, and "send as a letter" respects the
  word limit.
- **Type.** Abril Fatface for the wordmark and Libre Franklin for navigation,
  toolbar and menus (`--font-display`, `--font-ui`). The letter and body type are
  unchanged.

Not built from the brief: own-sticker upload with background removal and AI
moderation.

## What changed in the port

Only the vertical positioning, which was the reported problem. Everything
else — colours, type, paper geometry, cut-outs, animations, copy — was carried
over as-is.

1. **The picker screens sat at the bottom of the window.** Their row was
   `height: 100%` with `align-items: flex-end`, so the objects were pinned to
   the foot of the field with a large void above and the captions against the
   bottom edge. The row is now auto-height and the field centres it. The
   `flex-end` stays: it is what gives the objects a shared ground line so they
   read as resting on a desk.

2. **The letter had to be scrolled to.** The sheet carried a `min-width` floor
   (585px for a letter) that outranked the rule meant to fit it to the field's
   height, so it rendered 757px tall inside a 631px field. The floor is now
   `min(readability floor, height-derived width)`, so it yields when the window
   is short. On a window with room the sheet still renders at its designed
   size — 581×752 with ~12px type at 1280×1000, matching the export.

3. **The sheet was measured against the whole field.** It shares that space with
   the column's padding, a 20px gap and the hint line, so `deskChrome` now
   reserves them. Without it the sheet overshot the field by ~16px and the
   scrollbar came back.

4. **Short windows clipped the picker objects.** They now carry a `max-width`
   derived from the leftover height, which shrinks them proportionally rather
   than cropping. It never binds at ordinary window sizes.

## Notes

- `sc-if` / `sc-for` / `{{ }}` became JSX; `style-hover` became the `.td-*`
  classes in `app.css`, which need `!important` to outrank inline styles.
- `<image-slot>` was a design-tool element; `components/ImageSlot.jsx` replaces it.
- `src/assets/` holds only the 18 woff2 subsets; every picture lives in `public/`.
- `App` accepts `startScreen`, `wordLimit` and `letterInk` as props, the same
  three the export exposed.
