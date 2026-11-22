"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ------------------------------------------------------------------------ */
/* Theme                                                                    */
/* ------------------------------------------------------------------------ */

/** Reads an "R G B" token from :root (see globals.css) as a THREE.Color */
function cssColor(name: string, fallback: string) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const parts = raw.split(/\s+/).map(Number);
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    return new THREE.Color(parts[0] / 255, parts[1] / 255, parts[2] / 255);
  }
  return new THREE.Color(fallback);
}

function useTheme() {
  return useMemo(
    () => ({
      bg: cssColor("--bg", "#0c0c0e"),
      surface: cssColor("--surface-2", "#1e1e23"),
      muted: cssColor("--muted", "#a1a1aa"),
      accent: cssColor("--accent", "#8c9cff"),
      // Secondary hue derived from the accent: shifted towards magenta
      accent2: cssColor("--accent", "#8c9cff").offsetHSL(0.14, 0.1, 0.02),
    }),
    []
  );
}

/* ------------------------------------------------------------------------ */
/* Pointer: tracked on window, because the canvas sits under the content    */
/* ------------------------------------------------------------------------ */

const pointer = { x: 0, y: 0, active: false };

/**
 * Smoothed pointer, updated once per frame before anything reads it.
 * Exponential damping is frame-rate independent, so motion feels the same
 * at 60 and 120 Hz, and every consumer follows the cursor in sync.
 */
const smooth = { x: 0, y: 0, strength: 0 };
const MAX_DELTA = 1 / 30; // avoid jumps after a hidden tab / dropped frames

function PointerSmoother() {
  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, MAX_DELTA);
    smooth.x = THREE.MathUtils.damp(smooth.x, pointer.x, 4, dt);
    smooth.y = THREE.MathUtils.damp(smooth.y, pointer.y, 4, dt);
    smooth.strength = THREE.MathUtils.damp(smooth.strength, pointer.active ? 1 : 0, 2.5, dt);
  });
  return null;
}

function usePointer(target: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = target.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      pointer.active = e.clientY >= r.top && e.clientY <= r.bottom;
    };
    const onLeave = () => (pointer.active = false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [target]);
}

/* ------------------------------------------------------------------------ */
/* GLSL: 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT)             */
/* ------------------------------------------------------------------------ */

const noiseGLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

/* ------------------------------------------------------------------------ */
/* Wave field: grid of points that ripples and rises under the cursor       */
/* ------------------------------------------------------------------------ */

const FIELD_Y = -1.35;
const FIELD_FAR_Z = -6.5; // furthest row where the cursor hill is still visible
const FIELD_HALF_WIDTH = 12;

// Scratch objects for the per-frame cursor projection (one scene per page)
const raycaster = new THREE.Raycaster();
const fieldPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -FIELD_Y);
const hit = new THREE.Vector3();
const ndc = new THREE.Vector2();
const flat = new THREE.Vector3();

function WaveField({ speed }: { speed: number }) {
  const theme = useTheme();
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);

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
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(999, 999) },
          uMouseStrength: { value: 0 },
          uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
          uMuted: { value: theme.muted },
          uAccent: { value: theme.accent },
          uAccent2: { value: theme.accent2 },
        },
        vertexShader: /* glsl */ `
          ${noiseGLSL}
          uniform float uTime;
          uniform vec2 uMouse;
          uniform float uMouseStrength;
          uniform float uPixelRatio;
          varying float vGlow;
          varying float vWave;
          varying float vDepth;
          void main() {
            vec3 p = position;
            float wave =
              snoise(vec3(p.x * 0.22, p.z * 0.3, uTime * 0.12)) * 0.45 +
              sin(p.x * 0.55 + uTime * 0.5) * 0.12;
            float d = distance(p.xz, uMouse);
            // smooth, wide hill under the cursor (no ripple: it flickers while moving)
            float bump = exp(-d * d * 0.28) * 0.9 * uMouseStrength;
            p.y += wave + bump;
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
          varying float vGlow;
          varying float vWave;
          varying float vDepth;
          void main() {
            float r = length(gl_PointCoord - 0.5);
            if (r > 0.5) discard;
            float soft = smoothstep(0.5, 0.0, r);
            vec3 hue = mix(uAccent, uAccent2, clamp(vWave + 0.5, 0.0, 1.0));
            vec3 color = mix(uMuted * 0.55, hue, clamp(vGlow * 1.3 + (vWave + 0.3) * 0.5, 0.0, 1.0));
            // fade out towards the horizon and right in front of the camera
            float fade = smoothstep(17.0, 6.0, vDepth) * smoothstep(1.5, 3.5, vDepth);
            gl_FragColor = vec4(color, soft * fade * (0.35 + vGlow * 0.65));
          }
        `,
      }),
    [gl, theme]
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  const points = useRef<THREE.Points>(null);

  useFrame((_, rawDelta) => {
    if (!points.current) return;
    const dt = Math.min(rawDelta, MAX_DELTA);
    const u = (points.current.material as THREE.ShaderMaterial).uniforms;
    u.uTime.value += dt * speed;

    // Project the (already smoothed) cursor onto the field plane.
    // Above the horizon the ray misses the plane, and close to it the hit point
    // races off to infinity — both made the hill jump. Instead, clamp the hit
    // to the far edge of the field along the ray's horizontal direction.
    ndc.set(smooth.x, smooth.y);
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
    u.uMouseStrength.value = smooth.strength;
  });

  return <points ref={points} geometry={geometry} material={material} position={[0, FIELD_Y, 0]} />;
}

/* ------------------------------------------------------------------------ */
/* Morphing blob with theme-coloured iridescent rim                         */
/* ------------------------------------------------------------------------ */

function Blob({ speed }: { speed: number }) {
  const theme = useTheme();
  const mesh = useRef<THREE.Mesh>(null);
  const viewport = useThree((s) => s.viewport);
  const camera = useThree((s) => s.camera);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 28), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uBase: { value: theme.surface },
          uBg: { value: theme.bg },
          uAccent: { value: theme.accent },
          uAccent2: { value: theme.accent2 },
        },
        vertexShader: /* glsl */ `
          ${noiseGLSL}
          uniform float uTime;
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          varying float vNoise;
          vec3 displace(vec3 p) {
            float n = snoise(p * 1.1 + uTime * 0.22) * 0.22
                    + snoise(p * 2.4 - uTime * 0.16) * 0.07;
            return p * (1.0 + n);
          }
          void main() {
            vec3 p = displace(position);
            // normal from neighbouring displaced points
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
            color += hue * fresnel * 1.4;
            color += hue * smoothstep(0.05, 0.25, vNoise) * 0.25;
            color += vec3(spec) * 0.55;
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      }),
    [theme]
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  // Placement and size are derived from the visible area, so the shape is never cropped
  const vp = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, 0));
  const landscape = vp.width > vp.height * 1.1;
  const maxExtent = 1.32; // max radius after displacement
  const radius = landscape
    ? Math.min(vp.height * 0.32, vp.width * 0.2)
    : Math.min(vp.width * 0.3, vp.height * 0.16);
  const scale = radius / maxExtent;
  const baseX = landscape ? vp.width * 0.24 : vp.width * 0.18;
  const baseY = landscape ? vp.height * 0.02 : -vp.height * 0.26;

  const placed = useRef(false);

  useFrame((state, rawDelta) => {
    const m = mesh.current;
    if (!m) return;
    const dt = Math.min(rawDelta, MAX_DELTA);
    (m.material as THREE.ShaderMaterial).uniforms.uTime.value += dt * speed;
    m.rotation.y += dt * 0.12 * speed;

    const tx = baseX + smooth.x * 0.2;
    const ty =
      baseY + smooth.y * 0.14 + Math.sin(state.clock.elapsedTime * 0.6) * 0.05 * speed;
    if (!placed.current) {
      m.position.set(tx, ty, 0);
      placed.current = true;
    }
    // gentle lean towards the cursor
    m.position.x = THREE.MathUtils.damp(m.position.x, tx, 2.5, dt);
    m.position.y = THREE.MathUtils.damp(m.position.y, ty, 2.5, dt);
    m.rotation.x = THREE.MathUtils.damp(m.rotation.x, -smooth.y * 0.3, 2.5, dt);
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      material={material}
      scale={scale}
    />
  );
}

/* ------------------------------------------------------------------------ */

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Full-bleed interactive background for the home hero.
 * Client-only (loaded through next/dynamic); fades in after the first frame.
 */
export default function HeroScene() {
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [ok] = useState(supportsWebGL);
  const [speed] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1
  );

  usePointer(wrapper);

  // Stop rendering when the hero is scrolled out of view
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!ok) return null;

  return (
    <div
      ref={wrapper}
      aria-hidden
      className={`absolute inset-0 transition-opacity duration-[1500ms] ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 1.4, 6.5], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ camera }) => {
          camera.lookAt(0, -0.2, 0);
          requestAnimationFrame(() => setReady(true));
        }}
        style={{ pointerEvents: "none" }}
      >
        <PointerSmoother />
        <WaveField speed={speed} />
        <Blob speed={speed} />
      </Canvas>
    </div>
  );
}
