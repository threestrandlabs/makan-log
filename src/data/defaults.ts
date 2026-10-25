import { samplePhotos } from "./samplePhotos";

// SPEC: "/results and /confirm default to the first sample photo / first guess" when opened
// directly with no query params.
export const DEFAULT_SAMPLE_ID = samplePhotos[0].id;
export const DEFAULT_DISH_ID = samplePhotos[0].guesses[0].dishId;
