import type { SceneId } from '../ids';
import type { SceneDef } from '../stage';
import { containers } from './works/containers';
import { diamond } from './works/diamond';
import { paperPlane } from './works/paperPlane';
import { gavel } from './works/gavel';
import { fracturedCubeScene } from './works/fracturedCube';
import { temple } from './works/temple';
import { sputnik } from './works/sputnik';
import { laptop } from './blog/laptop';
import { blocks } from './blog/blocks';
import { servers } from './blog/servers';
import { cubes } from './blog/cubes';

/*
 * One minimal 3D abstraction per project and per blog post, all on the same
 * stage: same camera, light, ground and palette (three greys + the accent on
 * the hero object). Every `update(t)` is a pure function of time.
 *
 * Adding a scene: write a builder returning a SceneDef, add its id to
 * ../ids.ts and register it here — the type below fails until both match.
 */
export const SCENES: Record<SceneId, () => SceneDef> = {
  containers,
  diamond,
  'paper-plane': paperPlane,
  gavel,
  'fractured-cube': fracturedCubeScene,
  temple,
  sputnik,
  laptop,
  blocks,
  servers,
  cubes,
};
