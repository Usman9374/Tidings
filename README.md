# Tidings

Write a letter by hand or on a typewriter, dress it with cut-outs and photographs,
seal it in an envelope and send it.

A React port of the original single-file Claude Design export. The design is
unchanged; only the vertical layout was corrected (see below).

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
src/
  main.jsx              mounts the app, pulls in the two stylesheets
  App.jsx               all state, all computed styles — renderVals() returns the
                        single object every screen reads from
  data.js               paper geometry, cut-out objects, machines, seed copy
  assets.js             logical path -> built URL, via real imports
  components/
    ImageSlot.jsx       the drop-in picture well (backdrop, polaroids, signature)
  screens/
    Header.jsx          masthead, back, status
    Chooser.jsx         screens 1-2 — pick a path, then a medium
    Desk.jsx            screens 3-5 — the writing surface and the envelope
    Typewriter.jsx      screens 6-7 — the machine and the page it typed
    Toolbar.jsx         the tray, envelope options, action words
  styles/
    tokens.css          design-system tokens + @font-face (verbatim from the export)
    app.css             page reset, keyframes, hover states
  assets/               29 images and 18 font subsets, extracted from the bundle
```

`App.jsx` holds the state and computes every style; the screens are presentational
and read from the `v` object it passes down. That is the same split the export
had — its template consumed a values object — so screens can be moved or
restyled without touching the state machine.

### Screens

| # | State | Screen |
|---|-------|--------|
| 1 | `isS1` | letter or typewriter |
| 2 | `isS2` | diary, letter or postcard |
| 3 | `isS3` | write, decorate, choose paper |
| 4 | `isS4` | envelope, colour, seal, stamp |
| 5 | `isS5` | as your reader sees it |
| 6 | `isS6` | the typewriter |
| 7 | `isS7` | the typed page |

## What changed from the export

Only the vertical positioning, which was the reported problem. Everything
else — colours, type, paper geometry, cut-outs, animations, copy — is carried
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
- Every image in `src/assets/` is referenced by `assets.js`; there are no spares.
  The ~1,240 unused JPEGs that shipped alongside the original export, and the
  export itself, were cleared out once the port was verified against them.
- `App` accepts `startScreen`, `wordLimit` and `letterInk` as props, the same
  three the export exposed.
