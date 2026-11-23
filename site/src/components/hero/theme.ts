import { useMemo } from "react";
import * as THREE from "three";
import { readRgbToken, type Rgb } from "@/lib/design-tokens";

/**
 * Reads a colour token for the hero's shaders. The sRGB components go in
 * as-is: these ShaderMaterials do no colour management, so the value the
 * shader sees is the value the screen shows.
 */
function cssColor(name: string, fallback: Rgb) {
  return new THREE.Color(...(readRgbToken(name) ?? fallback));
}

export function useTheme() {
  return useMemo(
    () => ({
      bg: cssColor("--bg", [12 / 255, 12 / 255, 14 / 255]),
      surface: cssColor("--surface-2", [30 / 255, 30 / 255, 35 / 255]),
      muted: cssColor("--muted", [161 / 255, 161 / 255, 170 / 255]),
      accent: cssColor("--accent", [140 / 255, 156 / 255, 255 / 255]),
      // Secondary hue derived from the accent: shifted towards magenta
      accent2: cssColor("--accent", [
        140 / 255,
        156 / 255,
        255 / 255,
      ]).offsetHSL(0.14, 0.1, 0.02),
    }),
    []
  );
}

export type Theme = ReturnType<typeof useTheme>;
