import * as THREE from 'three';
import { V, mat, mesh } from '../../kit';
import { FLOAT, LOOP, TAU, wave } from '../../motion';
import { type SceneDef, GROUND_Y } from '../../stage';

/* QuantumTec — messaging: Sputnik-1 */

export function sputnik(): SceneDef {
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
      }),
    ),
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
    const antenna = mesh(new THREE.CylinderGeometry(0.01, 0.018, len, 8), antennaMat);
    antenna.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
    antenna.position.copy(mount).addScaledVector(dir, len / 2);
    const boot = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.12, 16), bootMat);
    boot.quaternion.copy(antenna.quaternion);
    boot.position.copy(mount).addScaledVector(dir, 0.02);
    sat.add(antenna, boot);
  }
  const holder = new THREE.Group();
  holder.add(sat);
  // flying left → right, antennae trailing
  holder.rotation.order = 'YXZ';
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
