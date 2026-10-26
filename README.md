# Makan Log (v0.1)

A photo-logging demo for Singapore hawker meals: snap a plate, get an honest calorie **range**
(never an exact number), tweak it ("less rice", "extra egg"...), save it to Today. Mixed plates
(cai png / economy rice) get their own confirm step — rice as one row, each side as its own
fixable guess, summed only once you confirm. Built with Expo + expo-router, TypeScript, and no
backend — everything runs on-device.

This is a prototype. See `SPEC.md` for the brief and `docs/decisions.md` for build decisions and
data-mapping notes.

## Requirements

- Node.js 20+ (the installed Expo SDK's `package.json` engines field asks for Node 22+; in
  practice `npm run typecheck` and `npm run export:web` both pass on Node 20.19 too — see
  docs/decisions.md).
- npm.

## Setup

```sh
npm install
```

## Run

```sh
npm start          # Expo dev server; scan the QR code with Expo Go, or press w/i/a
npm run web        # same, opens straight into the web target
npm run ios        # iOS simulator (macOS only)
npm run android    # Android emulator
```

The app works in **Expo Go** — no custom native code.

## Typecheck

```sh
npm run typecheck   # tsc --noEmit
```

## Web export

```sh
npm run export:web   # regenerates data + theme, then `expo export --platform web` into dist/
```

`dist/` is a static build: every screen (`/`, `/camera`, `/recognising`, `/results`,
`/confirm`, `/saved`, plus `/about`) is pre-rendered as its own static route, so any one of them
can be opened or screenshotted directly. Serve it locally with e.g. `npx serve dist`.

## Data pipeline

```sh
npm run data   # regenerates src/data/generated/*.json and src/theme/tokens.generated.ts
```

This reads straight from the source-of-truth files one level up in the monorepo
(`../../nutrition/calorie-ranges-v0.1*.csv`, `../../design/tokens-v0.1.json`) and writes
generated TypeScript/JSON into this app. It also runs automatically before `start`/`web`
(`predev`/`prestart`) and before `export:web`, and its output is committed so a checkout of just
this folder still builds. See `docs/decisions.md` for the mapping details.

## Project layout

```
app/                  expo-router routes (one file per screen)
src/theme/             design tokens (generated) + ThemeProvider (light/dark)
src/data/               NutritionSource, dish catalog, calorie-range calculator,
                         mixed-plate (cai png) data layer, simulated Recogniser,
                         AsyncStorage-backed saved meals
src/data/generated/     JSON generated from the dietitian's CSVs (npm run data)
src/components/         shared UI (Button, Chip, RangeCard, Screen, ...)
assets/samples/         bundled sample hawker photos (openly licensed, see docs/decisions.md)
scripts/                build-data.js / build-theme.js / parse-csv.js (the "npm run data" step)
```

## What's simulated

- **Photo recognition** (`src/data/recogniser.ts`): there's no vision model. Bundled sample
  photos resolve to hand-picked guesses; any taken/uploaded photo resolves to the same plausible
  default set. A real model can replace `SimulatedRecogniser` without touching any screen, since
  screens only depend on the `Recogniser` interface.
- **Calorie data**: only ever read from `nutrition/calorie-ranges-v0.1*.csv`. Dishes or
  modifiers with no row show "No estimate yet" rather than a made-up number (try the "Hokkien
  mee" sample photo).
