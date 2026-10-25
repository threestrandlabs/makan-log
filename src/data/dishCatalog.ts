import type { DishDef } from "./types";

/**
 * The curated list of "whole dish" entries the app can recognise, search or log.
 * Every id with an `itemId` or `partItemIds` points at a real row in
 * src/data/generated/items.json (sourced from the dietitian's CSV) - we never make up a dish
 * that has no backing data. Dishes with kind "unavailable" are real hawker dishes that show up
 * in our sample photos but have no calorie-ranges-v0.1 row yet, so the app must show
 * "No estimate yet" for them rather than invent a number.
 */
export const dishCatalog: DishDef[] = [
  {
    id: "cai_png",
    name: "Cai png (mixed rice)",
    portionLabel: "Rice, curry chicken, stir-fried cabbage",
    kind: "composite",
    partItemIds: ["cp_rice_full", "cp_meat_currychicken", "cp_veg_cabbage"],
    riceModifierIds: ["less_rice", "half_rice", "no_rice", "extra_rice"],
    modifierIds: ["add_curry_gravy", "add_braised_gravy", "extra_fried_egg", "extra_boiled_egg"],
  },
  {
    id: "chicken_rice_steamed",
    name: "Chicken rice (steamed)",
    portionLabel: "Steamed (white) chicken",
    kind: "item",
    itemId: "chicken_rice_steamed",
    modifierIds: ["less_rice_flavoured_cr", "half_rice_flavoured_cr", "plain_rice_cr", "extra_fried_egg", "extra_boiled_egg"],
  },
  {
    id: "chicken_rice_roasted",
    name: "Chicken rice (roasted)",
    portionLabel: "Roasted chicken",
    kind: "item",
    itemId: "chicken_rice_roasted",
    modifierIds: ["less_rice_flavoured_cr", "half_rice_flavoured_cr", "plain_rice_cr", "extra_fried_egg", "extra_boiled_egg"],
  },
  {
    id: "laksa",
    name: "Laksa",
    portionLabel: "Curry laksa / laksa lemak, standard bowl",
    kind: "item",
    itemId: "laksa",
    modifierIds: ["leave_half_laksa_gravy"],
  },
  {
    id: "nasi_lemak_basic",
    name: "Nasi lemak (basic set)",
    portionLabel: "Egg, ikan bilis, peanuts, sambal",
    kind: "item",
    itemId: "nasi_lemak_basic",
    modifierIds: ["less_rice_flavoured_nl", "half_rice_flavoured_nl", "plain_rice_nl", "extra_fried_egg", "extra_boiled_egg", "extra_sambal"],
  },
  {
    id: "nasi_lemak_wing",
    name: "Nasi lemak (with chicken wing)",
    portionLabel: "Fried chicken wing set",
    kind: "item",
    itemId: "nasi_lemak_wing",
    modifierIds: ["less_rice_flavoured_nl", "half_rice_flavoured_nl", "plain_rice_nl", "extra_fried_egg", "extra_boiled_egg", "extra_sambal"],
  },
  {
    id: "char_kway_teow",
    name: "Char kway teow",
    portionLabel: "Standard plate",
    kind: "item",
    itemId: "char_kway_teow",
    modifierIds: ["extra_fried_egg"],
  },
  {
    id: "fishball_noodles_dry",
    name: "Fishball noodles (dry)",
    portionLabel: "Mee pok / mee kia, chilli or tomato sauce",
    kind: "item",
    itemId: "fishball_noodles_dry",
    modifierIds: [],
  },
  {
    id: "fishball_noodles_soup",
    name: "Fishball noodles (soup)",
    portionLabel: "Bowl with soup",
    kind: "item",
    itemId: "fishball_noodles_soup",
    modifierIds: ["leave_clear_soup"],
  },
  {
    id: "mee_goreng",
    name: "Mee goreng",
    portionLabel: "Indian / Malay style, standard plate",
    kind: "item",
    itemId: "mee_goreng",
    modifierIds: ["extra_fried_egg"],
  },
  {
    id: "roti_prata_plain",
    name: "Roti prata (plain)",
    portionLabel: "1 piece, without curry",
    kind: "item",
    itemId: "roti_prata_plain",
    modifierIds: ["add_curry_dip"],
  },
  {
    id: "roti_prata_egg",
    name: "Roti prata (egg)",
    portionLabel: "1 piece, without curry",
    kind: "item",
    itemId: "roti_prata_egg",
    modifierIds: ["add_curry_dip"],
  },
  {
    id: "economic_bee_hoon",
    name: "Economic bee hoon",
    portionLabel: "Luncheon meat, fried egg and vegetables",
    kind: "item",
    itemId: "economic_bee_hoon",
    modifierIds: ["extra_fried_egg"],
  },
  {
    id: "ytf_clear_mixed",
    name: "Yong tau foo (clear soup, mixed)",
    portionLabel: "7 pieces, mixed fried and non-fried",
    kind: "item",
    itemId: "ytf_clear_mixed",
    modifierIds: ["leave_clear_soup", "ytf_add_noodles_or_rice"],
  },
  {
    id: "ytf_clear_fried",
    name: "Yong tau foo (clear soup, all fried)",
    portionLabel: "7 pieces, all fried",
    kind: "item",
    itemId: "ytf_clear_fried",
    modifierIds: ["leave_clear_soup", "ytf_add_noodles_or_rice"],
  },
  {
    id: "ytf_laksa_boiled",
    name: "Yong tau foo (laksa gravy, non-fried)",
    portionLabel: "7 pieces in laksa gravy",
    kind: "item",
    itemId: "ytf_laksa_boiled",
    modifierIds: ["leave_half_laksa_gravy", "ytf_add_noodles_or_rice"],
  },
  {
    id: "ytf_laksa_mixed",
    name: "Yong tau foo (laksa gravy, mixed)",
    portionLabel: "7 pieces in laksa gravy",
    kind: "item",
    itemId: "ytf_laksa_mixed",
    modifierIds: ["leave_half_laksa_gravy", "ytf_add_noodles_or_rice"],
  },
  // Hawker dishes that appear in our sample photos but have no calorie-ranges-v0.1 row yet.
  // Per SPEC: never invent a number, so these always resolve to "no estimate yet".
  {
    id: "hokkien_mee",
    name: "Hokkien mee",
    portionLabel: "Fried prawn noodles",
    kind: "unavailable",
    modifierIds: [],
  },
  {
    id: "bak_chor_mee",
    name: "Bak chor mee",
    portionLabel: "Minced meat noodles",
    kind: "unavailable",
    modifierIds: [],
  },
  {
    id: "satay",
    name: "Satay",
    portionLabel: "Grilled skewers with peanut sauce",
    kind: "unavailable",
    modifierIds: [],
  },
  {
    id: "kaya_toast",
    name: "Kaya toast",
    portionLabel: "Toast with kaya and butter",
    kind: "unavailable",
    modifierIds: [],
  },
];

export function findDish(id: string): DishDef | undefined {
  return dishCatalog.find((d) => d.id === id);
}
