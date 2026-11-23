/*
 * Motion system shared by every work scene.
 *
 * One beat for the whole series: every motion is periodic in LOOP seconds
 * (or a whole multiple of it), so scenes loop seamlessly and move like one
 * family. Scenes are pure functions of time — no accumulated state — which
 * also makes any frame reproducible.
 */

export const LOOP = 8; // seconds
export const TAU = Math.PI * 2;

/** Shared "hover in the air" amplitude, in scene units */
export const FLOAT = 0.06;

/** Position inside the loop, 0..1. `k` = repeats per loop, `off` = phase shift */
export const phase = (t: number, k = 1, off = 0) => ((((t / LOOP) * k + off) % 1) + 1) % 1;

/** Sine wave, -1..1, `k` periods per loop */
export const wave = (t: number, k = 1, off = 0) => Math.sin(TAU * ((t / LOOP) * k + off));

/** Triangle 0 → 1 → 0 over a phase */
export const tri = (p: number) => 1 - Math.abs(2 * p - 1);

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

type Ease = (x: number) => number;

export const ease = {
  inOut: (x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)) as Ease,
  in: (x => x * x * x) as Ease,
  out: (x => 1 - Math.pow(1 - x, 3)) as Ease,
  /** ≈ the site's cubic-bezier(0.2, 0.7, 0.1, 1) */
  outQuart: (x => 1 - Math.pow(1 - x, 4)) as Ease,
};

/** Keyframes sampled at phase p: [p, value, easing into this key] */
export type Key = [number, number, Ease?];

export function keyframes(p: number, keys: Key[]) {
  for (let i = 1; i < keys.length; i++) {
    const [p0, v0] = keys[i - 1];
    const [p1, v1, e = ease.inOut] = keys[i];
    if (p <= p1) return v0 + (v1 - v0) * e(clamp01((p - p0) / (p1 - p0)));
  }
  return keys[keys.length - 1][1];
}
