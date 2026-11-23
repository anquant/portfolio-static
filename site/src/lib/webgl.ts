/*
 * WebGL feature detection shared by both 3D systems (hero, scene3d). Probing
 * a throwaway canvas is silent; letting three.js try and fail would log
 * console errors on every page for browsers without WebGL.
 */

/** Checked once per page load; the probe context is released right away */
let webglSupport: boolean | undefined;

export function supportsWebGL() {
  if (webglSupport !== undefined) {
    return webglSupport;
  }
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
    webglSupport = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webglSupport = false;
  }

  return webglSupport;
}
