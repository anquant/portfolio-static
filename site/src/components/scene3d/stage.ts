import * as THREE from 'three';
import { V, mesh } from './kit';

/*
 * The common stage every scene is composed for: one camera placement and
 * ground plane (lights live in the engine). Scenes that aim things at the
 * viewer or move them "across the screen" use these constants.
 */

export type SceneDef = {
  root: THREE.Object3D;
  update: (t: number) => void;
};

/** Shared camera placement — scenes that aim things at the viewer use it */
export const CAMERA_POSITION = V(7.6, 5.3, 8.8);
export const CAMERA_TARGET = V(0, 1.0, 0);
/** World directions that read as screen-right / screen-up from the camera */
export const SCREEN_RIGHT = V(0.76, 0, -0.65);
export const SCREEN_UP = V(-0.3, 0.92, -0.26).normalize();

/** Ground height inside the stage */
export const GROUND_Y = -0.55;

/** Box with its base at y = 0, so scale.y grows it upwards */
export function column(w: number, h: number, d: number, m: THREE.Material) {
  const geo = new THREE.BoxGeometry(w, h, d);
  geo.translate(0, h / 2, 0);
  return mesh(geo, m);
}
