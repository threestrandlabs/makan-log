// Tiny in-memory holder for the most recently taken/uploaded photo, so the camera -> recognising
// -> results -> confirm flow can reference it without putting a data: URI into the URL. If the app
// is opened directly on /recognising or /results with ?upload=1 and nothing has been captured yet
// in this session, callers fall back to the default sample photo (see src/data/defaults.ts).
let lastUploadUri: string | null = null;

export function setLastUpload(uri: string) {
  lastUploadUri = uri;
}

export function getLastUpload(): string | null {
  return lastUploadUri;
}
