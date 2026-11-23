import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { readRgbToken } from "@/lib/design-tokens";
import type { SceneId } from "./ids";
import { ACCENT } from "./kit";
import { clamp01, ease } from "./motion";
import { SCENES } from "./scenes";
import {
  CAMERA_POSITION,
  CAMERA_TARGET,
  GROUND_Y,
  type SceneDef,
} from "./stage";

/*
 * Renders every 3D scene on the page (work previews, blog covers) with ONE
 * WebGL context.
 *
 * Each card owns a plain 2D <canvas>; a single offscreen WebGLRenderer draws
 * each visible scene in turn and the frame is copied into that card's canvas.
 * This keeps a page with many cards (plus the hero's own WebGL scene) far
 * below browser context limits, and offscreen cards cost nothing.
 *
 * Per view:
 *  - intro   rises, turns and fades in the first time it scrolls into view
 *  - hover   pointer parallax + a gentle dolly-in while its card is hovered
 *  - time    one shared clock, so all scenes keep the same beat
 */

const INTRO = 1.4; // s
const REST_POSE = 1.4; // the still frame shown with reduced motion
const MAX_DPR = 2;

type View = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  stage: THREE.Group;
  work: SceneDef;
  visible: boolean;
  introStart: number | null;
  pointer: { x: number; y: number; tx: number; ty: number };
  hover: number;
  hoverTarget: number;
  cleanup: () => void;
};

let renderer: THREE.WebGLRenderer | null = null;
let environment: THREE.Texture | null = null;
let unavailable = false;
const views = new Set<View>();
let frame = 0;
let last = 0;
const t0 = performance.now() / 1000;

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function getRenderer() {
  if (renderer || unavailable) return renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    unavailable = true;
    return null;
  }
  renderer.setPixelRatio(1); // sizes below are already in device pixels
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0x000000, 0);

  // Lit materials are colour-managed: the CSS (sRGB) accent must be converted,
  // otherwise three.js would read it as linear and wash it out
  const accent = readRgbToken("--accent");
  if (accent) ACCENT.setRGB(...accent, THREE.SRGBColorSpace);

  const pmrem = new THREE.PMREMGenerator(renderer);
  environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return renderer;
}

/** The common stage: camera, key + accent rim light, shadow-catching ground */
function buildStage(work: SceneDef) {
  const scene = new THREE.Scene();
  scene.environment = environment;
  // three ≥ 0.17x RoomEnvironment is much brighter than the one the series was
  // designed on (0.160); 0.25 matches the approved look
  scene.environmentIntensity = 0.25;

  const camera = new THREE.PerspectiveCamera(28, 1.5, 0.1, 100);

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(-4, 8, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 });
  key.shadow.radius = 8;
  key.shadow.bias = -0.0005;
  const rim = new THREE.DirectionalLight(ACCENT, 1.6);
  rim.position.set(3, 3, -6);
  scene.add(key, rim, new THREE.HemisphereLight(0xffffff, 0x101014, 0.35));

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.ShadowMaterial({ opacity: 0.32 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = GROUND_Y;
  ground.receiveShadow = true;
  scene.add(ground);

  const stage = new THREE.Group(); // intro transform wrapper
  stage.add(work.root);
  scene.add(stage);
  return { scene, camera, stage };
}

function dispose(scene: THREE.Scene) {
  scene.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      const m = o.material as THREE.Material | THREE.Material[];
      (Array.isArray(m) ? m : [m]).forEach((x) => x.dispose());
    }
    if (o instanceof THREE.DirectionalLight) o.shadow.map?.dispose();
  });
}

function renderView(
  gl: THREE.WebGLRenderer,
  v: View,
  now: number,
  dt: number,
  t: number
) {
  const { canvas, camera } = v;
  const w = canvas.width;
  const h = canvas.height;
  if (!w || !h) return;
  const size = gl.getSize(new THREE.Vector2());
  if (size.x !== w || size.y !== h) gl.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  const reduce = reducedMotion();
  // intro: rise + settle + fade, same curve as the site's reveal
  const ip =
    reduce || v.introStart === null ? 1 : clamp01((now - v.introStart) / INTRO);
  const e = ease.outQuart(ip);
  v.stage.position.y = -0.5 * (1 - e);
  v.stage.scale.setScalar(0.94 + 0.06 * e);
  v.stage.rotation.y = -0.12 * (1 - e);
  canvas.style.opacity = String(Math.min(1, ip * 1.6));

  // hover: parallax + dolly-in, frame-rate independent smoothing (off with reduced motion)
  const k = 1 - Math.exp(-dt * 5);
  const p = v.pointer;
  p.x += ((reduce ? 0 : p.tx) - p.x) * k;
  p.y += ((reduce ? 0 : p.ty) - p.y) * k;
  v.hover += ((reduce ? 0 : v.hoverTarget) - v.hover) * k;
  const dolly = 1 - 0.05 * ease.inOut(v.hover);
  camera.position.set(
    (CAMERA_POSITION.x + p.x) * dolly,
    (CAMERA_POSITION.y - p.y * 0.7) * dolly,
    CAMERA_POSITION.z * dolly
  );
  camera.lookAt(CAMERA_TARGET);

  v.work.update(reduce ? REST_POSE : t);
  gl.render(v.scene, camera);
  v.ctx.clearRect(0, 0, w, h);
  v.ctx.drawImage(gl.domElement, 0, 0, w, h);
}

function tick() {
  frame = 0;
  const gl = renderer;
  if (!gl) return;
  const now = performance.now() / 1000;
  const dt = Math.min(now - last, 0.05);
  last = now;
  const t = now - t0;
  let any = false;
  for (const v of views) {
    if (!v.visible) continue;
    any = true;
    renderView(gl, v, now, dt, t);
  }
  if (any) frame = requestAnimationFrame(tick);
}

function wake() {
  if (frame || !renderer) return;
  last = performance.now() / 1000;
  frame = requestAnimationFrame(tick);
}

const observer =
  typeof window !== "undefined"
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            for (const v of views) {
              if (v.canvas !== entry.target) continue;
              v.visible = entry.isIntersecting;
              if (v.visible && v.introStart === null)
                v.introStart = performance.now() / 1000;
            }
          }
          wake();
        },
        { threshold: 0.15 }
      )
    : null;

/**
 * Starts rendering `sceneId` into `canvas`. `hoverTarget` is the element whose
 * hover drives the dolly (the whole card); parallax follows the pointer over
 * the canvas itself. Returns a cleanup function, or null without WebGL.
 */
export function mountScene(
  canvas: HTMLCanvasElement,
  sceneId: SceneId,
  hoverTarget: HTMLElement
): (() => void) | null {
  const gl = getRenderer();
  const ctx = canvas.getContext("2d");
  const build = SCENES[sceneId];
  if (!gl || !ctx || !build) return null;

  const work = build();
  const { scene, camera, stage } = buildStage(work);

  const fit = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  };
  fit();
  const resize = new ResizeObserver(() => {
    fit();
    wake();
  });
  resize.observe(canvas);

  const onEnter = () => {
    view.hoverTarget = 1;
  };
  const onLeave = () => {
    view.hoverTarget = 0;
    view.pointer.tx = 0;
    view.pointer.ty = 0;
  };
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    view.pointer.tx = clamp01((e.clientX - r.left) / r.width) - 0.5;
    view.pointer.ty = clamp01((e.clientY - r.top) / r.height) - 0.5;
  };
  hoverTarget.addEventListener("pointerenter", onEnter);
  hoverTarget.addEventListener("pointerleave", onLeave);
  hoverTarget.addEventListener("pointermove", onMove);

  const view: View = {
    canvas,
    ctx,
    scene,
    camera,
    stage,
    work,
    visible: false,
    introStart: null,
    pointer: { x: 0, y: 0, tx: 0, ty: 0 },
    hover: 0,
    hoverTarget: 0,
    cleanup: () => {
      observer?.unobserve(canvas);
      resize.disconnect();
      hoverTarget.removeEventListener("pointerenter", onEnter);
      hoverTarget.removeEventListener("pointerleave", onLeave);
      hoverTarget.removeEventListener("pointermove", onMove);
      dispose(scene);
    },
  };
  views.add(view);
  observer?.observe(canvas);
  canvas.style.opacity = reducedMotion() ? "1" : "0";

  return () => {
    view.cleanup();
    views.delete(view);
  };
}
