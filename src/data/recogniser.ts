import type { RecognitionResult } from "./types";
import { findSamplePhoto, uploadDefaultRecognition } from "./samplePhotos";

export type PhotoInput = { kind: "sample"; sampleId: string } | { kind: "upload"; uri: string };

/** Pure, synchronous recognition lookup - same result the simulated recogniser below resolves
 * to, exposed separately so screens opened directly (e.g. /results?sample=laksa) can render
 * immediately without replaying the "recognising" delay. */
export function resolveRecognition(photo: PhotoInput): RecognitionResult {
  if (photo.kind === "sample") {
    const sample = findSamplePhoto(photo.sampleId);
    if (sample) return sample.recognition;
  }
  // Real/unknown photos: v0.1 has no model, so we return the same plausible default every time.
  return uploadDefaultRecognition;
}

/**
 * SPEC: "Recogniser interface (recognise(photo) -> top 3 {dishId, confidence}); v0.1
 * implementation is simulated using bundled sample photos... Unknown/uploaded photos return a
 * plausible default set. Real model plugs in later."
 *
 * SPEC "Mixed plates": the result also carries `type: 'single' | 'mixed'` - a mixed plate (cai
 * png / economy rice) gets a rice call plus one guess per side instead of a top-3 dish list.
 *
 * Note for a future real recogniser: if it returns JSON wrapped in a ```json ... ``` code
 * fence (common with LLM-backed vision APIs), strip the fence before `JSON.parse` - see
 * `parseRecogniserJson()` / `stripCodeFences()` in `./parseRecogniserJson`.
 */
export interface Recogniser {
  recognise(photo: PhotoInput): Promise<RecognitionResult>;
}

const SIMULATED_DELAY_MS = 1100;

export class SimulatedRecogniser implements Recogniser {
  async recognise(photo: PhotoInput): Promise<RecognitionResult> {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
    return resolveRecognition(photo);
  }
}

export const recogniser: Recogniser = new SimulatedRecogniser();
export const RECOGNITION_DELAY_MS = SIMULATED_DELAY_MS;
