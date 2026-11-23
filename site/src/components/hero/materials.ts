import { useEffect } from 'react';
import type * as THREE from 'three';

import { motion } from './motion';
import { type Theme } from './theme';

export function pointUniforms(gl: THREE.WebGLRenderer, theme: Theme) {
  return {
    uTime: { value: 0 },
    uIntro: { value: 0 },
    uScroll: { value: 0 },
    uEnergy: { value: 0 },
    uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
    uAccent: { value: theme.accent },
    uAccent2: { value: theme.accent2 },
  };
}

export type PointUniforms = ReturnType<typeof pointUniforms>;

/**
 * Typed view of a ShaderMaterial's uniforms. three.js types them as a plain
 * string map; each shape builds them with a factory (`blobUniforms`, …) and
 * reads them back with that factory's type. Used inside useFrame on the
 * material reached through a ref — React leaves those objects mutable.
 */
export function uniformsOf<U>(material: THREE.Material | THREE.Material[]): U {
  return (material as THREE.ShaderMaterial).uniforms as unknown as U;
}

export function syncChoreography(u: PointUniforms) {
  u.uIntro.value = motion.intro;
  u.uScroll.value = motion.scroll;
  u.uEnergy.value = motion.energy;
  u.uTime.value = motion.time;
}

/** Disposes GPU resources when a shape unmounts */
export function useDispose(...items: { dispose: () => void }[]) {
  useEffect(
    () => () => items.forEach(i => i.dispose()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    items,
  );
}
