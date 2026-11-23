import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ------------------------------------------------------------------------ */
/* Motion state (one scene per page, so module-level state is fine)         */
/* ------------------------------------------------------------------------ */

export const INTRO_DURATION = 2.6; // seconds
export const MAX_DELTA = 1 / 30; // avoid jumps after a hidden tab / dropped frames

/** Raw input, written by DOM listeners */
export const input = { x: 0, y: 0, active: false, scroll: 0 };

/** Smoothed values, written once per frame by <Driver/> before anything reads them */
export const motion = {
  x: 0,
  y: 0,
  strength: 0,
  energy: 0,
  intro: 0,
  scroll: 0,
  time: 0, // scene clock, frozen with reduced motion
};

export const ease = {
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  outBack: (t: number, s = 1.4) =>
    1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  inOutBack: (t: number, s = 1.2) => {
    const c = s * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c + 1) * 2 * t - c)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c + 1) * (t * 2 - 2) + c) + 2) / 2;
  },
};

export const TAU = Math.PI * 2;

const prev = { x: 0, y: 0 };

export function Driver({ speed }: { speed: number }) {
  useEffect(() => {
    // restart the intro on every mount (client-side navigation between pages)
    motion.intro = speed === 0 ? 1 : 0;
    motion.energy = 0;
    motion.time = 0;
  }, [speed]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, MAX_DELTA);
    const d = THREE.MathUtils.damp;

    motion.time += dt * speed;
    motion.intro = Math.min(
      1,
      motion.intro + (dt / INTRO_DURATION) * (speed || 1e9)
    );

    motion.x = d(motion.x, input.x, 4, dt);
    motion.y = d(motion.y, input.y, 4, dt);
    motion.strength = d(motion.strength, input.active ? 1 : 0, 2.5, dt);
    motion.scroll = d(motion.scroll, input.scroll, 6, dt);

    // Energy from cursor speed (screen heights per second): fast attack, slow release
    const v =
      Math.hypot(input.x - prev.x, input.y - prev.y) / Math.max(dt, 1e-3);
    prev.x = input.x;
    prev.y = input.y;
    const target = THREE.MathUtils.clamp(v / 4, 0, 1) * (input.active ? 1 : 0);
    motion.energy = d(
      motion.energy,
      target,
      target > motion.energy ? 5 : 1.2,
      dt
    );
  });
  return null;
}

export function useInput(target: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = target.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      input.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      input.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      input.active = e.clientY >= r.top && e.clientY <= r.bottom;
    };
    const onLeave = () => (input.active = false);
    const onScroll = () => {
      const el = target.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      input.scroll = THREE.MathUtils.clamp(
        -r.top / Math.max(r.height, 1),
        0,
        1
      );
    };
    onScroll();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [target]);
}
