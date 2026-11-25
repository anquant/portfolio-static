import * as THREE from 'three';

import { mat, mesh } from '../../kit';
import { FLOAT, ease, keyframes, phase, wave } from '../../motion';
import { type SceneDef, GROUND_Y, SCREEN_RIGHT } from '../../stage';

/* GEO / AI search — a small round robot with glowing eyes, waving hello */

const HEAD_R = 0.62;
const HEAD_SCALE = new THREE.Vector3(1.12, 0.92, 1);

/** A capsule hanging down from its top end, so rotating it swings it like a limb */
function limb(radius: number, length: number, m: THREE.Material) {
  const geo = new THREE.CapsuleGeometry(radius, length, 8, 20);
  geo.translate(0, -length / 2 - radius, 0);

  return mesh(geo, m);
}

export function robot(): SceneDef {
  const root = new THREE.Group();
  const bot = new THREE.Group();
  const shell = mat.light();
  const joint = mat.mid();
  const dark = mat.dark();
  const glow = mat.accent({ emissiveIntensity: 0.9, roughness: 0.3 });

  // legs and feet
  for (const side of [-1, 1]) {
    const leg = mesh(new THREE.CapsuleGeometry(0.11, 0.2, 8, 20), joint);
    leg.position.set(side * 0.2, 0.3, 0);
    const foot = mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.12, 32), dark);
    foot.scale.z = 1.25;
    foot.position.set(side * 0.2, 0.06, 0.04);
    bot.add(leg, foot);
  }

  // body: an egg with a round chest panel
  const torso = new THREE.Group();
  torso.position.y = 0.88;
  const body = mesh(new THREE.SphereGeometry(0.5, 64, 32), shell);
  body.scale.set(0.95, 1.05, 0.85);
  const panel = mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 48), joint);
  panel.rotation.x = Math.PI / 2;
  panel.position.set(0, 0.06, 0.415);
  torso.add(body, panel);
  bot.add(torso);

  // arms hang from the shoulders; the right one waves
  const arms = [-1, 1].map(side => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.44, 1.12, 0);
    const arm = limb(0.08, 0.32, joint);
    const hand = mesh(new THREE.SphereGeometry(0.1, 32, 16), dark);
    hand.position.y = -0.56;
    shoulder.add(arm, hand);
    shoulder.rotation.z = side * 0.18;
    bot.add(shoulder);

    return shoulder;
  });
  const waving = arms[1];

  // head: shell, dark visor, glowing ring eyes, ear discs, antennae
  const head = new THREE.Group();
  head.position.y = 1.88;
  const skull = mesh(new THREE.SphereGeometry(HEAD_R, 64, 32), shell);
  skull.scale.copy(HEAD_SCALE);
  const visor = mesh(
    new THREE.SphereGeometry(HEAD_R + 0.012, 64, 32, Math.PI / 2 - 0.95, 1.9, Math.PI / 2 - 0.5, 1.0),
    dark,
  );
  visor.scale.copy(HEAD_SCALE);
  head.add(skull, visor);

  const eyes = [-1, 1].map(side => {
    const eye = new THREE.Group();
    const x = side * 0.22;
    const z = (HEAD_R + 0.012) * Math.sqrt(1 - (x / ((HEAD_R + 0.012) * HEAD_SCALE.x)) ** 2);
    eye.position.set(x, 0.02, z + 0.01);
    eye.rotation.y = side * 0.3;
    eye.add(mesh(new THREE.TorusGeometry(0.125, 0.03, 16, 48), glow));
    const pupil = mesh(new THREE.CircleGeometry(0.07, 32), mat.accent({ emissiveIntensity: 0.25 }));
    pupil.position.z = -0.005;
    eye.add(pupil);
    head.add(eye);

    return eye;
  });

  for (const side of [-1, 1]) {
    const ear = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 40), joint);
    ear.rotation.z = Math.PI / 2;
    ear.position.x = side * HEAD_R * HEAD_SCALE.x;
    head.add(ear);
  }

  const antennae = [-1, 1].map(side => {
    const base = new THREE.Group();
    base.position.set(side * 0.2, HEAD_R * HEAD_SCALE.y - 0.06, 0);
    base.rotation.z = -side * 0.42;
    const rod = mesh(new THREE.CylinderGeometry(0.018, 0.024, 0.28, 12), dark);
    rod.position.y = 0.14;
    const tip = mesh(new THREE.SphereGeometry(0.075, 32, 16), joint);
    tip.position.y = 0.31;
    base.add(rod, tip);
    head.add(base);

    return { base, side };
  });
  bot.add(head);

  bot.rotation.y = 0.5; // three-quarter view, turned towards the camera
  root.add(bot);
  root.position.set(SCREEN_RIGHT.x * 0.35, GROUND_Y, SCREEN_RIGHT.z * 0.35);
  root.scale.setScalar(1.5);

  return {
    root,
    update(t) {
      const p = phase(t);
      // raise the right arm, wave twice, lower it
      const raise = keyframes(p, [
        [0, 0],
        [0.08, 0],
        [0.2, 1, ease.outQuart],
        [0.48, 1],
        [0.6, 0, ease.inOut],
        [1, 0],
      ]);
      if (waving) {
        waving.rotation.z = 0.18 + raise * (2.35 + 0.28 * wave(t, 6));
      }
      // blink twice in the second half of the loop
      const blink = keyframes(p, [
        [0, 1],
        [0.7, 1],
        [0.72, 0.1],
        [0.74, 1],
        [0.78, 1],
        [0.8, 0.1],
        [0.82, 1],
        [1, 1],
      ]);
      for (const eye of eyes) {
        eye.scale.y = blink;
      }
      head.rotation.z = 0.1 * wave(t, 1) + 0.06 * raise;
      head.rotation.y = 0.12 * wave(t, 1, 0.25);
      head.position.y = 1.88 + 0.02 * wave(t, 4);
      for (const { base, side } of antennae) {
        base.rotation.z = -side * 0.42 + 0.12 * wave(t, 4, side * 0.15);
      }
      torso.rotation.z = -0.03 * raise;
      bot.position.y = FLOAT * 0.3 * (1 + wave(t, 2));
    },
  };
}
