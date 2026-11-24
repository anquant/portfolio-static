import { type CSSProperties, type ElementType, type ReactNode, useEffect, useRef, useState } from 'react';

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  /** Stagger delay in ms */
  delay?: number;
  /**
   * Extra delay (ms) used only when the block is already on screen at load,
   * so first-screen content waits for the page intro to finish.
   */
  introDelay?: number;
  className?: string;
  id?: string;
};

/**
 * Fades and lifts its content into place once it scrolls into view.
 * One shared gesture for every below-the-fold block (see .reveal-scroll).
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  introDelay = 0,
  className = '',
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [onFirstScreen, setOnFirstScreen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    let firstCallback = true;
    const io = new IntersectionObserver(
      entries => {
        const entry = entries.at(-1);
        if (!entry) {
          return;
        }
        // the observer reports the initial state right away: visible then, with the
        // page at the top, = first screen (not a restored scroll or a #hash jump)
        if (entry.isIntersecting && firstCallback && window.scrollY === 0) {
          setOnFirstScreen(true);
        }
        firstCallback = false;
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    );
    io.observe(el);

    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      className={`reveal-scroll ${inView ? 'is-in' : ''} ${className}`}
      style={{ '--d': `${delay + (onFirstScreen ? introDelay : 0)}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
