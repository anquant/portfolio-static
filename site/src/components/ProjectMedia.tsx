import Image from "next/image";
import { type CSSProperties, type ReactNode } from "react";

type ProjectMediaProps = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Project colour (from content) — tints the stage and the glow */
  color?: string;
  sizes?: string;
  priority?: boolean;
  /**
   * "hover": the image "lights up" when a parent `.group` is hovered (cards).
   * "static": always shown at full brightness (case page, where it is the content).
   */
  mode?: "hover" | "static";
  className?: string;
  /** Replaces the image inside the stage (e.g. a video); src/size still set the frame */
  children?: ReactNode;
};

/**
 * Presents light project artwork on the dark site: instead of a bright
 * full-bleed rectangle, the image sits like a screen on a dark stage tinted
 * with the project colour, inside a passe-partout, with its edges softened.
 */
export default function ProjectMedia({
  src,
  width,
  height,
  alt,
  color = "rgb(var(--accent))",
  sizes,
  priority,
  mode = "static",
  className = "",
  children,
}: ProjectMediaProps) {
  const hover = mode === "hover";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl md:rounded-3xl border border-line p-2.5 md:p-4 ${className}`}
      style={
        {
          // dark stage tinted with the project colour
          background: `color-mix(in srgb, ${color} 10%, rgb(var(--surface)))`,
        } as CSSProperties
      }
    >
      {/* soft glow of the project colour behind the "screen" */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
          hover ? "opacity-50 group-hover:opacity-90" : "opacity-70"
        }`}
        style={{
          background: `radial-gradient(70% 60% at 50% 100%, color-mix(in srgb, ${color} 45%, transparent), transparent 70%)`,
        }}
      />
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl ring-1 ring-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        {children ?? (
          <Image
            src={src}
            width={width}
            height={height}
            alt={alt}
            sizes={sizes}
            priority={priority}
            className={`block w-full h-auto transition-[filter,transform] duration-700 ease-out ${
              hover
                ? "brightness-[.82] saturate-[.9] group-hover:brightness-100 group-hover:saturate-100 group-hover:scale-[1.02]"
                : "brightness-[.94]"
            }`}
          />
        )}
        {/* edge vignette: light artwork melts into the dark stage */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 shadow-[inset_0_0_90px_20px_rgba(12,12,14,0.55)] ${
            hover ? "opacity-100 group-hover:opacity-30" : "opacity-60"
          }`}
        />
      </div>
    </div>
  );
}
