"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/** e.g. `/eye-static.mp4` → webm, mp4, and `-poster.jpg` */
export function getCurriculumMedia(videoUrl: string) {
  const base = videoUrl.replace(/\.(webm|mp4)$/i, "");
  return {
    webm: `${base}.webm`,
    mp4: `${base}.mp4`,
    poster: `${base}-poster.jpg`,
  };
}

interface CurriculumModuleVideoProps {
  videoUrl: string;
  className?: string;
  videoClassName?: string;
  /** When false, playback pauses (e.g. card flipped away). */
  isActive?: boolean;
}

export default function CurriculumModuleVideo({
  videoUrl,
  className = "absolute inset-0",
  videoClassName = "h-full w-full object-cover",
  isActive = true,
}: CurriculumModuleVideoProps) {
  const [isInView, setIsInView] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const media = useMemo(() => getCurriculumMedia(videoUrl), [videoUrl]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.15, rootMargin: "80px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoFailed) return;

    if (isInView && isActive) {
      video.play().catch(() => {
        // Autoplay blocked — poster remains visible.
      });
    } else {
      video.pause();
    }
  }, [isInView, isActive, videoFailed]);

  const showVideo = !videoFailed && videoReady;

  return (
    <div ref={containerRef} className={className}>
      <img
        src={media.poster}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          showVideo ? "opacity-0" : "opacity-100"
        }`}
        loading="lazy"
        decoding="async"
      />

      {!videoFailed && (
        <video
          ref={videoRef}
          poster={media.poster}
          muted
          loop
          playsInline
          preload={isInView ? "auto" : "none"}
          onLoadedData={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
          className={`absolute inset-0 ${videoClassName} transition-opacity duration-500`}
          style={{ opacity: showVideo ? 1 : 0 }}
        >
          <source src={media.webm} type="video/webm" />
          <source src={media.mp4} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
