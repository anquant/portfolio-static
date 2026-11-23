import { useMemo } from "react";
import * as THREE from "three";

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

export function useTheme() {
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

export type Theme = ReturnType<typeof useTheme>;
