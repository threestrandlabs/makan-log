import { findSamplePhoto, samplePhotos } from "@/data/samplePhotos";
import { DEFAULT_SAMPLE_ID } from "@/data/defaults";
import { getLastUpload } from "./uploadStore";
import type { PhotoInput } from "@/data/recogniser";

export type ResolvedPhoto = {
  input: PhotoInput;
  source: number | { uri: string };
  label: string;
  isUpload: boolean;
};

/** Resolves ?sample= / ?upload= query params to a concrete photo + PhotoInput, falling back to
 * the first sample photo so every screen behaves sensibly when opened directly (SPEC). */
export function resolvePhotoParams(params: { sample?: string; upload?: string }): ResolvedPhoto {
  if (params.upload === "1") {
    const uri = getLastUpload();
    if (uri) {
      return { input: { kind: "upload", uri }, source: { uri }, label: "Your photo", isUpload: true };
    }
  }
  const sample = findSamplePhoto(params.sample ?? "") ?? findSamplePhoto(DEFAULT_SAMPLE_ID) ?? samplePhotos[0];
  return {
    input: { kind: "sample", sampleId: sample.id },
    source: sample.image,
    label: sample.label,
    isUpload: false,
  };
}
