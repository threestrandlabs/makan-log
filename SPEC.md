# Makan Log v0.1 — build spec

Root paths below are relative to /workspace/three-strand-labs (call it ROOT).

## Stack
- Expo (React Native) + TypeScript, expo-router. Web first: `npx expo export --platform web` must succeed (output in dist/). Must still run in Expo Go.
- Local git repo only (git init + commits). NO push, publish, deploy, EAS, sign-ups or paid services. Budget S$0.
- Include README.md (run/build instructions) and docs/decisions.md (key decisions + data mapping notes).
- `npm run typecheck` (tsc --noEmit) must pass, as must the web export.

## Design
- Follow ROOT/design/claude-design-v0.1/ (screens-crop.png, shot-*.png, plus any exported code / per-screen PNGs present there). Look at the images.
- Six screens, designed for 390x844, each reachable by its own route so it can be screenshotted directly:
  1. `/` Today — day summary of saved meals (ranges), big "Snap your meal" button.
  2. `/camera` Camera/upload — take/upload photo (expo-image-picker) or pick a bundled sample photo.
  3. `/recognising` Recognising — loading state.
  4. `/results` Results — top 3 dish guesses with ranges, "Search instead" link (simple search over the data).
  5. `/confirm` Confirm — tweak chips Less rice / No gravy / Extra egg that update the range live; "Save to Today" button.
  6. `/saved` Saved to Today — confirmation, back to Today.
  Routes should work with sensible defaults when opened directly (e.g. /results and /confirm default to the first sample photo / first guess) — support query params like `?sample=1&dish=<id>`.
- Theme: mirror the token names in ROOT/design/tokens-v0.1.json exactly (generate/import a theme module from it). Brand rules: ROOT/brand/BRAND-SPEC.md. Light + dark mode.
- App icon/favicon/splash: ROOT/brand/app-icon-v2/plate-light-* and plate-dark-* (copy into assets). NEVER use the cord_* logo.

## Calorie data (strict)
- Data ONLY from ROOT/nutrition/calorie-ranges-v0.1.csv and ROOT/nutrition/calorie-ranges-v0.1__modifiers.csv. Read mapping notes in ROOT/nutrition/README.md and ROOT/nutrition/calorie-ranges-v0.1.md (closest-match mappings).
- A build-time script (`npm run data`, also run before export via a prebuild/predev hook or committed output) converts CSVs to JSON in src/data/generated/.
- Access via a swappable data-layer interface (e.g. `NutritionSource` with getDish, search, getModifiers, applyModifiers), with a JSON-backed implementation.
- Never invent numbers. If a dish or modifier has no data, show no number (e.g. "No estimate yet").
- Always display as a range plus the word "estimate" (e.g. "520–680 kcal estimate"). "Varies a lot" badge on rows flagged in the CSV.
- No "healthy"/"unhealthy" labels, no HPB/Nutri-Grade logos. Show the HPB attribution notice per ROOT/engineering/food-data-sources-v0.1.md (e.g. on Today/footer or an About sheet). Respect ROOT/nutrition/safety-guardrails-v0.1.md (no medical claims etc.).

## Recognition & storage
- `Recogniser` interface (recognise(photo) -> top 3 {dishId, confidence}); v0.1 implementation is simulated using bundled sample photos (use openly licensed photos from ROOT/engineering/photo-test if licences allow, else simple placeholder images) mapped to dish IDs from the data. Unknown/uploaded photos return a plausible default set. Real model plugs in later.
- Saved meals in on-device storage (@react-native-async-storage/async-storage, works on web). No backend.

## Done when
- typecheck and `npx expo export --platform web` both pass; git commit made.

## Mixed plates (cai png / economy rice) — confirm step
- Recogniser result includes: `type: 'single' | 'mixed'`, `sides: {dishId, confidence, uncertain: boolean}[]`, `rice: 'full'|'less'|'half'|'none'`, plus top-3 guesses for single dishes.
- Mixed-plate Confirm: rice is its own row with options full / less / half. Each side is its own chip showing the guess; tapping opens a short list of closest matches from Fromage's items plus a search box (one-tap fix). Swipe (or a remove control on web) to remove a side; "+ Add side" to add one. Uncertain sides get a small "check this" marker.
- No calories before confirming: show "Confirm your dishes to see an estimate". After confirm, range = sum of Fromage's per-side low/high figures (+ rice per option), shown with "estimate". Missing side data -> say so, no invented numbers.
- Single dishes (e.g. chicken rice) keep the current flow: top 3 guesses, then tweak chips.
- Include a mixed-plate sample photo. Any future real-recogniser JSON parser must strip ``` code fences before JSON.parse (add a helper + note).

## Design exports (primary visual reference)
- ROOT/design/claude-design-v0.1/export/makan-log-snap-a-meal.html — the whole design as one standalone page; use it for layout, spacing and copy.
- ROOT/design/claude-design-v0.1/frames/1-today@2x.png … 6-saved-to-today@2x.png — the six screens at 2x (780x1688). Match them. Ignore export/frame-4-results-html.zip.
- Exported Confirm shows only the single-dish layout; mixed plates follow the section above.
