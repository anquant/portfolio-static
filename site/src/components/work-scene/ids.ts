/**
 * Scene ids for the animated work previews. Kept free of three.js imports so
 * content types and cards can reference them without pulling WebGL code.
 */
export const WORK_SCENES = [
  "containers",
  "diamond",
  "paper-plane",
  "gavel",
  "fractured-cube",
  "temple",
  "sputnik",
] as const;

export type WorkSceneId = (typeof WORK_SCENES)[number];
