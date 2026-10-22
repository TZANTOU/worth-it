# Worth it?

Did the gadget you bought pay for itself? Add your gadgets to a hand-drawn shelf, answer a few
questions about how you use them, and see how much of the price you have "earned back" in use.

## Run it

```bash
npm install
npm run dev
```

`npm test` runs the scoring tests, `npm run build` type-checks and builds.

## How it works

- **Stack:** React + Vite + TypeScript. Data lives in the browser (IndexedDB via Dexie).
- **Product search:** [Wikidata](https://www.wikidata.org) by name (`src/lib/wikidata.ts`), keeping only
  real product models; [Open Products Facts](https://world.openproductsfacts.org) by barcode
  (`src/lib/openProducts.ts`). Anything not found can be added by hand.
- **Scoring** (`src/lib/scoring.ts`): each category has an expected lifespan and weekly use
  (`src/lib/categories.ts`). Fulfilment = hours used so far ÷ expected lifetime hours. 100% = paid off.
  Also shows cost per hour, pace versus a typical owner, and when it will pay off.
- **Weekly check-ins** (`src/lib/checkIns.ts`): "Did you use it this week?" Answered weeks replace the
  estimate, and the last 8 weeks set the current pace.
- **Share card** (`src/lib/shareCard.ts`): a 1080×1350 comic page of your gadgets, drawn on a canvas.
- **Look:** single-weight ink lines on paper (`src/components/GadgetArt.tsx`, `src/index.css`).
  Gadgets stand on one continuous line; each kind has its own hover animation.

## Ideas for later

Camera-based usage and damage detection, sync across devices, push reminders.
# worth-it
# worth-it
# worth-it
