#!/usr/bin/env node
// Converts the dietitian's nutrition CSVs into JSON the app can import.
// Source of truth: ROOT/nutrition/calorie-ranges-v0.1*.csv. Never hand-edit the output.
const fs = require("fs");
const path = require("path");
const { csvToObjects } = require("./parse-csv");

const ROOT = path.resolve(__dirname, "../../..");
const NUTRITION_DIR = path.join(ROOT, "nutrition");
const OUT_DIR = path.resolve(__dirname, "../src/data/generated");

const ITEMS_CSV = path.join(NUTRITION_DIR, "calorie-ranges-v0.1.csv");
const MODIFIERS_CSV = path.join(NUTRITION_DIR, "calorie-ranges-v0.1__modifiers.csv");

const ATTRIBUTION =
  "Contains information from the Singapore Food Insights Database (SG FoodID), Health Promotion Board, " +
  "made available under the terms found at https://pphtpc.hpb.gov.sg/web/sgfoodid. The data is provided " +
  "on an \"as-is\" basis; no warranty is made as to its accuracy or completeness. Ranges shown here are " +
  "Three Strand Labs' own estimates, adapted from SG FoodID and other published sources for this demo. " +
  "Not an HPB product; HPB does not endorse this app.";

function num(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function bool(v) {
  return String(v).trim().toLowerCase() === "true";
}

function buildItems() {
  const raw = fs.readFileSync(ITEMS_CSV, "utf8");
  const rows = csvToObjects(raw);
  return rows.map((r) => ({
    id: r.item_id,
    name: r.item,
    variant: r.variant,
    portionG: num(r.portion_g),
    kcalPoint: num(r.kcal_point),
    kcalLow: num(r.kcal_low),
    kcalHigh: num(r.kcal_high),
    source: r.source,
    hpbId: r.hpb_id || null,
    confidence: r.confidence,
    rangeRule: r.range_rule,
    variesALot: bool(r.varies_a_lot),
    hpbUrl: r.hpb_url || null,
  }));
}

function buildModifiers() {
  const raw = fs.readFileSync(MODIFIERS_CSV, "utf8");
  const rows = csvToObjects(raw);
  return rows.map((r) => ({
    id: r.modifier,
    appliesTo: r.applies_to.split(";").map((s) => s.trim()).filter(Boolean),
    kcalDeltaLow: num(r.kcal_delta_low),
    kcalDeltaHigh: num(r.kcal_delta_high),
    label: r.label,
    basis: r.basis,
    source: r.source,
    confidence: r.confidence,
  }));
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const items = buildItems();
  const modifiers = buildModifiers();

  const meta = {
    generatedBy: "scripts/build-data.js",
    generatedFrom: ["nutrition/calorie-ranges-v0.1.csv", "nutrition/calorie-ranges-v0.1__modifiers.csv"],
    itemCount: items.length,
    modifierCount: modifiers.length,
    attribution: ATTRIBUTION,
    disclaimer: "Estimates for general information only. Not medical advice.",
  };

  fs.writeFileSync(path.join(OUT_DIR, "items.json"), JSON.stringify(items, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT_DIR, "modifiers.json"), JSON.stringify(modifiers, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT_DIR, "meta.json"), JSON.stringify(meta, null, 2) + "\n");

  console.log(`Wrote ${items.length} items and ${modifiers.length} modifiers to ${path.relative(process.cwd(), OUT_DIR)}`);
}

main();
