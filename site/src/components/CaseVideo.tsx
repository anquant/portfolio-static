import { useEffect, useRef, useState } from 'react';
import { IoPause, IoPlay } from 'react-icons/io5';

import type { ImageAsset, VideoAsset } from '@/lib/content/schemas';
import { useLocale } from '@/lib/use-locale';

import ProjectMedia from './ProjectMedia';

type CaseVideoProps = {
  video: VideoAsset;
  poster?: ImageAsset;
  title: string;
  color?: string;
};

/**
 * Case-study screen recording, presented on the same dark stage as images.
 * Plays only while on screen; user can pause; no autoplay with reduced motion.
 */
export default function CaseVideo({ video, poster, title, color }: CaseVideoProps) {
  const { t } = useLocale();
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // null = no explicit choice yet: follow visibility (and reduced-motion preference)
  const [userWants, setUserWants] = useState<boolean | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(
      entries => {
        const entry = entries.at(-1);
        if (!entry) {
          return;
        }
        const wants = userWants ?? !reduced;
        if (entry.isIntersecting && wants) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);

    return () => io.disconnect();
  }, [userWants]);

  const toggle = () => {
    const el = ref.current;
    if (!el) {
      return;
    }
    if (el.paused) {
      setUserWants(true);
      el.play().catch(() => {});
    } else {
      setUserWants(false);
      el.pause();
    }
  };

  return (
    <ProjectMedia
      src={poster?.src ?? ''}
      width={poster?.width ?? 1920}
      height={poster?.height ?? 1080}
      alt=""
      color={color}
    >
      <video
        ref={ref}
        className="block w-full h-auto"
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster?.src}
        width={poster?.width}
        height={poster?.height}
        aria-label={`${title} — ${t.work.video}`}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={video.src} type={video.type} />
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? t.work.pause : t.work.play}
        className="absolute bottom-3 right-3 md:bottom-5 md:right-5 z-10 grid place-items-center size-10 md:size-12 rounded-full bg-bg/70 text-fg backdrop-blur ring-1 ring-white/15 transition-colors hover:bg-bg/90"
      >
        {playing ? <IoPause size={18} /> : <IoPlay size={18} className="translate-x-px" />}
      </button>
    </ProjectMedia>
  );
}
