/*
 * Colour tokens are defined once, in globals.css, as "R G B" triplets
 * (0–255) so Tailwind can add alpha: `rgb(var(--accent) / 0.5)`.
 * WebGL code reads the same tokens through this parser, so a palette change
 * in CSS reaches the 3D scenes too.
 */

export type Rgb = [r: number, g: number, b: number];

/** Parses "140 156 255" → [140/255, 156/255, 255/255]; null if malformed */
export function parseRgbToken(value: string): Rgb | null {
  const parts = value.trim().split(/\s+/).map(Number);
  return parts.length === 3 && parts.every((n) => n >= 0 && n <= 255)
    ? [parts[0] / 255, parts[1] / 255, parts[2] / 255]
    : null;
}

/** Reads a token from :root (browser only) */
export function readRgbToken(name: string): Rgb | null {
  return parseRgbToken(
    getComputedStyle(document.documentElement).getPropertyValue(name)
  );
}
