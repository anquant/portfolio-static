import { type ReactNode, type MouseEvent } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";
type Size = "normal" | "small";

interface ButtonProps {
  type?: "button" | "submit" | "link";
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  disabled?: boolean;
  external?: boolean;
  "aria-label"?: string;
  "aria-pressed"?: boolean;
}

/*
 * Hover is an opacity fade of a separate layer, not a background-color
 * transition: opacity runs on the compositor, so it stays smooth even while
 * the WebGL hero keeps the main thread busy.
 */
const base =
  "group/btn relative isolate inline-flex w-fit items-center justify-center gap-2.5 overflow-hidden rounded-full font-medium whitespace-nowrap [transform:translateZ(0)] disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "bg-fg text-bg",
  secondary: "border border-line text-fg",
  ghost: "text-muted",
};

const hoverLayer: Record<Variant, string> = {
  primary: "bg-accent",
  secondary: "bg-fg/10",
  ghost: "bg-fg/10",
};

const sizes: Record<Size, string> = {
  normal: "text-sm md:text-base h-12 px-7",
  small: "text-sm h-9 px-4",
};

export default function Button({
  type = "button",
  href = "#",
  variant = "primary",
  size = "normal",
  className = "",
  children,
  onClick,
  disabled,
  external,
  ...aria
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  const content = (
    <>
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 rounded-full opacity-0 transition-opacity duration-300 ease-out group-hover/btn:opacity-100 group-focus-visible/btn:opacity-100 group-disabled/btn:!opacity-0 ${hoverLayer[variant]}`}
      />
      {children}
    </>
  );

  if (type === "link") {
    return (
      <Link
        href={href}
        className={classes}
        onClick={onClick}
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
        {...aria}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...aria}
    >
      {content}
    </button>
  );
}
