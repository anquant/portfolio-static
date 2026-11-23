import * as THREE from 'three';
import { mat, mesh } from '../../kit';
import { TAU, ease, wave } from '../../motion';
import { type SceneDef, GROUND_Y } from '../../stage';

/* VESTA — the round Temple of Vesta */

export function temple(): SceneDef {
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
  const cella = mesh(new THREE.CylinderGeometry(0.82, 0.82, colH, 72), mat.mid());
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
  const entablature = mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.2, 96), mat.light());
  entablature.position.y = y + 0.1;
  const cornice = mesh(new THREE.CylinderGeometry(1.38, 1.34, 0.07, 96), mat.mid());
  cornice.position.y = y + 0.235;
  tholos.add(entablature, cornice);
  y += 0.27;
  const domeMat = mat.accent();
  const dome = mesh(new THREE.SphereGeometry(1.18, 72, 24, 0, TAU, 0, Math.PI / 2), domeMat);
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
      domeMat.emissiveIntensity = 0.06 + 0.1 * ease.inOut(0.5 + 0.5 * wave(t, 2));
    },
  };
}
