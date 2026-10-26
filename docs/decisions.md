# Build decisions and data-mapping notes

Scope: `SPEC.md`. This note covers choices the spec left open and how the dietitian's CSVs map
onto the app. The "v0.2" section at the top covers the later **Mixed plates** and **Design
exports** additions; everything below it is the original v0.1 build.

## v0.2: mixed plates and design-export fidelity

- **Mixed plates** (`SPEC.md` "Mixed plates" section). `Recogniser.recognise()` now returns a
  `RecognitionResult` that's either `{ type: 'single', guesses }` (unchanged) or
  `{ type: 'mixed', rice, sides }` (`src/data/types.ts`). The bundled "Cai png" sample photo is
  the one mixed-plate sample; its stir-fried-cabbage guess is deliberately marked `uncertain` to
  exercise the "check this" marker. Recognising → routes straight to
  `/confirm?mixed=1&...` for a mixed result, skipping `/results` entirely (a mixed plate has no
  top-3 whole-dish guess to show); `/results` itself redirects onward if it's opened directly
  with a mixed sample's params, so every route still "works when opened directly" per spec.
  - `src/data/mixedPlate.ts` is the mixed-plate half of the data layer: the 8-item "side" catalog
    (every `cp_*` component row in the CSV except rice), a plain substring search over it, and
    `computeMixedPlateRange(sideItemIds, rice)` - sum of the chosen rice item's low/high plus
    each side's low/high. A side id with no matching row is left out of the sum and reported in
    `missingSideIds` rather than counted as zero, so "Missing side data → say so" is a real code
    path, not just a comment.
  - The Confirm screen (`app/confirm.tsx`) branches on `?mixed=1` (or `?dish=cai_png`, so the
    dishCatalog's `cai_png` composite entry and Results' search box both lead to the same mixed
    UI) into a separate `MixedConfirm` component: a rice segmented control (full/less/half/no
    rice - all four, since the recogniser type already allows `'none'` and the data supports it,
    even though the spec text abbreviates the row to "full / less / half"), one row per side with
    a "Tap to fix" affordance that opens an inline closest-matches list + search box, a "+ Add
    side" row, and per-side ✕ remove (the spec's web-safe alternative to swipe-to-delete, used on
    every platform here for one consistent interaction). Before the user taps **Confirm dishes**
    the range card is replaced by "Confirm your dishes to see an estimate"; afterwards it shows
    the live sum and keeps updating as rice/sides are edited further.
  - `src/data/parseRecogniserJson.ts` (`stripCodeFences()` / `parseRecogniserJson()`) is unused by
    the simulated recogniser (there's no JSON to parse yet) but is there, with a doc comment, for
    the real recogniser the spec anticipates: strip a ` ```json ... ``` ` fence before
    `JSON.parse`.
- **Design exports** (`SPEC.md` "Design exports" section). Re-read against
  `design/claude-design-v0.1/export/makan-log-snap-a-meal.html` (rendered with Playwright - it's
  a self-contained bundler page with six `blob:` iframes, so the only way to get its real DOM/copy
  is to run it) and the six `frames/*@2x.png`:
  - **Copy** was pulled verbatim from the rendered iframes' `innerText` where the data layer
    allows it (e.g. Recognising's three step labels, Results' "Our best guesses, closest first.
    Tap the one that fits.", Confirm's footer "Estimates are based on a typical stall plate.
    Yours may differ a bit."). Numbers in the export frames (e.g. a "Nasi lemak 520–1,000 kcal"
    guess) are the static mockup's own illustrative figures and were **not** copied - this build
    keeps computing every number from the CSV, so the same guess shows whatever that dish's real
    row works out to.
  - Camera was rebuilt to match `frames/2-camera-upload@2x.png`: a full-bleed dark capture view
    (close/flash buttons, bracket-cornered frame, "Fit the whole plate in" caption pill, Upload +
    shutter row) with the sample-photo grid (still required by the base spec) appended below as a
    scrollable section, since the export's camera frame doesn't show that interaction at all.
  - Today/Saved were rebuilt around a shared `TodayContent` component matching
    `frames/1-today@2x.png` / `6-saved-to-today@2x.png`: brand header (mark + "Makan Log" +
    date), a dynamic subtitle ("Two meals in. Got dinner coming?" / "Three meals in. Shiok.",
    `src/data/mealSlot.ts`), slot + time on each meal row, and a dashed "+ {Slot}? Snap it when
    it's served" prompt for the next due, not-yet-logged core slot. The frames show **"Saved"
    as the Today screen itself** with a bottom toast and the new entry outlined - not a separate
    confirmation page - so `app/saved.tsx` now renders `TodayContent` (highlighting the saved
    meal) plus a `Toast` overlay instead of its own banner/CTA layout. `/saved` is still its own
    route per the base spec; it just looks like Today-plus-a-toast now, matching the export.
  - This introduced the one piece of state the v0.1 build didn't have: a meal's **slot**
    (breakfast/lunch/tea/dinner/supper), derived from its save time in `slotForDate()`
    (`src/data/savedMeals.ts` calls it on save) purely for display - there's still no slot picker
    or onboarding anywhere in the app.
  - Results' guess rows got numbered circle badges and a "Best match" pill on the top guess, and
    Recognising got filled checkmark/pending-dot step icons, both matching `frames/3` and
    `frames/4`.

## v0.1

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
  (`recognise(photo) -> RecognitionResult`, single or mixed - see the v0.2 section above) purely
  as a lookup table (`SimulatedRecogniser`), with a synchronous `resolveRecognition()` used by
  `/results` and `/confirm` so a direct deep link doesn't have to replay the loading delay.
- Seven sample photos are bundled in `assets/samples/`, picked from
  `engineering/photo-test/photos/` for openly-licensed Wikimedia Commons sources already vetted
  in `engineering/photo-test/manifest.csv` (CC0/CC BY/CC BY-SA/public domain; full credits on the
  in-app About screen and below). One sample (hokkien mee) deliberately has no calorie data, to
  exercise the "No estimate yet" path; one (cai png) is the mixed-plate sample.
- An uploaded/taken photo always resolves to the same plausible default guess set
  (`uploadDefaultRecognition`, a `type: 'single'` result), per spec ("Unknown/uploaded photos
  return a plausible default set"). The photo itself is held in a small in-memory store
  (`src/lib/uploadStore.ts`) rather than passed through the URL, so `/recognising?upload=1` stays
  linkable without a giant data: URI in the address bar; if the store is empty (e.g. a fresh deep
  link), it falls back to the default sample photo like every other screen.

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

## Polish backlog (from Madeleine, 26 Oct)
- Save to Today button: replace download arrow with a check mark or plus.
- Make "logging as Breakfast" tappable to change the meal.
