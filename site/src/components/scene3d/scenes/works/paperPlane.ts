import * as THREE from 'three';
import { mat, mesh, paperPlaneGeometry } from '../../kit';
import { LOOP, TAU } from '../../motion';
import { type SceneDef, GROUND_Y } from '../../stage';

/* Сириус — messaging: a paper plane */

export function paperPlane(): SceneDef {
  const root = new THREE.Group();
  const plane = mesh(
    paperPlaneGeometry(),
    mat.accent({
      roughness: 0.8,
      metalness: 0,
      emissiveIntensity: 0.04,
      envMapIntensity: 0.35,
      side: THREE.DoubleSide,
    }),
  );
  const bank = new THREE.Group();
  bank.add(plane);
  const flight = new THREE.Group();
  flight.add(bank);
  // rear three-quarter view, heading right and slightly away
  flight.rotation.order = 'YXZ';
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
