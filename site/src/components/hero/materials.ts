import { useEffect } from "react";
import type * as THREE from "three";
import { type Theme } from "./theme";
import { motion } from "./motion";

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

export function syncChoreography(u: Record<string, THREE.IUniform>) {
  u.uIntro.value = motion.intro;
  u.uScroll.value = motion.scroll;
  u.uEnergy.value = motion.energy;
  u.uTime.value = motion.time;
}

/** Disposes GPU resources when a shape unmounts */
export function useDispose(...items: { dispose: () => void }[]) {
  useEffect(
    () => () => items.forEach((i) => i.dispose()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    items
  );
}
