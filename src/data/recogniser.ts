import type { DishGuess } from "./types";
import { findSamplePhoto, uploadDefaultGuesses } from "./samplePhotos";

export type PhotoInput = { kind: "sample"; sampleId: string } | { kind: "upload"; uri: string };

/** Pure, synchronous guess lookup - same result the simulated recogniser below resolves to,
 * exposed separately so screens opened directly (e.g. /results?sample=laksa) can render the
 * top 3 guesses immediately without replaying the "recognising" delay. */
export function resolveGuesses(photo: PhotoInput): DishGuess[] {
  if (photo.kind === "sample") {
    const sample = findSamplePhoto(photo.sampleId);
    if (sample) return sample.guesses;
  }
  // Real/unknown photos: v0.1 has no model, so we return the same plausible default every time.
  return uploadDefaultGuesses;
}

/**
 * SPEC: "Recogniser interface (recognise(photo) -> top 3 {dishId, confidence}); v0.1
 * implementation is simulated using bundled sample photos... Unknown/uploaded photos return a
 * plausible default set. Real model plugs in later."
 */
export interface Recogniser {
  recognise(photo: PhotoInput): Promise<DishGuess[]>;
}

const SIMULATED_DELAY_MS = 1100;

export class SimulatedRecogniser implements Recogniser {
  async recognise(photo: PhotoInput): Promise<DishGuess[]> {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
    return resolveGuesses(photo);
  }
}

export const recogniser: Recogniser = new SimulatedRecogniser();
export const RECOGNITION_DELAY_MS = SIMULATED_DELAY_MS;
