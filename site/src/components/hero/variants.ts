/**
 * Hero centrepieces, one per page type. Kept free of three.js imports so the
 * content schema can validate `scene` in services/*.json against it.
 */
export const HERO_SCENES = ["blob", "ring", "lattice", "burst"] as const;

export type HeroSceneId = (typeof HERO_SCENES)[number];
