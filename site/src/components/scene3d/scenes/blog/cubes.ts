import * as THREE from "three";
import { V, mat, mesh } from "../../kit";
import { FLOAT, clamp01, ease, keyframes, phase, wave } from "../../motion";
import { type SceneDef, GROUND_Y } from "../../stage";

/* Deploying Next.js — a cube of blocks assembling itself */
export function cubes(): SceneDef {
  const root = new THREE.Group();
  const cluster = new THREE.Group();
  const S = 0.5;
  const STEP = 0.56;
  let seed = 5;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const light = mat.light();
  const mid = mat.mid();
  const parts: {
    m: THREE.Mesh;
    home: THREE.Vector3;
    away: THREE.Vector3;
    delay: number;
  }[] = [];
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) {
        if (rnd() < 0.22) continue; // gaps make it read as an assembly
        const home = V(x * STEP, y * STEP, z * STEP);
        const loose = rnd() < 0.4 && (x !== 0 || y !== 0 || z !== 0);
        const m = mesh(
          new THREE.BoxGeometry(S, S, S),
          rnd() < 0.3 ? mid : light
        );
        const dir = home.clone().normalize();
        parts.push({
          m,
          home,
          away: loose
            ? home.clone().addScaledVector(dir, 0.45 + rnd() * 0.4)
            : home.clone(),
          delay: rnd() * 0.12,
        });
        cluster.add(m);
      }
  // the accent block is the last piece to fly in
  const key = mesh(new THREE.BoxGeometry(S, S, S), mat.accent());
  const keyHome = V(STEP, STEP, STEP);
  parts.push({
    m: key,
    home: keyHome,
    away: keyHome.clone().multiplyScalar(1.9),
    delay: 0.16,
  });
  cluster.add(key);
  cluster.position.y = 1.35;
  cluster.rotation.set(0.12, 0.35, 0);
  root.add(cluster);
  root.position.y = GROUND_Y;
  root.scale.setScalar(1.15);

  return {
    root,
    update(t) {
      const p = phase(t);
      for (const s of parts) {
        // scattered → fly in → hold together → drift apart again
        const k = keyframes(clamp01(p - s.delay), [
          [0, 0],
          [0.12, 0],
          [0.45, 1, ease.inOut],
          [0.72, 1],
          [0.98, 0, ease.inOut],
        ]);
        s.m.position.lerpVectors(s.away, s.home, k);
        s.m.rotation.set((1 - k) * 0.6, (1 - k) * 0.4, 0);
      }
      cluster.rotation.y = 0.35 + 0.2 * wave(t, 1);
      cluster.position.y = 1.35 + FLOAT * wave(t, 2);
    },
  };
}
