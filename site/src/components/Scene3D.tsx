import { useEffect, useRef } from 'react';

import type { SceneId } from './scene3d/ids';

type Scene3DProps = {
  scene: SceneId;
  /** Accessible label (the project title) */
  label: string;
  /** Frame proportions, as Tailwind aspect classes */
  aspectClassName?: string;
  /** "card": the glow lights up on parent `.group` hover */
  mode?: 'card' | 'hero';
  /** Own border + rounded corners; off when a parent card already frames it */
  framed?: boolean;
  className?: string;
};

/**
 * Animated 3D preview of a project on the same dark stage as the rest of the
 * project media. three.js is only downloaded when the frame approaches the
 * viewport; without WebGL the empty stage stays as a quiet placeholder.
 */
export default function Scene3D({
  scene,
  label,
  aspectClassName = 'aspect-[3/2]',
  mode = 'card',
  framed = true,
  className = '',
}: Scene3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    let cancelled = false;
    let unmount: (() => void) | null = null;

    const near = new IntersectionObserver(
      entries => {
        if (!entries.at(-1)?.isIntersecting) {
          return;
        }
        near.disconnect();
        import('./scene3d/engine')
          .then(({ mountScene }) => {
            if (cancelled) {
              return;
            }
            const hoverTarget = canvas.closest<HTMLElement>('.group') ?? canvas.parentElement ?? canvas;
            unmount = mountScene(canvas, scene, hoverTarget);
          })
          .catch((error: unknown) => {
            // e.g. a stale tab after a deploy can't fetch the old chunk: the
            // stage stays as the quiet placeholder, the page is unaffected
            console.warn('3D scene unavailable:', error);
          });
      },
      { rootMargin: '600px 0px' },
    );
    near.observe(canvas);

    return () => {
      cancelled = true;
      near.disconnect();
      unmount?.();
    };
  }, [scene]);

  const card = mode === 'card';

  return (
    <div
      role="img"
      aria-label={label}
      className={`relative isolate overflow-hidden ${
        framed ? 'rounded-2xl md:rounded-3xl border border-line' : ''
      } ${aspectClassName} ${className}`}
      style={{
        background: 'color-mix(in srgb, rgb(var(--accent)) 6%, rgb(var(--surface)))',
      }}
    >
      {/* accent glow behind the object */}
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-[55%] -z-10 aspect-square w-3/5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent blur-[90px] transition-opacity duration-700 ${
          card ? 'opacity-20 group-hover:opacity-30' : 'opacity-25'
        }`}
      />
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 block h-full w-full" />
    </div>
  );
}
