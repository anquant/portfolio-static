import * as THREE from 'three';

import { V, accentTint, mat, mesh } from '../../kit';
import { FLOAT, ease, keyframes, phase, wave } from '../../motion';
import { type SceneDef, CAMERA_POSITION, GROUND_Y } from '../../stage';

/* Next.js for business — an open laptop with a growth arrow drawn out of its screen */
export function laptop(): SceneDef {
  const root = new THREE.Group();
  const device = new THREE.Group();
  const shell = mat.light();
  const base = mesh(new THREE.BoxGeometry(2.4, 0.1, 1.6), shell);
  base.position.y = 0.05;
  const keyboard = mesh(new THREE.BoxGeometry(2.0, 0.02, 0.7), mat.dark());
  keyboard.position.set(0, 0.105, -0.25);
  const touchpad = mesh(new THREE.BoxGeometry(0.72, 0.012, 0.4), mat.mid());
  touchpad.position.set(0, 0.104, 0.42);
  device.add(base, keyboard, touchpad);
  // lid hinged on the back edge
  const hinge = new THREE.Group();
  hinge.position.set(0, 0.1, -0.78);
  const lid = mesh(new THREE.BoxGeometry(2.4, 1.55, 0.07), shell);
  lid.position.y = 0.775;
  const screen = mesh(
    new THREE.BoxGeometry(2.16, 1.32, 0.01),
    mat.accent({
      color: accentTint(0.55),
      emissiveIntensity: 0.35,
      roughness: 0.3,
    }),
  );
  screen.position.set(0, 0.79, 0.04);
  hinge.add(lid, screen);
  hinge.rotation.x = -0.22;
  device.add(hinge);
  device.rotation.y = 0.4;
  device.position.set(0.15, 0, 0.35);
  root.add(device);
  // growth arrow drawn up out of the screen, in a plane facing the viewer
  const arrowMat = mat.accent();
  const path = [V(-0.85, 0, 0), V(-0.3, 0.55, 0), V(0.1, 0.25, 0), V(0.85, 1.15, 0)];
  const R = 0.065;
  const segGeo = new THREE.CylinderGeometry(R, R, 1, 24);
  segGeo.translate(0, 0.5, 0); // grows from its start point
  const up = V(0, 1, 0);
  const segments = path.slice(1).map((end, i) => {
    const start = path[i];
    const dir = end.clone().sub(start);
    const length = dir.length();
    const m = mesh(segGeo, arrowMat);
    m.position.copy(start);
    m.quaternion.setFromUnitVectors(up, dir.normalize());

    return { m, start, dir, length };
  });
  const joints = path.slice(1, -1).map(p => {
    const j = mesh(new THREE.SphereGeometry(R, 24, 12), arrowMat);
    j.position.copy(p);

    return j;
  });
  const head = mesh(new THREE.ConeGeometry(0.19, 0.36, 32), arrowMat);
  const arrow = new THREE.Group();
  arrow.add(...segments.map(s => s.m), ...joints, head);
  const total = segments.reduce((sum, s) => sum + s.length, 0);
  // place it just in front of the screen, rising above the lid
  const arrowHolder = new THREE.Group();
  arrowHolder.add(arrow);
  arrowHolder.position.set(0.42, 1.0, 0.55);
  arrowHolder.lookAt(CAMERA_POSITION.clone().add(V(0, -GROUND_Y, 0)));
  root.add(arrowHolder);
  root.position.y = GROUND_Y;
  root.scale.setScalar(1.35);

  return {
    root,
    update(t) {
      // draw the line up, hold, then rewind
      const k = keyframes(phase(t), [
        [0, 0],
        [0.1, 0],
        [0.5, 1, ease.inOut],
        [0.85, 1],
        [1, 0, ease.inOut],
      ]);
      let left = k * total;
      let tip = path[0];
      let tipDir = segments[0].dir;
      segments.forEach((sg, i) => {
        const len = Math.min(sg.length, Math.max(0, left));
        sg.m.scale.y = Math.max(len, 1e-4);
        sg.m.visible = len > 0;
        if (i > 0) {
          joints[i - 1].visible = len > 0;
        }
        if (len > 0) {
          tip = sg.start.clone().addScaledVector(sg.dir, len);
          tipDir = sg.dir;
        }
        left -= sg.length;
      });
      head.visible = k > 0.01;
      head.position.copy(tip).addScaledVector(tipDir, 0.12);
      head.quaternion.setFromUnitVectors(up, tipDir);
      device.position.y = FLOAT * 0.6 * wave(t, 2);
      hinge.rotation.x = -0.22 - 0.03 * wave(t, 1, 0.25);
    },
  };
}
