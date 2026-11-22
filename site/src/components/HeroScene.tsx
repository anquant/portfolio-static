"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

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

/* ------------------------------------------------------------------------ */
/* Theme                                                                    */
/* ------------------------------------------------------------------------ */

/** Reads an "R G B" token from :root (see globals.css) as a THREE.Color */
function cssColor(name: string, fallback: string) {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
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
/* Motion state (one scene per page, so module-level state is fine)         */
/* ------------------------------------------------------------------------ */

const INTRO_DURATION = 2.6; // seconds
const MAX_DELTA = 1 / 30; // avoid jumps after a hidden tab / dropped frames

/** Raw input, written by DOM listeners */
const input = { x: 0, y: 0, active: false, scroll: 0 };

/** Smoothed values, written once per frame by <Driver/> before anything reads them */
const motion = {
  x: 0,
  y: 0,
  strength: 0,
  energy: 0,
  intro: 0,
  scroll: 0,
  time: 0, // scene clock, frozen with reduced motion
};

const ease = {
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

const prev = { x: 0, y: 0 };

function Driver({ speed }: { speed: number }) {
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

function useInput(target: React.RefObject<HTMLElement | null>) {
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

/* ------------------------------------------------------------------------ */
/* GLSL helpers                                                             */
/* ------------------------------------------------------------------------ */

/* 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT) */
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

/**
 * Shared choreography for point-based shapes:
 *  assemble() — particles fly in from a scattered cloud, staggered,
 *               and blow outwards again as the hero scrolls away.
 */
const choreographyGLSL = /* glsl */ `
uniform float uIntro;
uniform float uScroll;
uniform float uEnergy;
uniform float uPixelRatio;

vec3 hash3(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.xxy + p.yzz) * p.zyx) * 2.0 - 1.0;
}

float easeOutCubic(float t) { return 1.0 - pow(1.0 - t, 3.0); }

/* 0..1 progress of this particle's flight; stagger in 0..1 delays it */
float arrival(float stagger) {
  return easeOutCubic(clamp(uIntro * 1.6 - stagger * 0.6, 0.0, 1.0));
}

vec3 assemble(vec3 p, vec3 seed, float stagger) {
  float k = arrival(stagger);
  vec3 h = hash3(seed);
  vec3 scatter = normalize(h + 0.0001) * (2.4 + hash3(seed * 1.7).x * 1.4);
  vec3 q = mix(scatter, p, k);
  // scroll exit: burst outwards with a little turbulence
  float s = uScroll * uScroll;
  q += normalize(p + 0.0001) * s * 2.4 + hash3(seed * 3.1) * s * 1.2;
  return q;
}

float exitFade() { return 1.0 - smoothstep(0.05, 0.8, uScroll); }
`;

/** Shared soft round sprite for point-based shapes */
const pointFragment = /* glsl */ `
  uniform vec3 uAccent;
  uniform vec3 uAccent2;
  varying float vMix;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, r);
    vec3 color = mix(uAccent, uAccent2, vMix);
    // hot white core on bright points
    color += vec3(1.0) * smoothstep(0.25, 0.0, r) * clamp(vAlpha, 0.0, 1.0) * 0.4;
    gl_FragColor = vec4(color, soft * vAlpha);
  }
`;

function pointUniforms(
  gl: THREE.WebGLRenderer,
  theme: ReturnType<typeof useTheme>
) {
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

function syncChoreography(u: Record<string, THREE.IUniform>) {
  u.uIntro.value = motion.intro;
  u.uScroll.value = motion.scroll;
  u.uEnergy.value = motion.energy;
  u.uTime.value = motion.time;
}

/** Disposes GPU resources when a shape unmounts */
function useDispose(...items: { dispose: () => void }[]) {
  useEffect(
    () => () => items.forEach((i) => i.dispose()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    items
  );
}

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

function WaveField() {
  const theme = useTheme();
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
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
    [gl, theme]
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

  return (
    <points
      ref={points}
      geometry={geometry}
      material={material}
      position={[0, FIELD_Y, 0]}
    />
  );
}

/* ------------------------------------------------------------------------ */
/* Anchor: places the centrepiece inside the visible area (never cropped),  */
/* leans it towards the cursor and lifts it away on scroll (parallax)       */
/* ------------------------------------------------------------------------ */

function Anchor({
  maxExtent,
  popIn,
  children,
}: {
  /** Largest distance of the shape from its centre, in its own units */
  maxExtent: number;
  /** Scale-in with overshoot (for solid shapes that don't assemble from particles) */
  popIn: boolean;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const viewport = useThree((s) => s.viewport);
  const camera = useThree((s) => s.camera);

  const vp = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, 0));
  const landscape = vp.width > vp.height * 1.1;
  const radius = landscape
    ? Math.min(vp.height * 0.32, vp.width * 0.2)
    : Math.min(vp.width * 0.3, vp.height * 0.16);
  const scale = radius / maxExtent;
  const baseX = landscape ? vp.width * 0.24 : vp.width * 0.18;
  const baseY = landscape ? vp.height * 0.02 : -vp.height * 0.26;
  const lift = vp.height * 0.18;

  const placed = useRef(false);

  useFrame((_, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(rawDelta, MAX_DELTA);
    const tx = baseX + motion.x * 0.2;
    const ty =
      baseY +
      motion.y * 0.14 +
      Math.sin(motion.time * 0.6) * 0.05 +
      motion.scroll * lift;
    if (!placed.current) {
      g.position.set(tx, ty, 0);
      placed.current = true;
    }
    g.position.x = THREE.MathUtils.damp(g.position.x, tx, 2.5, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, ty, 2.5, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -motion.y * 0.3, 2.5, dt);
    g.rotation.z = THREE.MathUtils.damp(
      g.rotation.z,
      -motion.x * 0.08,
      2.5,
      dt
    );

    const intro = popIn ? 0.55 + 0.45 * ease.outBack(motion.intro) : 1;
    const exit = 1 - motion.scroll * 0.3;
    g.scale.setScalar(scale * intro * exit);
  });

  return <group ref={group}>{children}</group>;
}

/* ------------------------------------------------------------------------ */
/* Home: morphing blob with theme-coloured iridescent rim                   */
/* ------------------------------------------------------------------------ */

function Blob() {
  const theme = useTheme();
  const mesh = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 28), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uEnergy: { value: 0 },
          uIntro: { value: 0 },
          uBase: { value: theme.surface },
          uBg: { value: theme.bg },
          uAccent: { value: theme.accent },
          uAccent2: { value: theme.accent2 },
        },
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
    [theme]
  );

  useDispose(geometry, material);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const u = (m.material as THREE.ShaderMaterial).uniforms;
    u.uTime.value = motion.time;
    u.uEnergy.value = motion.energy;
    u.uIntro.value = ease.outCubic(motion.intro);
    // spins in during the intro, then turns slowly
    m.rotation.y =
      motion.time * 0.12 + (1 - ease.outCubic(motion.intro)) * -2.2;
  });

  return <mesh ref={mesh} geometry={geometry} material={material} />;
}

/* ------------------------------------------------------------------------ */
/* Design: a circle drawn by a glowing pen, then precessing like a gyroscope */
/* ------------------------------------------------------------------------ */

const TAU = Math.PI * 2;

function Ring() {
  const theme = useTheme();
  const gl = useThree((s) => s.gl);
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
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aAngle", new THREE.Float32BufferAttribute(angle, 1));
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
          uPen: { value: 0 },
          uReveal: { value: 0 },
        },
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
    [gl, theme]
  );

  useDispose(geometry, material);

  useFrame((_, rawDelta) => {
    const p = pts.current;
    const g = group.current;
    if (!p || !g) return;
    const dt = Math.min(rawDelta, MAX_DELTA);
    const u = (p.material as THREE.ShaderMaterial).uniforms;
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

/* ------------------------------------------------------------------------ */
/* Development: a lattice that snaps through 90° turns like a mechanism,    */
/* with scan planes sweeping through it like data being processed           */
/* ------------------------------------------------------------------------ */

const STEP_PERIOD = 4.2; // seconds between turns
const STEP_DURATION = 1.1; // length of one turn

function Lattice() {
  const theme = useTheme();
  const gl = useThree((s) => s.gl);
  const pts = useRef<THREE.Points>(null);
  const scan = useRef(0);

  const geometry = useMemo(() => {
    const n = 11;
    const pos: number[] = [];
    for (let x = 0; x < n; x++)
      for (let y = 0; y < n; y++)
        for (let z = 0; z < n; z++)
          pos.push(
            (x / (n - 1)) * 2 - 1,
            (y / (n - 1)) * 2 - 1,
            (z / (n - 1)) * 2 - 1
          );
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { ...pointUniforms(gl, theme), uScan: { value: 0 } },
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
    [gl, theme]
  );

  useDispose(geometry, material);

  useFrame((_, rawDelta) => {
    const p = pts.current;
    if (!p) return;
    const dt = Math.min(rawDelta, MAX_DELTA);
    const u = (p.material as THREE.ShaderMaterial).uniforms;
    syncChoreography(u);
    scan.current +=
      dt * (0.12 + motion.energy * 0.5) * (motion.time === 0 ? 0 : 1);
    u.uScan.value = scan.current;

    // Mechanical 90° turns, alternating Y and X axes, with a small overshoot.
    // The lattice is symmetric, so every resting pose looks "square".
    const t = motion.time;
    const n = Math.floor(t / STEP_PERIOD);
    const phase = ease.inOutBack(
      Math.min(1, (t - n * STEP_PERIOD) / STEP_DURATION)
    );
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

/* ------------------------------------------------------------------------ */
/* SEO: rays fired from a pulsing core in beats — reach, signal, growth     */
/* ------------------------------------------------------------------------ */

function Burst() {
  const theme = useTheme();
  const gl = useThree((s) => s.gl);
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
      const d = new THREE.Vector3(
        Math.cos(theta) * Math.sin(phi),
        Math.sin(theta) * Math.sin(phi),
        Math.cos(phi)
      );
      const rayRate = 0.7 + rnd() * 0.6;
      for (let i = 0; i < perRay; i++) {
        dir.push(d.x, d.y, d.z);
        offset.push(i / perRay + rnd() * 0.02);
        rate.push(rayRate);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(dir, 3));
    g.setAttribute("aOffset", new THREE.Float32BufferAttribute(offset, 1));
    g.setAttribute("aRate", new THREE.Float32BufferAttribute(rate, 1));
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
    [gl, theme]
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
    [theme]
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
    cu.uGlow.value =
      (0.45 + beat * 0.5 + motion.energy * 0.3) * (1 - motion.scroll);
  });

  return (
    <>
      <mesh ref={core} geometry={coreGeometry} material={coreMaterial} />
      <points ref={pts} geometry={geometry} material={material} />
    </>
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

export type HeroVariant = "blob" | "ring" | "lattice" | "burst";

const centrepieces: Record<
  HeroVariant,
  { maxExtent: number; popIn: boolean; Shape: () => React.JSX.Element }
> = {
  blob: { maxExtent: 1.32, popIn: true, Shape: Blob }, // radius after noise displacement
  ring: { maxExtent: 1.35, popIn: false, Shape: Ring }, // ring + tube + breathing
  lattice: { maxExtent: 1.95, popIn: false, Shape: Lattice }, // cube corner + energy
  burst: { maxExtent: 1.2, popIn: false, Shape: Burst }, // ray length + bend
};

/**
 * Full-bleed interactive background for hero sections (home, services).
 * Client-only (loaded through next/dynamic).
 */
export default function HeroScene({
  variant = "blob",
}: {
  variant?: HeroVariant;
}) {
  const { maxExtent, popIn, Shape } =
    centrepieces[variant] ?? centrepieces.blob;
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [ok] = useState(supportsWebGL);
  const [speed] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1
  );

  useInput(wrapper);

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
      className={`absolute inset-0 transition-opacity duration-500 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 1.4, 6.5], fov: 40 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ camera }) => {
          camera.lookAt(0, -0.2, 0);
          requestAnimationFrame(() => setReady(true));
        }}
        style={{ pointerEvents: "none" }}
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
