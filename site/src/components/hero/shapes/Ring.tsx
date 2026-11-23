import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { noiseGLSL, choreographyGLSL, pointFragment } from '../glsl';
import { pointUniforms, syncChoreography, useDispose, uniformsOf } from '../materials';
import { MAX_DELTA, motion, ease, TAU } from '../motion';
import { useTheme, type Theme } from '../theme';

/* ------------------------------------------------------------------------ */
/* Design: a circle drawn by a glowing pen, then precessing like a gyroscope */
/* ------------------------------------------------------------------------ */

function ringUniforms(gl: THREE.WebGLRenderer, theme: Theme) {
  return {
    ...pointUniforms(gl, theme),
    uPen: { value: 0 },
    uReveal: { value: 0 },
  };
}

type RingUniforms = ReturnType<typeof ringUniforms>;

export function Ring() {
  const theme = useTheme();
  const gl = useThree(s => s.gl);
  const group = useRef<THREE.Group>(null);
  const pts = useRef<THREE.Points>(null);
  const pen = useRef(0);

  const geometry = useMemo(() => {
    const around = 240; // points along the circle
    const across = 16; // points around the tube
    const R = 1;
    const r = 0.22;
    const pos: number[] = [];
    const angle: number[] = [];
    for (let i = 0; i < around; i++) {
      const u = (i / around) * TAU;
      for (let j = 0; j < across; j++) {
        // offset every other ring so points don't line up in stripes
        const v = ((j + (i % 2) * 0.5) / across) * TAU;
        const k = R + r * Math.cos(v);
        pos.push(k * Math.cos(u), k * Math.sin(u), r * Math.sin(v));
        angle.push(u);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aAngle', new THREE.Float32BufferAttribute(angle, 1));

    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: ringUniforms(gl, theme),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          ${noiseGLSL}
          ${choreographyGLSL}
          uniform float uTime;
          uniform float uPen;
          uniform float uReveal;
          attribute float aAngle;
          varying float vMix;
          varying float vAlpha;
          const float TAU = 6.28318530718;
          void main() {
            vec3 p = position;
            // organic breathing + a ripple travelling round the ring when the cursor is fast
            p *= 1.0 + 0.05 * snoise(p * 1.6 + uTime * 0.25)
                     + uEnergy * 0.08 * sin(aAngle * 8.0 - uTime * 7.0);
            // scroll exit: the ring bursts outwards
            float s = uScroll * uScroll;
            p += normalize(position) * s * 2.4 + hash3(position * 9.1) * s * 1.0;

            // the pen head leaves a fading stroke behind it
            float head = mod(uPen, TAU);
            float behind = mod(head - aAngle, TAU) / TAU;
            float stroke = exp(-behind * 5.0);
            float tip = exp(-behind * 60.0);
            // intro: the circle is drawn by the pen, nothing exists ahead of it
            float drawn = 1.0 - smoothstep(uReveal - 0.04, uReveal + 0.04, aAngle);

            vMix = 1.0 - stroke;
            vAlpha = (0.16 + stroke * 0.7 + tip * (0.6 + uEnergy * 0.6)) * drawn * exitFade();
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (2.6 + stroke * 1.6 + tip * (3.0 + uEnergy * 3.0)) * uPixelRatio * (6.0 / -mv.z);
          }
        `,
        fragmentShader: pointFragment,
      }),
    [gl, theme],
  );

  useDispose(geometry, material);

  useFrame((_, rawDelta) => {
    const p = pts.current;
    const g = group.current;
    if (!p || !g) {
      return;
    }
    const dt = Math.min(rawDelta, MAX_DELTA);
    const u = uniformsOf<RingUniforms>(p.material);
    syncChoreography(u);

    if (motion.intro < 1) {
      // intro: one confident stroke drawing the whole circle
      pen.current = ease.inOutCubic(motion.intro) * TAU;
      u.uReveal.value = pen.current;
    } else {
      // afterwards the pen keeps circling; cursor energy speeds it up
      const still = motion.time === 0 ? 0 : 1;
      pen.current += dt * (0.5 + motion.energy * 2.5) * still;
      u.uReveal.value = 100;
    }
    u.uPen.value = pen.current;

    // gyroscope-like precession
    const t = motion.time;
    g.rotation.x = -0.45 + Math.sin(t * 0.4) * 0.12;
    g.rotation.y = 0.3 + Math.cos(t * 0.31) * 0.16;
  });

  return (
    <group ref={group} rotation={[-0.45, 0.3, 0]}>
      <points ref={pts} geometry={geometry} material={material} />
    </group>
  );
}
