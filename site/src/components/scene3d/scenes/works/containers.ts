import * as THREE from "three";
import { mat, mesh } from "../../kit";
import { ease, phase, tri, wave } from "../../motion";
import { type SceneDef } from "../../stage";

/* MLS — container logistics: a crane lowers the accent container */

function container(material: THREE.Material, L = 2.6, H = 1, D = 1.05) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(L, H, D), material));
  // corrugated long sides
  const ribGeo = new THREE.BoxGeometry(0.06, H * 0.86, 0.035);
  const ribs = 18;
  for (let i = 0; i < ribs; i++) {
    const x = -L / 2 + 0.18 + (i * (L - 0.36)) / (ribs - 1);
    for (const z of [D / 2 + 0.017, -D / 2 - 0.017]) {
      const r = mesh(ribGeo, material);
      r.position.set(x, 0, z);
      g.add(r);
    }
  }
  // corner posts
  const postGeo = new THREE.BoxGeometry(0.09, H + 0.02, 0.09);
  for (const x of [-L / 2, L / 2])
    for (const z of [-D / 2, D / 2]) {
      const p = mesh(postGeo, material);
      p.position.set(x, 0, z);
      g.add(p);
    }
  return g;
}

export function containers(): SceneDef {
  const root = new THREE.Group();
  const a = container(mat.dark());
  a.position.set(0, 0.5, -0.6);
  const b = container(mat.mid());
  b.position.set(0.15, 0.5, 0.6);
  const c = container(mat.light());
  c.rotation.y = Math.PI / 2;
  c.position.set(-0.1, 1.52, 0); // roof at y 2.02

  const lift = new THREE.Group();
  lift.add(container(mat.accent()));
  const cableMat = mat.light();
  for (const x of [-0.9, 0.9]) {
    const cable = mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 3.2, 6),
      cableMat
    );
    cable.position.set(x, 2.1, 0);
    cable.castShadow = false;
    lift.add(cable);
  }
  lift.position.set(0.4, 2.95, 0.2);
  root.add(a, b, c, lift);
  root.position.y = -0.85;
  root.scale.setScalar(1.08);

  return {
    root,
    update(t) {
      // lower, pause, lift; the lowest point keeps a clear gap above the roof below
      lift.position.y = 2.95 - 0.12 * ease.inOut(tri(phase(t)));
      // swinging on the cables
      lift.rotation.z = 0.025 * wave(t, 2, 0.1);
      lift.rotation.x = 0.015 * wave(t, 2, 0.35);
      lift.rotation.y = 0.35 + 0.06 * wave(t, 1);
    },
  };
}
