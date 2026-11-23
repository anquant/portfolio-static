import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../theme';
import { MAX_DELTA, motion, ease } from '../motion';
import { noiseGLSL, choreographyGLSL, pointFragment } from '../glsl';
import { pointUniforms, syncChoreography, useDispose } from '../materials';

/* ------------------------------------------------------------------------ */
/* SEO: rays fired from a pulsing core in beats — reach, signal, growth     */
/* ------------------------------------------------------------------------ */

export function Burst() {
  const theme = useTheme();
  const gl = useThree(s => s.gl);
  const pts = useRef<THREE.Points>(null);
  const core = useRef<THREE.Mesh>(null);
  const phase = useRef(0);

  const geometry = useMemo(() => {
    const rays = 220;
    const perRay = 26;
    const dir: number[] = [];
    const offset: number[] = [];
    const rate: number[] = [];
    // deterministic pseudo-random so the shape is stable between renders
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    for (let r = 0; r < rays; r++) {
      // Fibonacci sphere: evenly spread ray directions
      const k = r + 0.5;
      const phi = Math.acos(1 - (2 * k) / rays);
      const theta = Math.PI * (1 + Math.sqrt(5)) * k;
      const d = new THREE.Vector3(Math.cos(theta) * Math.sin(phi), Math.sin(theta) * Math.sin(phi), Math.cos(phi));
      const rayRate = 0.7 + rnd() * 0.6;
      for (let i = 0; i < perRay; i++) {
        dir.push(d.x, d.y, d.z);
        offset.push(i / perRay + rnd() * 0.02);
        rate.push(rayRate);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(dir, 3));
    g.setAttribute('aOffset', new THREE.Float32BufferAttribute(offset, 1));
    g.setAttribute('aRate', new THREE.Float32BufferAttribute(rate, 1));
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { ...pointUniforms(gl, theme), uPhase: { value: 0 } },
        vertexShader: /* glsl */ `
          ${noiseGLSL}
          ${choreographyGLSL}
          uniform float uTime;
          uniform float uPhase;
          attribute float aOffset;
          attribute float aRate;
          varying float vMix;
          varying float vAlpha;
          void main() {
            vec3 d = normalize(position);
            // each particle travels outwards along its ray and loops
            float t = fract(aOffset + uPhase * aRate);
            // intro: rays shoot out from the core to full length
            float reach = easeOutCubic(clamp(uIntro * 1.3, 0.0, 1.0));
            float r = (0.12 + pow(t, 0.8) * 0.95) * reach;
            vec3 bend = (0.08 + uEnergy * 0.1) * t * vec3(
              snoise(d * 2.0 + uTime * 0.15),
              snoise(d * 2.0 + 7.0 + uTime * 0.15),
              snoise(d * 2.0 + 13.0 + uTime * 0.15)
            );
            vec3 p = d * r + bend;
            float s = uScroll * uScroll;
            p += d * s * 2.6 + hash3(position * 7.7 + aOffset) * s * 0.8;
            vMix = t;
            vAlpha = smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.55, 1.0, t))
                   * (0.85 + uEnergy * 0.4) * exitFade();
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (3.4 * (1.0 - t * 0.6)) * uPixelRatio * (6.0 / -mv.z);
          }
        `,
        fragmentShader: pointFragment,
      }),
    [gl, theme],
  );

  // Glowing core: camera-facing quad with a radial falloff
  const coreGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const coreMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uSize: { value: 0.6 },
          uGlow: { value: 0.5 },
          uAccent: { value: theme.accent },
          uAccent2: { value: theme.accent2 },
        },
        vertexShader: /* glsl */ `
          uniform float uSize;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            mv.xy += position.xy * uSize;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uGlow;
          uniform vec3 uAccent;
          uniform vec3 uAccent2;
          varying vec2 vUv;
          void main() {
            float r = length(vUv - 0.5) * 2.0;
            float g = exp(-r * r * 6.0);
            float hot = exp(-r * r * 40.0);
            vec3 color = mix(uAccent2, uAccent, r) * g + vec3(1.0) * hot * 0.8;
            gl_FragColor = vec4(color, (g * 0.8 + hot) * uGlow);
          }
        `,
      }),
    [theme],
  );

  useDispose(geometry, material, coreGeometry, coreMaterial);

  useFrame((_, rawDelta) => {
    const p = pts.current;
    const c = core.current;
    if (!p || !c) return;
    const dt = Math.min(rawDelta, MAX_DELTA);
    const u = (p.material as THREE.ShaderMaterial).uniforms;
    syncChoreography(u);

    // Emission in beats: a calm drift, then a sharp push every ~4.8 s
    const t = motion.time;
    const beat = Math.pow(Math.max(0, Math.sin(t * 1.3)), 10);
    const moving = t === 0 ? 0 : 1;
    phase.current += dt * (0.05 + beat * 0.32 + motion.energy * 0.35) * moving;
    u.uPhase.value = phase.current;

    p.rotation.y = t * 0.06;
    p.rotation.x = t * 0.025;

    const cu = (c.material as THREE.ShaderMaterial).uniforms;
    const appear = ease.outBack(Math.min(1, motion.intro * 1.6));
    cu.uSize.value = (0.55 + beat * 0.35 + motion.energy * 0.25) * appear;
    cu.uGlow.value = (0.45 + beat * 0.5 + motion.energy * 0.3) * (1 - motion.scroll);
  });

  return (
    <>
      <mesh ref={core} geometry={coreGeometry} material={coreMaterial} />
      <points ref={pts} geometry={geometry} material={material} />
    </>
  );
}
