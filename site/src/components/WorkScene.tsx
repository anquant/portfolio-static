"use client";

import { useEffect, useRef } from "react";
import type { WorkSceneId } from "./work-scene/ids";

type WorkSceneProps = {
  scene: WorkSceneId;
  /** Accessible label (the project title) */
  label: string;
  /** Frame proportions, as Tailwind aspect classes */
  aspectClassName?: string;
  /** "card": the glow lights up on parent `.group` hover */
  mode?: "card" | "hero";
  className?: string;
};

/**
 * Animated 3D preview of a project on the same dark stage as the rest of the
 * project media. three.js is only downloaded when the frame approaches the
 * viewport; without WebGL the empty stage stays as a quiet placeholder.
 */
export default function WorkScene({
  scene,
  label,
  aspectClassName = "aspect-[3/2]",
  mode = "card",
  className = "",
}: WorkSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let unmount: (() => void) | null = null;

    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        import("./work-scene/engine").then(({ mountWorkScene }) => {
          if (cancelled) return;
          const hoverTarget =
            canvas.closest<HTMLElement>(".group") ?? canvas.parentElement!;
          unmount = mountWorkScene(canvas, scene, hoverTarget);
        });
      },
      { rootMargin: "600px 0px" }
    );
    near.observe(canvas);

    return () => {
      cancelled = true;
      near.disconnect();
      unmount?.();
    };
  }, [scene]);

  const card = mode === "card";

  return (
    <div
      role="img"
      aria-label={label}
      className={`relative isolate overflow-hidden rounded-2xl md:rounded-3xl border border-line ${aspectClassName} ${className}`}
      style={{
        background:
          "color-mix(in srgb, rgb(var(--accent)) 6%, rgb(var(--surface)))",
      }}
    >
      {/* accent glow behind the object */}
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-[55%] -z-10 aspect-square w-3/5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent blur-[90px] transition-opacity duration-700 ${
          card ? "opacity-20 group-hover:opacity-30" : "opacity-25"
        }`}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 block h-full w-full"
      />
    </div>
  );
}
