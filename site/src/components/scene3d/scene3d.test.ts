import * as THREE from 'three';
import { describe, expect, it } from 'vitest';

import { SCENE_IDS } from './ids';
import { diamondGeometry, fracturedCube } from './kit';
import { LOOP, keyframes, phase, tri, wave } from './motion';
import { SCENES } from './scenes';

/*
 * Scenes are plain three.js object graphs with pure `update(t)` functions,
 * so they can be checked headless — no WebGL context needed.
 */

/** Signed volume of a closed triangle mesh (divergence theorem). Positive ⇔ faces point outward. */
function signedVolume(geometry: THREE.BufferGeometry) {
  const p = geometry.attributes.position;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  let v = 0;
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i);
    b.fromBufferAttribute(p, i + 1);
    c.fromBufferAttribute(p, i + 2);
    v += a.dot(b.clone().cross(c)) / 6;
  }

  return v;
}

/**
 * Every local transform in the graph, flattened — a fingerprint of the pose.
 * Matrices rather than quaternions: a full turn flips a quaternion's sign
 * (q and -q are the same rotation) but leaves the matrix identical.
 */
function pose(root: THREE.Object3D) {
  const out: number[] = [];
  root.traverse(o => {
    o.updateMatrix();
    out.push(...o.matrix.elements);
  });

  return out;
}

describe('motion', () => {
  it('phase stays in 0..1, also for negative offsets', () => {
    for (const t of [0, 1.3, LOOP, 37.2]) {
      for (const off of [-0.4, 0, 0.7]) {
        const p = phase(t, 1, off);
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThan(1);
      }
    }
  });

  it('wave and phase repeat every LOOP', () => {
    for (const t of [0.4, 2.9, 6.1]) {
      expect(wave(t + LOOP, 2, 0.25)).toBeCloseTo(wave(t, 2, 0.25), 9);
      expect(phase(t + LOOP)).toBeCloseTo(phase(t), 9);
    }
  });

  it('tri peaks in the middle of the phase', () => {
    expect(tri(0)).toBe(0);
    expect(tri(0.5)).toBe(1);
    expect(tri(1)).toBe(0);
  });

  it('keyframes hit their keys and clamp outside them', () => {
    const keys: [number, number][] = [
      [0.2, 1],
      [0.6, 3],
    ];
    expect(keyframes(0, keys)).toBe(1);
    expect(keyframes(0.2, keys)).toBe(1);
    expect(keyframes(0.6, keys)).toBe(3);
    expect(keyframes(0.9, keys)).toBe(3);
    expect(keyframes(0.4, keys)).toBeCloseTo(2, 9); // eased midpoint is still the midpoint
  });
});

describe('geometry', () => {
  it('cuts a cube into closed, outward-facing Voronoi cells that fill it', () => {
    const half = 1;
    const cells = fracturedCube(half, 14, 0.05, 11);
    expect(cells.length).toBeGreaterThan(4);
    let volume = 0;
    for (const { geometry } of cells) {
      const v = signedVolume(geometry);
      expect(v).toBeGreaterThan(0);
      volume += v;
    }
    const cube = (2 * half) ** 3;
    // the cracks remove a thin slab around every cut, nothing else
    expect(volume).toBeLessThan(cube);
    expect(volume).toBeGreaterThan(cube * 0.85);
  });

  it('is deterministic for a seed', () => {
    const a = fracturedCube(1, 10, 0.05, 3).map(c => c.center.toArray());
    const b = fracturedCube(1, 10, 0.05, 3).map(c => c.center.toArray());
    expect(a).toEqual(b);
  });

  it('builds the diamond as a closed solid with outward facets', () => {
    expect(signedVolume(diamondGeometry())).toBeGreaterThan(0);
  });
});

describe.each(SCENE_IDS)('scene %s', id => {
  const scene = SCENES[id]();

  it('builds a non-empty graph', () => {
    let meshes = 0;
    scene.root.traverse(o => {
      if (o instanceof THREE.Mesh) {
        meshes++;
      }
    });
    expect(meshes).toBeGreaterThan(0);
  });

  it('produces finite transforms over a whole loop', () => {
    for (let t = 0; t <= 2 * LOOP; t += 0.37) {
      scene.update(t);
      expect(pose(scene.root).every(Number.isFinite)).toBe(true);
    }
  });

  it('loops seamlessly (pose at t equals pose at t + 2·LOOP)', () => {
    // 2·LOOP covers motions that run at half speed (one turn per 16 s)
    for (const t of [0.5, 3.3, 7.9]) {
      scene.update(t);
      const a = pose(scene.root);
      scene.update(t + 2 * LOOP);
      const b = pose(scene.root);
      b.forEach((x, i) => expect(x).toBeCloseTo(a[i], 6));
    }
  });
});
