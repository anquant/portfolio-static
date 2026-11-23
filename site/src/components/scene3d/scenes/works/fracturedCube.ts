import * as THREE from 'three';
import { V, accentTint, fracturedCube, mat, mesh } from '../../kit';
import { ease, phase, tri, wave } from '../../motion';
import { type SceneDef, CAMERA_POSITION, GROUND_Y, SCREEN_RIGHT, SCREEN_UP } from '../../stage';

/* ОцЭкс — damage assessment: a cracked cube under a lens */

export function fracturedCubeScene(): SceneDef {
  const root = new THREE.Group();
  const cube = new THREE.Group();
  const light = mat.light();
  const mid = mat.mid();
  const shards = fracturedCube(1.0, 14, 0.05, 11).map(({ geometry, center }, i) => {
    const m = mesh(geometry, i % 5 === 0 ? mid : light);
    m.position.copy(center);
    cube.add(m);
    return { m, home: center.clone(), dir: center.clone().normalize() };
  });
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
    }),
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
        s.m.position.copy(s.home).addScaledVector(s.dir, 0.012 + 0.045 * ease.inOut(tri(phase(t, 1, -i * 0.012)))),
      );
      // the lens scans the cube along a figure-eight
      lens.position
        .copy(lensHome)
        .addScaledVector(SCREEN_RIGHT, 0.3 * wave(t, 1))
        .addScaledVector(SCREEN_UP, 0.2 * wave(t, 2, 0.25));
    },
  };
}
