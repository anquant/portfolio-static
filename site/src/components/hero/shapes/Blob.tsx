import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { noiseGLSL } from '../glsl';
import { useDispose, uniformsOf } from '../materials';
import { motion, ease } from '../motion';
import { useTheme, type Theme } from '../theme';

/* ------------------------------------------------------------------------ */
/* Home: morphing blob with theme-coloured iridescent rim                   */
/* ------------------------------------------------------------------------ */

function blobUniforms(theme: Theme) {
  return {
    uTime: { value: 0 },
    uEnergy: { value: 0 },
    uIntro: { value: 0 },
    uBase: { value: theme.surface },
    uBg: { value: theme.bg },
    uAccent: { value: theme.accent },
    uAccent2: { value: theme.accent2 },
  };
}

type BlobUniforms = ReturnType<typeof blobUniforms>;

export function Blob() {
  const theme = useTheme();
  const mesh = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 28), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: blobUniforms(theme),
        vertexShader: /* glsl */ `
          ${noiseGLSL}
          uniform float uTime;
          uniform float uEnergy;
          uniform float uIntro;
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          varying float vNoise;
          vec3 displace(vec3 p) {
            // starts "molten" and settles during the intro; cursor energy stirs it
            float amp = 1.0 + uEnergy * 0.7 + (1.0 - uIntro) * 1.2;
            float n = snoise(p * 1.1 + uTime * 0.22) * 0.22
                    + snoise(p * 2.4 - uTime * 0.16) * 0.07;
            return p * (1.0 + n * amp);
          }
          void main() {
            vec3 p = displace(position);
            vec3 helper = abs(normal.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
            vec3 t = normalize(cross(normal, helper));
            vec3 b = cross(normal, t);
            vec3 p1 = displace(normalize(position + t * 0.01));
            vec3 p2 = displace(normalize(position + b * 0.01));
            vec3 n = normalize(cross(p1 - p, p2 - p));
            if (dot(n, p) < 0.0) n = -n;
            vNoise = length(p) - 1.0;
            vNormal = normalize(mat3(modelMatrix) * n);
            vec4 world = modelMatrix * vec4(p, 1.0);
            vWorldPos = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uEnergy;
          uniform vec3 uBase;
          uniform vec3 uBg;
          uniform vec3 uAccent;
          uniform vec3 uAccent2;
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          varying float vNoise;
          void main() {
            vec3 N = normalize(vNormal);
            vec3 V = normalize(cameraPosition - vWorldPos);
            vec3 L = normalize(vec3(-0.6, 0.9, 0.7));
            float diff = max(dot(N, L), 0.0);
            float spec = pow(max(dot(reflect(-L, N), V), 0.0), 48.0);
            float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.2);
            float shift = 0.5 + 0.5 * sin(vNoise * 9.0 + uTime * 0.4 + N.y * 2.0);
            vec3 hue = mix(uAccent, uAccent2, shift);
            vec3 color = mix(uBg, uBase, 0.35 + 0.65 * diff);
            color += hue * fresnel * (1.4 + uEnergy * 0.8);
            color += hue * smoothstep(0.05, 0.25, vNoise) * 0.25;
            color += vec3(spec) * 0.55;
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      }),
    [theme],
  );

  useDispose(geometry, material);

  useFrame(() => {
    const m = mesh.current;
    if (!m) {
      return;
    }
    const u = uniformsOf<BlobUniforms>(m.material);
    u.uTime.value = motion.time;
    u.uEnergy.value = motion.energy;
    u.uIntro.value = ease.outCubic(motion.intro);
    // spins in during the intro, then turns slowly
    m.rotation.y = motion.time * 0.12 + (1 - ease.outCubic(motion.intro)) * -2.2;
  });

  return <mesh ref={mesh} geometry={geometry} material={material} />;
}
