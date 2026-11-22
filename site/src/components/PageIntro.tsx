import Link from "next/link";
import { CSSProperties, ReactNode } from "react";

type Crumb = { href: string; label: string };

type PageIntroProps = {
  /** Parent pages; the current page title is appended automatically */
  crumbs?: Crumb[];
  /** Label for the current page in breadcrumbs (defaults to the title) */
  current?: string;
  title: ReactNode;
  /** "display" for short titles, "title" for long ones (articles, services) */
  size?: "display" | "title";
  lead?: ReactNode;
  /** Extra content under the lead (tags, buttons, meta) */
  children?: ReactNode;
  /** Colour of the light source behind the title; defaults to the accent */
  glow?: string;
  className?: string;
};

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * Shared page opening: breadcrumbs → title → lead → extras, revealed as one
 * staggered gesture, with a soft light source behind (the "studio light"
 * that the 3D heroes have, in a lightweight form).
 */
export default function PageIntro({
  crumbs,
  current,
  title,
  size = "display",
  lead,
  children,
  glow,
  className = "",
}: PageIntroProps) {
  return (
    <section className={`relative isolate ${className}`}>
      <div
        aria-hidden
        className="reveal pointer-events-none absolute -left-40 -top-72 -z-10 h-[34rem] w-[52rem] max-w-[140vw] rounded-full blur-3xl opacity-60"
        style={{
          ...d(0),
          background: `radial-gradient(closest-side, ${
            glow ? `color-mix(in srgb, ${glow} 40%, transparent)` : "rgb(var(--accent) / 0.16)"
          }, transparent)`,
        }}
      />
      {crumbs && crumbs.length > 0 && (
        <nav
          aria-label="Хлебные крошки"
          className="reveal flex flex-wrap gap-2 text-sm text-muted mb-6"
          style={d(50)}
        >
          {crumbs.map((c) => (
            <span key={c.href} className="flex gap-2">
              <Link href={c.href} className="transition-colors hover:text-fg">
                {c.label}
              </Link>
              <span aria-hidden>/</span>
            </span>
          ))}
          <span className="text-fg" aria-current="page">
            {current ?? title}
          </span>
        </nav>
      )}
      <h1
        className={`reveal ${size === "display" ? "t-display" : "t-title"} max-w-5xl`}
        style={d(150)}
      >
        {title}
      </h1>
      {lead && (
        <div
          className="reveal mt-6 md:mt-8 max-w-2xl text-lg md:text-xl text-muted leading-relaxed"
          style={d(300)}
        >
          {lead}
        </div>
      )}
      {children && (
        <div className="reveal mt-8 md:mt-10" style={d(450)}>
          {children}
        </div>
      )}
    </section>
  );
}
