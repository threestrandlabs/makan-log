# Build decisions and data-mapping notes (v0.1)

Scope: `SPEC.md`. This note covers choices the spec left open and how the dietitian's CSVs map
onto the app.

## Stack and environment

- **Expo SDK 58 / React 19.3 / expo-router**, from `create-expo-app@latest`. This is the current
  default; no SDK was pinned down in the spec.
- Scaffolded from the `blank-typescript` template rather than the default `tabs`/`default`
  template: the default template (global.css, `@expo/ui`, unistyles experiments) failed its own
  `tsc --noEmit` out of the box in this environment. expo-router, safe-area-context, screens and
  the rest were added manually on top of the clean TypeScript template.
- The environment's Node is 20.19; this SDK's packages ask for Node ≥22 in their `engines` field.
  That's a warning, not a hard failure here: `npm install --legacy-peer-deps` (needed once, for a
  `react-dom` peer mismatch pulled in by `expo-router`'s web/radix-ui dependency chain),
  `tsc --noEmit`, and `expo export --platform web` all complete cleanly on Node 20. Upgrading the
  environment's Node to 22+ would remove the warning but wasn't required to meet the "done when"
  bar.
- `web.output: "static"` in `app.json` so each route pre-renders to its own static HTML file in
  `dist/` (needed for "each reachable by its own route so it can be screenshotted directly").

## Design tokens

- `scripts/build-theme.js` reads `../../design/tokens-v0.1.json` and writes
  `src/theme/tokens.generated.ts` verbatim (same token names/values, just typed). `src/theme/
  theme.ts` derives the light/dark semantic palette from `color.*` / `color.dark.*` exactly as
  the token file's `$meta.theming` note describes, and `getTextStyle()` maps each `text.*` entry
  to a concrete font family + size + line height.
- Outfit/DM Sans are loaded via `@expo-google-fonts/outfit` and `@expo-google-fonts/dm-sans`
  (free, MIT-licensed font packages) rather than linking Google Fonts' CSS URL, so native (Expo
  Go) gets the same typography as web without a runtime network dependency.
- Dark mode follows the device color scheme by default (`useColorScheme`), with a manual toggle
  on the Today screen that overrides it for the session (`ThemeProvider`).

## Calorie data

- `scripts/build-data.js` parses `../../nutrition/calorie-ranges-v0.1.csv` and
  `../../nutrition/calorie-ranges-v0.1__modifiers.csv` into `src/data/generated/{items,
  modifiers,meta}.json`. No other nutrition source in the repo is touched, per spec ("Data ONLY
  from...").
- **`src/data/dishCatalog.ts`** is the one hand-curated file: it decides which CSV rows are
  "whole dishes" a user can log (`chicken_rice_roasted`, `laksa`, ...) versus cai png's
  *components* (`cp_rice_full`, `cp_meat_currychicken`, ...), and which modifiers are offered as
  chips for each dish. Every id it references is a real row from the generated JSON — the
  curation is about which parts of the dietitian's data to surface per dish, not new numbers.
  - **Cai png** is the one composite dish (sum of parts, per `calorie-ranges-v0.1.md` §2 step 5,
    including the ±45% of the summed HPB point value cap). Its default plate (full rice + curry
    chicken + stir-fried cabbage) is the dietitian's own worked example in that doc, which
    sanity-checks against HPB's whole-plate "Economic rice" row.
  - Rice-size modifiers (`less_rice`/`half_rice`/`no_rice`/`extra_rice`) are offered as ordinary
    toggle chips rather than swapping the rice line item, so cai png and non-composite dishes
    share one UI. They are mutually exclusive within a dish (`riceModifierIds`), matching the
    CSV's documented "Stacking rules: rice options are one exclusive group."
  - Four dishes that appear in the bundled sample photos (hokkien mee, bak chor mee, satay, kaya
    toast) have **no row** in `calorie-ranges-v0.1.csv`. They're kept in the catalog with
    `kind: "unavailable"` so recognising/searching for them resolves to "No estimate yet" instead
    of silently disappearing or inventing a number — this is the spec's "never invent numbers"
    rule made visible in the demo (try the "Hokkien mee" sample photo).
- Range math (`src/data/calc.ts`) is a straight TypeScript port of the arithmetic already
  prototyped and checked against the dietitian's numbers in
  `design/prototype-v0.1/js/app.js`: outward rounding to the nearest 10 kcal, modifier deltas
  added to the base range, and the composite sum-then-cap rule above.
- HPB attribution text (shown on the About screen and generated into `meta.json`) follows the
  wording in `engineering/food-data-sources-v0.1.md` §2.1 — conspicuous attribution, no implied
  endorsement, no HPB/Healthier Choice Symbol logos anywhere in the UI.

## Recognition and sample photos

- `src/data/recogniser.ts` implements the spec's `Recogniser` interface
  (`recognise(photo) -> top 3 {dishId, confidence}`) purely as a lookup table
  (`SimulatedRecogniser`), with a synchronous `resolveGuesses()` used by `/results` so a direct
  deep link doesn't have to replay the loading delay.
- Seven sample photos are bundled in `assets/samples/`, picked from
  `engineering/photo-test/photos/` for openly-licensed Wikimedia Commons sources already vetted
  in `engineering/photo-test/manifest.csv` (CC0/CC BY/CC BY-SA/public domain; full credits on the
  in-app About screen and below). One sample (hokkien mee) deliberately has no calorie data, to
  exercise the "No estimate yet" path.
- An uploaded/taken photo always resolves to the same plausible default guess set
  (`uploadDefaultGuesses`), per spec ("Unknown/uploaded photos return a plausible default set").
  The photo itself is held in a small in-memory store (`src/lib/uploadStore.ts`) rather than
  passed through the URL, so `/recognising?upload=1` stays linkable without a giant data: URI in
  the address bar; if the store is empty (e.g. a fresh deep link), it falls back to the default
  sample photo like every other screen.

### Sample photo credits (Wikimedia Commons)

| Sample | File | Author | Licence |
|---|---|---|---|
| Chicken rice | Hainanese chicken rice in Singapore.jpg | Pauloleong2002 | CC BY-SA 4.0 |
| Cai png | Economy Rice dish.jpg | Aneeshnl | CC BY 4.0 |
| Laksa | 328 Katong Laksa's set A... (2025).jpg | Chainwit. | CC BY 4.0 |
| Nasi lemak | Nasi Lemak - Roti King 2025-09-19.jpg | Andy Li | CC0 |
| Char kway teow | Char kway teow.jpg | Elizetang | Public domain |
| Roti prata | RotiPrata-Teh.JPG | mailer_diablo | CC BY-SA 3.0 |
| Hokkien mee | Fried Hokkien mee in Singapore - 20140215.jpg | RM Bulseco | CC BY 2.0 |

## Storage

- Saved meals live in `@react-native-async-storage/async-storage` under one JSON array
  (`src/data/savedMeals.ts`), which also works on web (AsyncStorage falls back to `localStorage`
  there). "Today" filters by local calendar date at read time rather than storing a separate
  per-day bucket, which is simpler and fine at demo scale.

## Safety / claims

- No "healthy"/"unhealthy" labelling, no HPB or Healthier Choice Symbol logos, every range is
  shown with the word "estimate", and "Varies a lot" badges are driven by the CSV's
  `varies_a_lot` flag (items) or by any component/modifier that sets it (composites) — never
  hand-picked per screen.
- The standing disclaimer from `nutrition/safety-guardrails-v0.1.md` §7.2 ("Estimates for general
  information only. Not medical advice...") is on the Today footer and the About screen.
- This build has no goals, targets, deficits, onboarding or accounts, so the calorie-floor and
  medical-screening guardrails in `safety-guardrails-v0.1.md` (which gate *those* features) don't
  apply yet; they're relevant again if a later version adds goal-setting.

## Not implemented (out of spec v0.1)

Plan/week view, grocery list, "check a dish before you order" as a separate flow, stall-level
data, onboarding/dietary filters, and any backend — all out of scope per `SPEC.md`'s six screens.
