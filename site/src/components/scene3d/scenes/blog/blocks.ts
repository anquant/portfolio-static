import * as THREE from 'three';
import { mat } from '../../kit';
import { ease, phase, tri } from '../../motion';
import { type SceneDef, GROUND_Y, column } from '../../stage';

/* SSR & SEO — three blocks of different heights, the tallest in accent */
export function blocks(): SceneDef {
  const root = new THREE.Group();
  const set: [number, number, number, number, THREE.Material][] = [
    // x, z, footprint, height
    [-0.55, -0.45, 0.95, 2.45, mat.accent()],
    [0.8, -0.1, 0.85, 1.85, mat.light()],
    [0.05, 0.8, 0.85, 0.85, mat.mid()],
  ];
  const cols = set.map(([x, z, s, h, m]) => {
    const c = column(s, h, s, m);
    c.position.set(x, 0, z);
    root.add(c);
    return c;
  });
  root.rotation.y = 0.15;
  root.position.y = GROUND_Y;
  root.scale.setScalar(1.3);

  return {
    root,
    update(t) {
      // grow one after another, like a rising ranking
      cols.forEach((c, i) => {
        c.scale.y = 0.86 + 0.14 * ease.inOut(tri(phase(t, 1, -i * 0.08)));
      });
    },
  };
}
