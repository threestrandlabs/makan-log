/**
 * v0.1's SimulatedRecogniser (src/data/recogniser.ts) never needs this - it resolves typed
 * objects straight out of the sample-photo table, no JSON text involved. But the SPEC's "real
 * model plugs in later" note means a future Recogniser implementation will likely parse a JSON
 * response out of an LLM, and those responses commonly arrive wrapped in a ```/```json code
 * fence. Any future JSON.parse of a raw recogniser response MUST go through this first.
 */
export function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

export function parseRecogniserJson(text: string): unknown {
  return JSON.parse(stripCodeFences(text));
}
