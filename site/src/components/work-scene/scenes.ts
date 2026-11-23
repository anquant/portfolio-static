import * as THREE from "three";
import type { WorkSceneId } from "./ids";
import {
  ACCENT,
  V,
  accentTint,
  diamondGeometry,
  fracturedCube,
  lathe,
  mat,
  mesh,
  paperPlaneGeometry,
  rockGeometry,
} from "./kit";
import { FLOAT, LOOP, TAU, ease, keyframes, phase, tri, wave } from "./motion";

/*
 * One minimal 3D abstraction per project, all on the same stage:
 * same camera, light, ground and palette (three greys + the accent on the
 * hero object). Every `update(t)` is a pure function of time.
 */

export type WorkScene = {
  root: THREE.Object3D;
  update: (t: number) => void;
};

/** Shared camera placement — scenes that aim things at the viewer use it */
export const CAMERA_POSITION = V(7.6, 5.3, 8.8);
export const CAMERA_TARGET = V(0, 1.0, 0);
/** World directions that read as screen-right / screen-up from the camera */
const SCREEN_RIGHT = V(0.76, 0, -0.65);
const SCREEN_UP = V(-0.3, 0.92, -0.26).normalize();

/** Ground height inside the stage */
export const GROUND_Y = -0.55;

/* ------------------------------------------------------------------------ */
/* MLS — container logistics: a crane lowers the accent container           */
/* ------------------------------------------------------------------------ */

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

function containers(): WorkScene {
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

/* ------------------------------------------------------------------------ */
/* ИГЕМ РАН — geology: a diamond revealed in split rock                      */
/* ------------------------------------------------------------------------ */

function diamond(): WorkScene {
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

/* ------------------------------------------------------------------------ */
/* Сириус — messaging: a paper plane                                        */
/* ------------------------------------------------------------------------ */

function paperPlane(): WorkScene {
  const root = new THREE.Group();
  const plane = mesh(
    paperPlaneGeometry(),
    mat.accent({
      roughness: 0.8,
      metalness: 0,
      emissiveIntensity: 0.04,
      envMapIntensity: 0.35,
      side: THREE.DoubleSide,
    })
  );
  const bank = new THREE.Group();
  bank.add(plane);
  const flight = new THREE.Group();
  flight.add(bank);
  // rear three-quarter view, heading right and slightly away
  flight.rotation.order = "YXZ";
  flight.rotation.set(-0.1, 3.0, 0);
  flight.scale.setScalar(1.4);
  flight.position.set(0, 1.9, 0);
  root.add(flight);
  root.position.y = GROUND_Y;
  const ROLL = 0.35;

  return {
    root,
    update(t) {
      const a = TAU * (t / LOOP);
      bank.position.x = 0.22 * Math.sin(a); // lateral drift
      bank.rotation.z = ROLL - 0.14 * Math.cos(a); // banks into the drift
      flight.position.y = 1.9 + 0.1 * Math.sin(2 * a);
      bank.rotation.x = -0.06 * Math.cos(2 * a); // nose follows climb / dive
    },
  };
}

/* ------------------------------------------------------------------------ */
/* Benefit Litigation — law: a judge's gavel                                */
/* ------------------------------------------------------------------------ */

function gavel(): WorkScene {
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
    mat.mid()
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
  g.add(
    capA,
    capB,
    mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.68, 72), band)
  );
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
      48
    ),
    wood
  );
  handle.rotation.z = -Math.PI / 2;
  handle.position.x = 0.38;
  g.add(handle);
  g.rotation.order = "YXZ";
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

/* ------------------------------------------------------------------------ */
/* ОцЭкс — damage assessment: a cracked cube under a lens                   */
/* ------------------------------------------------------------------------ */

function fracturedCubeScene(): WorkScene {
  const root = new THREE.Group();
  const cube = new THREE.Group();
  const light = mat.light();
  const mid = mat.mid();
  const shards = fracturedCube(1.0, 14, 0.05, 11).map(
    ({ geometry, center }, i) => {
      const m = mesh(geometry, i % 5 === 0 ? mid : light);
      m.position.copy(center);
      cube.add(m);
      return { m, home: center.clone(), dir: center.clone().normalize() };
    }
  );
  cube.rotation.y = 0.1;
  cube.position.set(-0.75, 1.0, 0);
  root.add(cube);

  // biconvex glass: real refraction magnifies the cracks behind it
  const glass = new THREE.Mesh(
    new THREE.SphereGeometry(0.78, 96, 48),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 1,
      roughness: 0.02,
      metalness: 0,
      ior: 1.7,
      thickness: 1.2,
      specularIntensity: 0.5,
      envMapIntensity: 0.45,
      attenuationColor: accentTint(0.6),
      attenuationDistance: 3.5,
    })
  );
  glass.scale.z = 0.26;
  const lens = new THREE.Group();
  lens.add(glass);
  lens.scale.setScalar(1.15);
  const camDir = CAMERA_POSITION.clone().normalize();
  const lensHome = V(-0.75, 1.15, 0)
    .addScaledVector(camDir, 2.0)
    .add(V(0.35, 0.15, -0.3));
  lens.position.copy(lensHome);
  lens.lookAt(CAMERA_POSITION.clone().add(V(0, -GROUND_Y, 0)));
  root.add(lens);
  root.position.y = GROUND_Y;

  return {
    root,
    update(t) {
      shards.forEach((s, i) =>
        s.m.position
          .copy(s.home)
          .addScaledVector(
            s.dir,
            0.012 + 0.045 * ease.inOut(tri(phase(t, 1, -i * 0.012)))
          )
      );
      // the lens scans the cube along a figure-eight
      lens.position
        .copy(lensHome)
        .addScaledVector(SCREEN_RIGHT, 0.3 * wave(t, 1))
        .addScaledVector(SCREEN_UP, 0.2 * wave(t, 2, 0.25));
    },
  };
}

/* ------------------------------------------------------------------------ */
/* VESTA — the round Temple of Vesta                                        */
/* ------------------------------------------------------------------------ */

function temple(): WorkScene {
  const root = new THREE.Group();
  const tholos = new THREE.Group();
  let y = 0;
  // stepped podium
  const steps: [number, number, THREE.Material][] = [
    [1.62, 0.12, mat.dark()],
    [1.5, 0.12, mat.mid()],
    [1.38, 0.14, mat.mid()],
  ];
  for (const [r, h, m] of steps) {
    const step = mesh(new THREE.CylinderGeometry(r, r, h, 96), m);
    step.position.y = y + h / 2;
    tholos.add(step);
    y += h;
  }
  const colH = 1.55;
  const cella = mesh(
    new THREE.CylinderGeometry(0.82, 0.82, colH, 72),
    mat.mid()
  );
  cella.position.y = y + colH / 2;
  const door = mesh(new THREE.BoxGeometry(0.34, 0.9, 0.1), mat.dark());
  door.position.set(0.8 * Math.sin(0.71), y + 0.45, 0.8 * Math.cos(0.71)); // faces the camera
  door.rotation.y = 0.71;
  door.castShadow = false;
  tholos.add(cella, door);
  // colonnade
  const columnMat = mat.light();
  const shaftGeo = new THREE.CylinderGeometry(0.075, 0.09, colH - 0.16, 24);
  const baseGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 24);
  const capitalGeo = new THREE.BoxGeometry(0.22, 0.08, 0.22);
  const COLUMNS = 14;
  for (let i = 0; i < COLUMNS; i++) {
    const a = (i / COLUMNS) * TAU;
    const x = Math.cos(a) * 1.18;
    const z = Math.sin(a) * 1.18;
    const base = mesh(baseGeo, columnMat);
    base.position.set(x, y + 0.03, z);
    const shaft = mesh(shaftGeo, columnMat);
    shaft.position.set(x, y + colH / 2, z);
    const capital = mesh(capitalGeo, columnMat);
    capital.position.set(x, y + colH - 0.04, z);
    capital.rotation.y = -a;
    tholos.add(base, shaft, capital);
  }
  y += colH;
  const entablature = mesh(
    new THREE.CylinderGeometry(1.3, 1.3, 0.2, 96),
    mat.light()
  );
  entablature.position.y = y + 0.1;
  const cornice = mesh(
    new THREE.CylinderGeometry(1.38, 1.34, 0.07, 96),
    mat.mid()
  );
  cornice.position.y = y + 0.235;
  tholos.add(entablature, cornice);
  y += 0.27;
  const domeMat = mat.accent();
  const dome = mesh(
    new THREE.SphereGeometry(1.18, 72, 24, 0, TAU, 0, Math.PI / 2),
    domeMat
  );
  dome.scale.y = 0.5;
  dome.position.y = y;
  const finial = mesh(new THREE.SphereGeometry(0.09, 24, 12), domeMat);
  finial.position.y = y + 0.62;
  tholos.add(dome, finial);
  tholos.scale.setScalar(1.05);
  root.add(tholos);
  root.position.y = GROUND_Y;

  return {
    root,
    update(t) {
      tholos.rotation.y = 0.16 * wave(t, 1);
      // the dome breathes like the hearth fire Vesta guards
      domeMat.emissiveIntensity =
        0.06 + 0.1 * ease.inOut(0.5 + 0.5 * wave(t, 2));
    },
  };
}

/* ------------------------------------------------------------------------ */
/* QuantumTec — messaging: Sputnik-1                                        */
/* ------------------------------------------------------------------------ */

function sputnik(): WorkScene {
  const root = new THREE.Group();
  const sat = new THREE.Group();
  const R = 0.6;
  sat.add(
    mesh(
      new THREE.SphereGeometry(R, 64, 32),
      mat.accent({
        roughness: 0.22,
        metalness: 0.35,
        emissiveIntensity: 0.05,
        envMapIntensity: 1.0,
      })
    )
  );
  // seam between the two hemispheres, just ahead of the equator
  const seam = mesh(new THREE.TorusGeometry(R, 0.018, 12, 96), mat.light());
  seam.rotation.y = Math.PI / 2;
  seam.position.x = 0.12;
  seam.scale.setScalar(Math.sqrt(R * R - 0.12 * 0.12) / R);
  sat.add(seam);
  // four swept-back antennae: two long, two short
  const antennaMat = mat.light();
  const bootMat = mat.mid();
  const forward = V(1, 0, 0);
  const antennae: [number, number][] = [
    [45, 2.9],
    [135, 2.4],
    [225, 2.9],
    [315, 2.4],
  ];
  for (const [deg, len] of antennae) {
    const az = (deg * Math.PI) / 180;
    const radial = V(0, Math.cos(az), Math.sin(az));
    const mount = forward
      .clone()
      .multiplyScalar(Math.cos(0.95))
      .addScaledVector(radial, Math.sin(0.95))
      .multiplyScalar(R);
    const dir = V(-1, 0, 0).addScaledVector(radial, 0.42).normalize();
    const antenna = mesh(
      new THREE.CylinderGeometry(0.01, 0.018, len, 8),
      antennaMat
    );
    antenna.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
    antenna.position.copy(mount).addScaledVector(dir, len / 2);
    const boot = mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.12, 16),
      bootMat
    );
    boot.quaternion.copy(antenna.quaternion);
    boot.position.copy(mount).addScaledVector(dir, 0.02);
    sat.add(antenna, boot);
  }
  const holder = new THREE.Group();
  holder.add(sat);
  // flying left → right, antennae trailing
  holder.rotation.order = "YXZ";
  holder.rotation.set(0, 0.35, 0.18);
  holder.scale.setScalar(1.15);
  holder.position.set(0.9, 1.9, -0.4);
  root.add(holder);
  root.position.y = GROUND_Y;

  return {
    root,
    update(t) {
      sat.rotation.x = (TAU * t) / (LOOP * 2);
      holder.position.y = 1.9 + FLOAT * 1.3 * wave(t, 2);
      holder.rotation.z = 0.18 + 0.04 * wave(t, 1);
      holder.rotation.x = 0.03 * wave(t, 1, 0.25);
    },
  };
}

export const SCENES: Record<WorkSceneId, () => WorkScene> = {
  containers,
  diamond,
  "paper-plane": paperPlane,
  gavel,
  "fractured-cube": fracturedCubeScene,
  temple,
  sputnik,
};

export { ACCENT };
