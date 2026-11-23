import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { noiseGLSL, choreographyGLSL, pointFragment } from '../glsl';
import { pointUniforms, syncChoreography, useDispose, uniformsOf } from '../materials';
import { MAX_DELTA, motion, ease } from '../motion';
import { useTheme, type Theme } from '../theme';

/* ------------------------------------------------------------------------ */
/* Development: a lattice that snaps through 90° turns like a mechanism,    */
/* with scan planes sweeping through it like data being processed           */
/* ------------------------------------------------------------------------ */

const STEP_PERIOD = 4.2; // seconds between turns
const STEP_DURATION = 1.1; // length of one turn

function latticeUniforms(gl: THREE.WebGLRenderer, theme: Theme) {
  return { ...pointUniforms(gl, theme), uScan: { value: 0 } };
}

type LatticeUniforms = ReturnType<typeof latticeUniforms>;

export function Lattice() {
  const theme = useTheme();
  const gl = useThree(s => s.gl);
  const pts = useRef<THREE.Points>(null);
  const scan = useRef(0);

  const geometry = useMemo(() => {
    const n = 11;
    const pos: number[] = [];
    for (let x = 0; x < n; x++) {
      for (let y = 0; y < n; y++) {
        for (let z = 0; z < n; z++) {
          pos.push((x / (n - 1)) * 2 - 1, (y / (n - 1)) * 2 - 1, (z / (n - 1)) * 2 - 1);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));

    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: latticeUniforms(gl, theme),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          ${noiseGLSL}
          ${choreographyGLSL}
          uniform float uTime;
          uniform float uScan;
          varying float vMix;
          varying float vAlpha;
          void main() {
            vec3 p = position;
            // breathing; fast cursor moves push the grid apart
            p += (0.05 + uEnergy * 0.12) * vec3(
              snoise(p * 0.9 + uTime * 0.2),
              snoise(p * 0.9 + 11.0 + uTime * 0.2),
              snoise(p * 0.9 + 23.0 + uTime * 0.2)
            );
            p *= 1.0 + uEnergy * 0.1;
            // intro: assembles from the centre outwards
            p = assemble(p, position * 5.3, length(position) / 1.732);

            float s1 = exp(-pow((position.y - (fract(uScan) * 2.6 - 1.3)) * 5.0, 2.0));
            float s2 = exp(-pow((position.x + position.z) * 0.7 - (fract(uScan * 0.66 + 0.5) * 3.6 - 1.8), 2.0) * 18.0);
            float pulse = max(s1, s2);
            vMix = clamp(s2 * 1.2, 0.0, 1.0);

            float edge = smoothstep(0.6, 1.0, max(max(abs(position.x), abs(position.y)), abs(position.z)));
            float k = arrival(length(position) / 1.732);
            vAlpha = (0.18 + edge * 0.22 + pulse * 0.9) * (0.3 + 0.7 * k) * exitFade();
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (2.6 + pulse * 3.0) * uPixelRatio * (6.0 / -mv.z);
          }
        `,
        fragmentShader: pointFragment,
      }),
    [gl, theme],
  );

  useDispose(geometry, material);

  useFrame((_, rawDelta) => {
    const p = pts.current;
    if (!p) {
      return;
    }
    const dt = Math.min(rawDelta, MAX_DELTA);
    const u = uniformsOf<LatticeUniforms>(p.material);
    syncChoreography(u);
    scan.current += dt * (0.12 + motion.energy * 0.5) * (motion.time === 0 ? 0 : 1);
    u.uScan.value = scan.current;

    // Mechanical 90° turns, alternating Y and X axes, with a small overshoot.
    // The lattice is symmetric, so every resting pose looks "square".
    const t = motion.time;
    const n = Math.floor(t / STEP_PERIOD);
    const phase = ease.inOutBack(Math.min(1, (t - n * STEP_PERIOD) / STEP_DURATION));
    const yTurns = Math.ceil(n / 2) + (n % 2 === 0 ? phase : 0);
    const xTurns = Math.floor(n / 2) + (n % 2 === 1 ? phase : 0);
    p.rotation.set(xTurns * (Math.PI / 2), yTurns * (Math.PI / 2), 0);
  });

  // tilted so three faces read at once, like an isometric cube
  return (
    <group rotation={[0.5, 0.6, 0]}>
      <points ref={pts} geometry={geometry} material={material} />
    </group>
  );
}
