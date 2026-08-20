"use client";

import { VideoAsset } from "@/lib/types/assetType";
import { useEffect, useRef } from "react";

type VideoSectionProps = {
  poster?: string;
  video: VideoAsset;
};

const VideoSection = ({ poster, video }: VideoSectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play();
        } else {
          video.pause();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative max-w-3xl w-full rounded-2xl overflow-hidden mx-auto">
      <video ref={videoRef} playsInline muted loop {...(poster && { poster })}>
        <source src={video.src} type={video.type} />
        Ваш браузер не поддерживает видео.
      </video>
    </div>
  );
};

export default VideoSection;
