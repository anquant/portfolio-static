import * as THREE from "three";

/*
 * Shared building blocks for the work scenes: one material palette and the
 * procedural geometry helpers. Everything is built in code — no model files.
 */

/* ------------------------------------------------------------------------ */
/* Palette                                                                  */
/* ------------------------------------------------------------------------ */

/** Site accent (--accent); set once by the engine before scenes are built */
export const ACCENT = new THREE.Color("#8c9cff");

/** A lighter tint of the accent, for secondary accent parts */
export const accentTint = (amount: number) =>
  ACCENT.clone().lerp(new THREE.Color("#ffffff"), amount);

const standard = (p: THREE.MeshStandardMaterialParameters) =>
  new THREE.MeshStandardMaterial({ metalness: 0, envMapIntensity: 0.5, ...p });

/** Three matte greys + the accent: the whole series uses only these */
export const mat = {
  dark: () => standard({ color: 0x3a3a42, roughness: 0.85 }),
  mid: () => standard({ color: 0x5c5c66, roughness: 0.85 }),
  light: () => standard({ color: 0x8a8a94, roughness: 0.8 }),
  accent: (p: THREE.MeshStandardMaterialParameters = {}) =>
    standard({
      color: ACCENT,
      roughness: 0.45,
      metalness: 0.05,
      emissive: ACCENT,
      emissiveIntensity: 0.08,
      envMapIntensity: 0.8,
      ...p,
    }),
};

export function mesh(geo: THREE.BufferGeometry, m: THREE.Material) {
  const o = new THREE.Mesh(geo, m);
  o.castShadow = true;
  o.receiveShadow = true;
  return o;
}

/* ------------------------------------------------------------------------ */
/* Geometry                                                                 */
/* ------------------------------------------------------------------------ */

export const V = (x: number, y: number, z: number) =>
  new THREE.Vector3(x, y, z);

type Tri = [THREE.Vector3, THREE.Vector3, THREE.Vector3];

/** Non-indexed triangles → flat facets */
export function trianglesGeometry(tris: Tri[]) {
  const pos: number[] = [];
  for (const [a, b, c] of tris)
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/** Flat-faceted convex shape; every face is flipped to point away from `center` */
export function facetGeometry(tris: Tri[], center = new THREE.Vector3()) {
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  const n = new THREE.Vector3();
  const c = new THREE.Vector3();
  return trianglesGeometry(
    tris.map(([a, b, d]) => {
      ab.subVectors(b, a);
      ac.subVectors(d, a);
      n.crossVectors(ab, ac);
      c.copy(a)
        .add(b)
        .add(d)
        .multiplyScalar(1 / 3)
        .sub(center);
      return n.dot(c) < 0 ? [a, d, b] : [a, b, d];
    })
  );
}

/** Turned (lathe) profile given as [radius, height] pairs */
export const lathe = (pts: [number, number][], segments = 72) =>
  new THREE.LatheGeometry(
    pts.map(([r, y]) => new THREE.Vector2(r, y)),
    segments
  );

/** Low-poly rock: an icosahedron with deterministic per-vertex jitter */
export function rockGeometry(r: number, seed: number, sx = 1, sy = 1, sz = 1) {
  const g = new THREE.IcosahedronGeometry(r, 1);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    // hash of the position, so shared corners move together and stay closed
    const h =
      Math.sin(v.x * 12.9898 + v.y * 78.233 + v.z * 37.719 + seed * 4.1) *
      43758.5453;
    const k = 1 + (h - Math.floor(h) - 0.5) * 0.38;
    p.setXYZ(i, v.x * k * sx, v.y * k * sy, v.z * k * sz);
  }
  g.computeVertexNormals();
  return g;
}

/** Brilliant cut: octagonal table, 16-facet girdle, pointed pavilion */
export function diamondGeometry() {
  const ring = (n: number, r: number, y: number, off = 0) =>
    Array.from({ length: n }, (_, i) => {
      const a = ((i + off) / n) * Math.PI * 2;
      return V(Math.cos(a) * r, y, Math.sin(a) * r);
    });
  const table = ring(8, 0.56, 0.42, 0.5);
  const girdle = ring(16, 1.0, 0);
  const top = V(0, 0.42, 0);
  const apex = V(0, -1.05, 0);
  const tris: Tri[] = [];
  for (let i = 0; i < 8; i++) tris.push([top, table[i], table[(i + 1) % 8]]);
  for (let i = 0; i < 8; i++) {
    const t0 = table[i];
    const t1 = table[(i + 1) % 8];
    const g0 = girdle[2 * i];
    const g1 = girdle[2 * i + 1];
    const g2 = girdle[(2 * i + 2) % 16];
    tris.push([t0, g0, g1], [t0, g1, t1], [t1, g1, g2]);
  }
  for (let i = 0; i < 16; i++)
    tris.push([apex, girdle[i], girdle[(i + 1) % 16]]);
  return facetGeometry(tris);
}

/** Classic dart: creased wings with clipped tips over a narrow two-wall keel */
export function paperPlaneGeometry() {
  const nose = V(0, 0, 1.8);
  const R = 0.07;
  const BACK = -1.2;
  const DEPTH = 0.55;
  const tris: Tri[] = [];
  for (const s of [-1, 1]) {
    const root = V(s * R, 0, BACK);
    const crease = V(s * 0.4, 0.2, BACK);
    const tipBack = V(s * 1.02, 0.1, BACK + 0.02);
    const tipFront = V(s * 1.22, 0.12, -0.92);
    const noseSide = V(s * 0.01, 0, 1.75);
    const keelNose = V(s * 0.01, -0.03, 1.35);
    const wallBottom = V(s * R, -DEPTH, BACK);
    tris.push(
      [noseSide, root, crease], // inner strip up to the crease
      [nose, crease, tipBack], // outer wing
      [nose, tipBack, tipFront], // clipped tip
      [noseSide, keelNose, root], // keel wall
      [keelNose, wallBottom, root]
    );
  }
  // fold along the bottom of the keel
  const kL = V(-0.01, -0.03, 1.35);
  const kR = V(0.01, -0.03, 1.35);
  const bL = V(-R, -DEPTH, BACK);
  const bR = V(R, -DEPTH, BACK);
  tris.push([kL, bL, bR], [kL, bR, kR]);
  return trianglesGeometry(tris);
}

/* Voronoi fracture -------------------------------------------------------- */

type Poly = THREE.Vector3[];

/** Clips a convex polyhedron (list of faces) by the half-space n·p ≤ d and caps the cut */
function clipConvex(faces: Poly[], n: THREE.Vector3, d: number) {
  const out: Poly[] = [];
  const cut: THREE.Vector3[] = [];
  for (const f of faces) {
    const poly: Poly = [];
    for (let i = 0; i < f.length; i++) {
      const a = f[i];
      const b = f[(i + 1) % f.length];
      const da = n.dot(a) - d;
      const db = n.dot(b) - d;
      if (da <= 0) poly.push(a);
      if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
        const p = a.clone().lerp(b, da / (da - db));
        poly.push(p);
        cut.push(p);
      }
    }
    if (poly.length >= 3) out.push(poly);
  }
  if (cut.length >= 3) {
    const c = cut
      .reduce((s, p) => s.add(p), new THREE.Vector3())
      .multiplyScalar(1 / cut.length);
    const u = new THREE.Vector3().subVectors(cut[0], c).normalize();
    const w = new THREE.Vector3().crossVectors(n, u);
    const cap: Poly = [];
    for (const p of cut)
      if (!cap.some((q) => q.distanceToSquared(p) < 1e-10)) cap.push(p);
    const angle = (p: THREE.Vector3) => {
      const dp = p.clone().sub(c);
      return Math.atan2(dp.dot(w), dp.dot(u));
    };
    cap.sort((p, q) => angle(p) - angle(q));
    if (cap.length >= 3) out.push(cap);
  }
  return out;
}

/** A cube split into Voronoi cells with uniform cracks; geometry centred on each cell */
export function fracturedCube(
  half: number,
  count: number,
  gap: number,
  seed: number
) {
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const sites = Array.from({ length: count }, () =>
    V((rnd() * 2 - 1) * half, (rnd() * 2 - 1) * half, (rnd() * 2 - 1) * half)
  );
  const C = (x: number, y: number, z: number) =>
    V(x * half, y * half, z * half);
  const box: Poly[] = [
    [C(-1, -1, -1), C(1, -1, -1), C(1, 1, -1), C(-1, 1, -1)],
    [C(-1, -1, 1), C(1, -1, 1), C(1, 1, 1), C(-1, 1, 1)],
    [C(-1, -1, -1), C(-1, 1, -1), C(-1, 1, 1), C(-1, -1, 1)],
    [C(1, -1, -1), C(1, 1, -1), C(1, 1, 1), C(1, -1, 1)],
    [C(-1, -1, -1), C(1, -1, -1), C(1, -1, 1), C(-1, -1, 1)],
    [C(-1, 1, -1), C(1, 1, -1), C(1, 1, 1), C(-1, 1, 1)],
  ];
  const cells: { geometry: THREE.BufferGeometry; center: THREE.Vector3 }[] = [];
  sites.forEach((si, i) => {
    let faces = box.map((f) => f.map((p) => p.clone()));
    sites.forEach((sj, j) => {
      if (i === j || !faces.length) return;
      const n = new THREE.Vector3().subVectors(sj, si).normalize();
      const d = n.dot(si.clone().add(sj).multiplyScalar(0.5)) - gap / 2;
      faces = clipConvex(faces, n, d);
    });
    if (faces.length < 4) return;
    const pts = faces.flat();
    const center = pts
      .reduce((a, p) => a.add(p), new THREE.Vector3())
      .multiplyScalar(1 / pts.length);
    const tris: Tri[] = [];
    for (const f of faces)
      for (let k = 1; k < f.length - 1; k++)
        tris.push([
          f[0].clone().sub(center),
          f[k].clone().sub(center),
          f[k + 1].clone().sub(center),
        ]);
    cells.push({ geometry: facetGeometry(tris), center });
  });
  return cells;
}
