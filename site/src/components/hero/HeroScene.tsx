'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState, type JSX } from 'react';

import { Anchor } from './Anchor';
import { Driver, useInput } from './motion';
import { Blob } from './shapes/Blob';
import { Burst } from './shapes/Burst';
import { Lattice } from './shapes/Lattice';
import { Ring } from './shapes/Ring';
import type { HeroSceneId } from './variants';
import { WaveField } from './WaveField';
import { supportsWebGL } from './webgl';

/*
 * Interactive hero background: a cursor-reactive point field plus a
 * centrepiece (blob / ring / lattice / burst).
 *
 * Motion system, shared by every shape:
 *  - intro   0 → 1 over INTRO_DURATION: each shape assembles in its own way
 *  - energy  0 → 1 from cursor speed, fast attack / slow release:
 *            quick mouse moves "charge" the shape, then it calms down
 *  - scroll  0 → 1 while the hero scrolls away: shapes disperse and fade
 *  - pointer smoothed cursor position: lean and the hill in the field
 */

const centrepieces: Record<HeroSceneId, { maxExtent: number; popIn: boolean; Shape: () => JSX.Element }> = {
  blob: { maxExtent: 1.32, popIn: true, Shape: Blob }, // radius after noise displacement
  ring: { maxExtent: 1.35, popIn: false, Shape: Ring }, // ring + tube + breathing
  lattice: { maxExtent: 1.95, popIn: false, Shape: Lattice }, // cube corner + energy
  burst: { maxExtent: 1.2, popIn: false, Shape: Burst }, // ray length + bend
};

/**
 * Full-bleed interactive background for hero sections (home, services).
 * Client-only (loaded through next/dynamic).
 */
export default function HeroScene({ variant = 'blob' }: { variant?: HeroSceneId }) {
  const { maxExtent, popIn, Shape } = centrepieces[variant] ?? centrepieces.blob;
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [ok] = useState(supportsWebGL);
  const [speed] = useState(() => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1));

  useInput(wrapper);

  // Stop rendering when the hero is scrolled out of view
  useEffect(() => {
    const el = wrapper.current;
    if (!el) {
      return;
    }
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);

    return () => io.disconnect();
  }, []);

  if (!ok) {
    return null;
  }

  return (
    <div
      ref={wrapper}
      aria-hidden
      className={`absolute inset-0 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
    >
      <Canvas
        dpr={[1, 1.5]}
        // reduced motion: a still picture, redrawn only on resize
        frameloop={speed === 0 ? 'demand' : visible ? 'always' : 'never'}
        camera={{ position: [0, 1.4, 6.5], fov: 40 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ camera }) => {
          camera.lookAt(0, -0.2, 0);
          requestAnimationFrame(() => setReady(true));
        }}
        style={{ pointerEvents: 'none' }}
      >
        <Driver speed={speed} />
        <WaveField />
        <Anchor maxExtent={maxExtent} popIn={popIn}>
          <Shape />
        </Anchor>
      </Canvas>
    </div>
  );
}
