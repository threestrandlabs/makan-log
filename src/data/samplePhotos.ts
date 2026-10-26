import type { RecognitionResult } from "./types";

export interface SamplePhoto {
  id: string;
  label: string;
  image: number;
  /** Wikimedia Commons credit, since these are real openly-licensed photos (see docs/decisions.md). */
  credit: string;
  recognition: RecognitionResult;
}

// Bundled, openly-licensed Wikimedia Commons photos (see docs/decisions.md for full licence/credit
// details). Recognition is simulated: each sample photo always resolves to the same result below.
export const samplePhotos: SamplePhoto[] = [
  {
    id: "chicken-rice",
    label: "Chicken rice",
    image: require("../../assets/samples/chicken-rice.jpg"),
    credit: "Pauloleong2002 / Wikimedia Commons, CC BY-SA 4.0",
    recognition: {
      type: "single",
      guesses: [
        { dishId: "chicken_rice_roasted", confidence: "high" },
        { dishId: "chicken_rice_steamed", confidence: "medium" },
        { dishId: "nasi_lemak_wing", confidence: "low" },
      ],
    },
  },
  {
    id: "cai-png",
    label: "Cai png",
    image: require("../../assets/samples/cai-png.jpg"),
    credit: "Aneeshnl / Wikimedia Commons, CC BY 4.0",
    // SPEC "Mixed plates": a mixed-plate sample photo, so recognition returns a rice call plus
    // one guess per side instead of a top-3 whole-dish list. The cabbage guess is deliberately
    // marked uncertain (it could be kailan) to exercise the "check this" marker.
    recognition: {
      type: "mixed",
      rice: "full",
      sides: [
        { dishId: "cp_meat_currychicken", confidence: "high", uncertain: false },
        { dishId: "cp_veg_cabbage", confidence: "medium", uncertain: true },
        { dishId: "cp_egg_fried", confidence: "medium", uncertain: false },
      ],
    },
  },
  {
    id: "laksa",
    label: "Laksa",
    image: require("../../assets/samples/laksa.jpg"),
    credit: "Chainwit. / Wikimedia Commons, CC BY 4.0",
    recognition: {
      type: "single",
      guesses: [
        { dishId: "laksa", confidence: "high" },
        { dishId: "mee_goreng", confidence: "medium" },
        { dishId: "ytf_laksa_mixed", confidence: "low" },
      ],
    },
  },
  {
    id: "nasi-lemak",
    label: "Nasi lemak",
    image: require("../../assets/samples/nasi-lemak.jpg"),
    credit: "Andy Li / Wikimedia Commons, CC0",
    recognition: {
      type: "single",
      guesses: [
        { dishId: "nasi_lemak_wing", confidence: "high" },
        { dishId: "nasi_lemak_basic", confidence: "medium" },
        { dishId: "cai_png", confidence: "low" },
      ],
    },
  },
  {
    id: "char-kway-teow",
    label: "Char kway teow",
    image: require("../../assets/samples/char-kway-teow.jpg"),
    credit: "Elizetang / Wikimedia Commons, public domain",
    recognition: {
      type: "single",
      guesses: [
        { dishId: "char_kway_teow", confidence: "high" },
        { dishId: "fishball_noodles_dry", confidence: "medium" },
        { dishId: "mee_goreng", confidence: "low" },
      ],
    },
  },
  {
    id: "roti-prata",
    label: "Roti prata",
    image: require("../../assets/samples/roti-prata.jpg"),
    credit: "mailer_diablo / Wikimedia Commons, CC BY-SA 3.0",
    recognition: {
      type: "single",
      guesses: [
        { dishId: "roti_prata_plain", confidence: "high" },
        { dishId: "roti_prata_egg", confidence: "medium" },
        { dishId: "kaya_toast", confidence: "low" },
      ],
    },
  },
  {
    id: "hokkien-mee",
    label: "Hokkien mee",
    image: require("../../assets/samples/hokkien-mee.jpg"),
    credit: "RM Bulseco / Wikimedia Commons, CC BY 2.0",
    recognition: {
      type: "single",
      guesses: [
        { dishId: "hokkien_mee", confidence: "high" },
        { dishId: "bak_chor_mee", confidence: "medium" },
        { dishId: "char_kway_teow", confidence: "low" },
      ],
    },
  },
];

export const uploadDefaultRecognition: RecognitionResult = {
  type: "single",
  guesses: [
    { dishId: "cai_png", confidence: "medium" },
    { dishId: "chicken_rice_steamed", confidence: "low" },
    { dishId: "nasi_lemak_basic", confidence: "low" },
  ],
};

export function findSamplePhoto(id: string): SamplePhoto | undefined {
  return samplePhotos.find((s) => s.id === id);
}
