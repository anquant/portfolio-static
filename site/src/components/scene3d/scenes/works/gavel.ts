import * as THREE from 'three';
import { accentTint, lathe, mat, mesh } from '../../kit';
import { ease, keyframes, phase } from '../../motion';
import { type SceneDef, GROUND_Y } from '../../stage';

/* Benefit Litigation — law: a judge's gavel */

export function gavel(): SceneDef {
  const root = new THREE.Group();
  const block = mesh(
    lathe([
      [0, 0],
      [1.12, 0],
      [1.18, 0.04],
      [1.2, 0.12],
      [1.18, 0.22],
      [1.12, 0.26],
      [0.9, 0.26],
      [0.86, 0.29],
      [0.86, 0.44],
      [0.82, 0.48],
      [0, 0.48],
    ]),
    mat.mid(),
  );
  root.add(block);

  const wood = mat.accent({
    roughness: 0.55,
    metalness: 0,
    emissiveIntensity: 0.05,
    envMapIntensity: 0.6,
  });
  const band = mat.accent({
    color: accentTint(0.35),
    roughness: 0.6,
    metalness: 0,
    emissiveIntensity: 0.04,
    envMapIntensity: 0.6,
  });

  const g = new THREE.Group();
  const cap: [number, number][] = [
    [0.4, 0.33],
    [0.45, 0.36],
    [0.47, 0.43],
    [0.45, 0.5],
    [0.37, 0.53],
    [0.37, 0.58],
    [0.44, 0.61],
    [0.47, 0.68],
    [0.45, 0.76],
    [0.38, 0.8],
    [0, 0.8],
  ];
  const capA = mesh(lathe(cap), wood);
  const capB = mesh(lathe(cap), wood);
  capB.rotation.x = Math.PI;
  g.add(capA, capB, mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.68, 72), band));
  const handle = mesh(
    lathe(
      [
        [0, 0],
        [0.12, 0],
        [0.13, 0.06],
        [0.12, 0.12],
        [0.085, 0.16],
        [0.1, 0.22],
        [0.08, 0.28],
        [0.075, 0.4],
        [0.09, 0.9],
        [0.11, 1.55],
        [0.105, 1.95],
        [0.085, 2.1],
        [0.1, 2.17],
        [0.095, 2.25],
        [0.06, 2.3],
        [0, 2.31],
      ],
      48,
    ),
    wood,
  );
  handle.rotation.z = -Math.PI / 2;
  handle.position.x = 0.38;
  g.add(handle);
  g.rotation.order = 'YXZ';
  g.rotation.set(0, 0.3, -0.32);
  g.position.set(-0.75, 1.85, 0.25);
  root.add(g);
  root.position.y = GROUND_Y;
  root.scale.setScalar(1.3);

  const REST = 1.85;
  const TOP = 2.02;
  const HIT = 1.34; // head touches the block

  return {
    root,
    update(t) {
      const p = phase(t);
      // wind-up → strike → rebound → settle
      const y = keyframes(p, [
        [0, REST],
        [0.42, TOP, ease.inOut],
        [0.5, HIT, ease.in],
        [0.6, 1.58, ease.out],
        [1, REST, ease.inOut],
      ]);
      g.position.y = y;
      g.rotation.z = -0.32 - 0.14 * ((y - HIT) / (TOP - HIT) - 0.75); // cocks back on the wind-up
      // the block takes the impact
      const hit = p >= 0.5 ? Math.exp(-(p - 0.5) * 60) : 0;
      block.scale.set(1 + 0.025 * hit, 1 - 0.06 * hit, 1 + 0.025 * hit);
    },
  };
}
