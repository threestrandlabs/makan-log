import { samplePhotos } from "./samplePhotos";

// SPEC: "/results and /confirm default to the first sample photo / first guess" when opened
// directly with no query params. The first sample photo is a single-dish recognition.
const firstRecognition = samplePhotos[0].recognition;

export const DEFAULT_SAMPLE_ID = samplePhotos[0].id;
export const DEFAULT_DISH_ID = firstRecognition.type === "single" ? firstRecognition.guesses[0].dishId : "chicken_rice_roasted";

// The bundled mixed-plate sample, used as the fallback when a mixed-plate screen is opened
// directly with a photo that has no mixed recognition data of its own.
export const DEFAULT_MIXED_SAMPLE_ID = samplePhotos.find((s) => s.recognition.type === "mixed")?.id ?? DEFAULT_SAMPLE_ID;
