import Image from "next/image";
import type { ImageAsset } from "@/lib/content/schemas";

type BlogCoverProps = {
  image?: ImageAsset;
  color?: string;
  priority?: boolean;
  /** "card": lights up on parent .group hover */
  mode?: "card" | "hero";
  className?: string;
};

/**
 * Blog illustrations are 3D objects on transparent PNGs. Instead of the old
 * pastel rectangles they sit on a dark stage tinted with the article colour,
 * lit from behind by a glow of the same colour — like the project media.
 */
export default function BlogCover({
  image,
  color = "rgb(var(--accent))",
  priority,
  mode = "card",
  className = "",
}: BlogCoverProps) {
  const card = mode === "card";
  return (
    <div
      className={`relative isolate flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `color-mix(in srgb, ${color} 9%, rgb(var(--surface)))`,
      }}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-opacity duration-700 ${
          card ? "opacity-40 group-hover:opacity-70" : "opacity-55"
        }`}
        style={{ background: color }}
      />
      <Image
        src={image?.src ?? "/assets/images/default-image-blog.png"}
        width={image?.width ?? 600}
        height={image?.height ?? 600}
        alt=""
        priority={priority}
        className={`h-auto drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)] transition-transform duration-700 ${
          card
            ? "w-1/2 group-hover:scale-105 group-hover:-translate-y-1"
            : "w-2/5"
        }`}
      />
    </div>
  );
}
