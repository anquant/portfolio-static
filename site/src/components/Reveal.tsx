"use client";

import { CSSProperties, ElementType, ReactNode, useEffect, useRef, useState } from "react";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  /** Stagger delay in ms */
  delay?: number;
  className?: string;
  id?: string;
};

/**
 * Fades and lifts its content into place once it scrolls into view.
 * One shared gesture for every below-the-fold block (see .reveal-scroll).
 */
export default function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      className={`reveal-scroll ${inView ? "is-in" : ""} ${className}`}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
