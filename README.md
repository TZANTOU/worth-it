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
- **Product search:** [Open Products Facts](https://world.openproductsfacts.org) (`src/lib/openProducts.ts`).
  Text search, or type a barcode. Anything not found can be added by hand.
- **Scoring** (`src/lib/scoring.ts`): each category has an expected lifespan and weekly use
  (`src/lib/categories.ts`). Fulfilment = hours used so far ÷ expected lifetime hours. 100% = paid off.
  Also shows cost per hour, pace versus a typical owner, and when it will pay off.
- **Look:** single-weight ink lines on paper (`src/components/GadgetArt.tsx`, `src/index.css`).
  Gadgets stand on one continuous line; each kind has its own hover animation.

## Ideas for later

Room and bag scenes, usage check-ins, camera-based usage and damage detection, sync across devices.
# worth-it
# worth-it
