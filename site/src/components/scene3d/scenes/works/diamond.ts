import * as THREE from "three";
import { V, diamondGeometry, mat, mesh, rockGeometry } from "../../kit";
import { FLOAT, LOOP, TAU, ease, phase, tri, wave } from "../../motion";
import { type SceneDef, GROUND_Y } from "../../stage";

/* ИГЕМ РАН — geology: a diamond revealed in split rock */

export function diamond(): SceneDef {
  const root = new THREE.Group();
  const base = mesh(rockGeometry(1.25, 1, 1.25, 0.55, 1.1), mat.dark());
  base.position.y = 0.45;
  root.add(base);

  const gem = mesh(
    diamondGeometry(),
    mat.accent({
      roughness: 0.22,
      metalness: 0.15,
      emissiveIntensity: 0.06,
      envMapIntensity: 0.9,
    })
  );
  gem.scale.setScalar(0.95);
  const holder = new THREE.Group();
  holder.add(gem);
  holder.position.y = 1.55;
  holder.rotation.set(0.1, 0, 0.25);
  root.add(holder);

  // the upper half of the rock, blown apart around the gem
  const rockMats = [mat.dark(), mat.mid(), mat.dark(), mat.light()];
  const shards: {
    r: number;
    s: [number, number, number];
    p: [number, number, number];
    rot: [number, number, number];
  }[] = [
    {
      r: 0.62,
      s: [1.2, 0.6, 0.9],
      p: [-1.45, 1.75, 0.35],
      rot: [0.4, 0.3, 0.6],
    },
    {
      r: 0.5,
      s: [0.9, 0.7, 1.1],
      p: [1.35, 2.05, -0.4],
      rot: [0.2, 1.1, -0.5],
    },
    {
      r: 0.42,
      s: [1.1, 0.55, 0.8],
      p: [0.2, 2.85, -0.9],
      rot: [0.9, 0.2, 0.3],
    },
    { r: 0.34, s: [1, 0.7, 0.9], p: [-0.75, 2.75, 0.9], rot: [-0.4, 0.8, 0.2] },
    { r: 0.26, s: [1, 0.8, 1], p: [1.1, 1.3, 1.15], rot: [0.3, -0.6, 0.9] },
    { r: 0.18, s: [1, 0.8, 1], p: [-1.2, 1.0, -0.9], rot: [0.6, 0.4, -0.3] },
  ];
  const parts = shards.map((d, i) => {
    const m = mesh(
      rockGeometry(d.r, i + 2, ...d.s),
      rockMats[i % rockMats.length]
    );
    m.position.set(...d.p);
    m.rotation.set(...d.rot);
    root.add(m);
    return {
      m,
      home: m.position.clone(),
      rot: m.rotation.clone(),
      dir: V(d.p[0], d.p[1] - 1.55, d.p[2]).normalize(),
    };
  });
  // rubble on the ground
  const rubble: [number, number, number, number][] = [
    [-0.9, 0.08, 1.3, 0.1],
    [1.6, 0.07, 0.5, 0.08],
    [0.6, 0.06, -1.4, 0.07],
  ];
  rubble.forEach(([x, y, z, r], i) => {
    const m = mesh(rockGeometry(r, 20 + i), mat.mid());
    m.position.set(x, y, z);
    root.add(m);
  });
  root.position.y = GROUND_Y;

  return {
    root,
    update(t) {
      gem.rotation.y = (TAU * t) / (LOOP * 2);
      holder.position.y = 1.55 + FLOAT * wave(t, 2);
      // shards breathe open and closed in a staggered cascade
      parts.forEach((s, i) => {
        const open = ease.inOut(tri(phase(t, 1, -i * 0.025)));
        s.m.position.copy(s.home).addScaledVector(s.dir, 0.1 * open);
        s.m.rotation.set(s.rot.x + 0.06 * open, s.rot.y + 0.12 * open, s.rot.z);
      });
    },
  };
}
