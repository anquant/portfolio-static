import * as THREE from "three";
import { accentTint, mat, mesh } from "../../kit";
import { ease, keyframes, phase } from "../../motion";
import { type SceneDef, GROUND_Y, column } from "../../stage";

/* MySQL for Directus — two server cabinets, a drawer slides out */
function cabinet(body: THREE.Material, front: THREE.Material) {
  const W = 1.05;
  const H = 2.1;
  const D = 1.0;
  const g = new THREE.Group();
  g.add(column(W, H, D, body));
  // side vent panel
  const vent = mesh(new THREE.BoxGeometry(0.01, H * 0.8, D * 0.7), mat.dark());
  vent.position.set(W / 2 + 0.005, H / 2, 0);
  vent.castShadow = false;
  g.add(vent);
  const handleMat = mat.dark();
  const drawers: THREE.Group[] = [];
  for (let i = 0; i < 4; i++) {
    const drawer = new THREE.Group();
    const panel = mesh(new THREE.BoxGeometry(W * 0.86, 0.4, 0.06), front);
    const handle = mesh(new THREE.BoxGeometry(0.3, 0.04, 0.04), handleMat);
    handle.position.set(0, 0.1, 0.05);
    drawer.add(panel, handle);
    drawer.position.set(0, 0.32 + i * 0.47, D / 2 + 0.03);
    g.add(drawer);
    drawers.push(drawer);
  }
  return { g, drawers, D };
}

export function servers(): SceneDef {
  const root = new THREE.Group();
  const left = cabinet(mat.accent(), mat.accent({ color: accentTint(0.25) }));
  left.g.position.set(-0.6, 0, 0.45);
  const right = cabinet(mat.mid(), mat.light());
  right.g.position.set(0.7, 0, -0.55);
  root.add(left.g, right.g);
  // the open drawer: a tray with sheets of paper behind the front panel
  const drawer = left.drawers[1];
  const tray = new THREE.Group();
  const trayMat = mat.light();
  const floor = mesh(new THREE.BoxGeometry(0.86, 0.03, 0.8), trayMat);
  floor.position.set(0, -0.17, -0.43);
  tray.add(floor);
  for (const x of [-0.42, 0.42]) {
    const side = mesh(new THREE.BoxGeometry(0.03, 0.28, 0.8), trayMat);
    side.position.set(x, -0.04, -0.43);
    tray.add(side);
  }
  const paperMat = mat.light();
  for (let k = 0; k < 7; k++) {
    const sheet = mesh(new THREE.BoxGeometry(0.72, 0.3, 0.012), paperMat);
    sheet.position.set(0, -0.02, -0.15 - k * 0.09);
    sheet.rotation.x = -0.12;
    tray.add(sheet);
  }
  drawer.add(tray);
  const closedZ = drawer.position.z;
  root.rotation.y = 0.35;
  root.position.y = GROUND_Y;
  root.scale.setScalar(1.45);

  return {
    root,
    update(t) {
      const out = keyframes(phase(t), [
        [0, 0],
        [0.15, 0],
        [0.4, 0.62, ease.inOut],
        [0.75, 0.62],
        [0.95, 0, ease.inOut],
        [1, 0],
      ]);
      drawer.position.z = closedZ + out;
    },
  };
}
