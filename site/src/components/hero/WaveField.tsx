import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from './theme';
import { motion } from './motion';
import { noiseGLSL, choreographyGLSL } from './glsl';
import { pointUniforms, syncChoreography, useDispose } from './materials';

/* ------------------------------------------------------------------------ */
/* Wave field: grid of points that ripples and rises under the cursor       */
/* ------------------------------------------------------------------------ */

const FIELD_Y = -1.35;
const FIELD_FAR_Z = -6.5; // furthest row where the cursor hill is still visible
const FIELD_HALF_WIDTH = 12;

// Scratch objects for the per-frame cursor projection
const raycaster = new THREE.Raycaster();
const fieldPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -FIELD_Y);
const hit = new THREE.Vector3();
const ndc = new THREE.Vector2();
const flat = new THREE.Vector3();

export function WaveField() {
  const theme = useTheme();
  const gl = useThree(s => s.gl);
  const camera = useThree(s => s.camera);
  const points = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const cols = 150;
    const rows = 76;
    const width = 26;
    const depth = 14;
    const pos = new Float32Array(cols * rows * 3);
    let k = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        pos[k++] = (c / (cols - 1) - 0.5) * width;
        pos[k++] = 0;
        pos[k++] = (r / (rows - 1) - 0.5) * depth - 2;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          ...pointUniforms(gl, theme),
          uMouse: { value: new THREE.Vector2(999, 999) },
          uMouseStrength: { value: 0 },
          uMuted: { value: theme.muted },
        },
        vertexShader: /* glsl */ `
          ${noiseGLSL}
          ${choreographyGLSL}
          uniform float uTime;
          uniform vec2 uMouse;
          uniform float uMouseStrength;
          varying float vGlow;
          varying float vWave;
          varying float vDepth;
          varying float vIntro;
          void main() {
            vec3 p = position;
            float wave =
              snoise(vec3(p.x * 0.22, p.z * 0.3, uTime * 0.12)) * 0.45 +
              sin(p.x * 0.55 + uTime * 0.5) * 0.12;
            float d = distance(p.xz, uMouse);
            float bump = exp(-d * d * 0.28) * (0.9 + uEnergy * 0.4) * uMouseStrength;
            // intro: the field rises row by row, from the viewer to the horizon
            float rise = arrival(clamp((5.0 - p.z) / 14.0, 0.0, 1.0));
            p.y += (wave + bump) * rise - (1.0 - rise) * 1.2;
            vIntro = rise;
            vGlow = clamp(bump, 0.0, 1.0);
            vWave = wave;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            vDepth = -mv.z;
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (3.2 + vGlow * 1.2) * uPixelRatio * (6.0 / -mv.z);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uMuted;
          uniform vec3 uAccent;
          uniform vec3 uAccent2;
          uniform float uScroll;
          varying float vGlow;
          varying float vWave;
          varying float vDepth;
          varying float vIntro;
          void main() {
            float r = length(gl_PointCoord - 0.5);
            if (r > 0.5) discard;
            float soft = smoothstep(0.5, 0.0, r);
            vec3 hue = mix(uAccent, uAccent2, clamp(vWave + 0.5, 0.0, 1.0));
            vec3 color = mix(uMuted * 0.55, hue, clamp(vGlow * 1.3 + (vWave + 0.3) * 0.5, 0.0, 1.0));
            // fade out towards the horizon and right in front of the camera
            float fade = smoothstep(17.0, 6.0, vDepth) * smoothstep(1.5, 3.5, vDepth);
            fade *= vIntro * (1.0 - uScroll * 0.6);
            gl_FragColor = vec4(color, soft * fade * (0.35 + vGlow * 0.65));
          }
        `,
      }),
    [gl, theme],
  );

  useDispose(geometry, material);

  useFrame(() => {
    if (!points.current) return;
    const u = (points.current.material as THREE.ShaderMaterial).uniforms;
    syncChoreography(u);

    // Project the smoothed cursor onto the field plane. Above the horizon the
    // ray misses the plane and near it the hit races to infinity, so clamp
    // the hit to the far edge of the field along the ray's horizontal direction.
    ndc.set(motion.x, motion.y);
    raycaster.setFromCamera(ndc, camera);
    const { origin, direction } = raycaster.ray;
    const hitPlane = raycaster.ray.intersectPlane(fieldPlane, hit);
    if (!hitPlane || hit.z < FIELD_FAR_Z) {
      flat.set(direction.x, 0, direction.z).normalize();
      const t = (FIELD_FAR_Z - origin.z) / Math.min(flat.z, -1e-3);
      hit.set(origin.x + flat.x * t, FIELD_Y, FIELD_FAR_Z);
    }
    hit.x = THREE.MathUtils.clamp(hit.x, -FIELD_HALF_WIDTH, FIELD_HALF_WIDTH);
    (u.uMouse.value as THREE.Vector2).set(hit.x, hit.z);
    u.uMouseStrength.value = motion.strength;
  });

  return <points ref={points} geometry={geometry} material={material} position={[0, FIELD_Y, 0]} />;
}
