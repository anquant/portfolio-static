import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three';

import { MAX_DELTA, motion, ease } from './motion';

/* ------------------------------------------------------------------------ */
/* Anchor: places the centrepiece inside the visible area (never cropped),  */
/* leans it towards the cursor and lifts it away on scroll (parallax)       */
/* ------------------------------------------------------------------------ */

export function Anchor({
  maxExtent,
  popIn,
  children,
}: {
  /** Largest distance of the shape from its centre, in its own units */
  maxExtent: number;
  /** Scale-in with overshoot (for solid shapes that don't assemble from particles) */
  popIn: boolean;
  children: ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const viewport = useThree(s => s.viewport);
  const camera = useThree(s => s.camera);

  const vp = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, 0));
  const landscape = vp.width > vp.height * 1.1;
  const radius = landscape ? Math.min(vp.height * 0.32, vp.width * 0.2) : Math.min(vp.width * 0.3, vp.height * 0.16);
  const scale = radius / maxExtent;
  const baseX = landscape ? vp.width * 0.24 : vp.width * 0.18;
  const baseY = landscape ? vp.height * 0.02 : -vp.height * 0.26;
  const lift = vp.height * 0.18;

  const placed = useRef(false);

  useFrame((_, rawDelta) => {
    const g = group.current;
    if (!g) {
      return;
    }
    const dt = Math.min(rawDelta, MAX_DELTA);
    const tx = baseX + motion.x * 0.2;
    const ty = baseY + motion.y * 0.14 + Math.sin(motion.time * 0.6) * 0.05 + motion.scroll * lift;
    if (!placed.current) {
      g.position.set(tx, ty, 0);
      placed.current = true;
    }
    g.position.x = THREE.MathUtils.damp(g.position.x, tx, 2.5, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, ty, 2.5, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -motion.y * 0.3, 2.5, dt);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, -motion.x * 0.08, 2.5, dt);

    const intro = popIn ? 0.55 + 0.45 * ease.outBack(motion.intro) : 1;
    const exit = 1 - motion.scroll * 0.3;
    g.scale.setScalar(scale * intro * exit);
  });

  return <group ref={group}>{children}</group>;
}
