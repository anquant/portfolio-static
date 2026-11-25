/**
 * Ids of the animated 3D scenes (work previews and blog covers). Kept free of three.js imports so
 * content types and cards can reference them without pulling WebGL code.
 */
export const SCENE_IDS = [
  'containers',
  'diamond',
  'paper-plane',
  'gavel',
  'fractured-cube',
  'temple',
  'sputnik',
  // blog covers
  'laptop',
  'blocks',
  'servers',
  'cubes',
  'robot',
] as const;

export type SceneId = (typeof SCENE_IDS)[number];
