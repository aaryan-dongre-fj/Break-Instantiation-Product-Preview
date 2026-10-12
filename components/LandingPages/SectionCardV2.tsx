"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, Play, CheckCircle2 } from "lucide-react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";

interface SectionCardV2Props {
  title: string;
  videoUrl: string;
  height: number;
  index: number;
  isLocked?: boolean;
  isCompleted?: boolean;
  onClick?: () => void;
}

function getCardMedia(videoUrl: string) {
  const base = videoUrl.replace(/\.(webm|mp4)$/i, "");
  return {
    webm: `${base}.webm`,
    mp4: `${base}.mp4`,
    poster: `${base}-poster.jpg`,
  };
}

const SectionCardV2 = ({
  title,
  videoUrl,
  height,
  index,
  isLocked = false,
  isCompleted = false,
  onClick,
}: SectionCardV2Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const media = useMemo(() => getCardMedia(videoUrl), [videoUrl]);

  const playIfAllowed = useCallback(() => {
    const video = videoRef.current;
    if (!video || videoFailed || !isInView) return;
    video.play().catch(() => {});
  }, [isInView, videoFailed]);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.15, rootMargin: "80px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Play / pause when visibility changes. Stagger on mobile so 4 decoders don't fight.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoFailed) return;

    if (!isInView) {
      video.pause();
      return;
    }

    if (video.readyState === 0) {
      video.load();
    }

    const mobile = window.matchMedia("(max-width: 639px)").matches;
    const delay = mobile ? index * 350 : 0;
    const timer = window.setTimeout(playIfAllowed, delay);
    return () => window.clearTimeout(timer);
  }, [isInView, videoFailed, index, playIfAllowed]);

  const showVideo = !videoFailed && videoReady;
  const videoOpacity = showVideo
    ? isLocked
      ? 0.35
      : isHovered
        ? 0.9
        : 0.6
    : 0;

  return (
    <motion.div
      ref={cardRef}
      onClick={isLocked ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden w-full rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl ${
        isLocked ? "cursor-not-allowed" : "cursor-pointer"
      }`}
      animate={{
        height: typeof height === "number" ? height : 480,
      }}
      style={{
        height: typeof height === "number" ? height : 480,
      }}
      transition={{
        type: "spring",
        stiffness: 250,
        damping: 30,
        mass: 0.8,
      }}
    >
      <div className="absolute inset-0 bg-black/80">
        <img
          src={media.poster}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            showVideo ? "opacity-0" : isLocked ? "opacity-40" : "opacity-100"
          }`}
          loading="lazy"
          decoding="async"
        />

        {/* Preview loop on every card — lock only blocks clicking into the chapter */}
        {!videoFailed && (
          <video
            ref={videoRef}
            poster={media.poster}
            muted
            loop
            playsInline
            preload={isInView ? "auto" : "none"}
            onLoadedData={() => {
              setVideoReady(true);
              playIfAllowed();
            }}
            onCanPlay={playIfAllowed}
            onError={() => setVideoFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
            style={{ opacity: videoOpacity }}
          >
            <source src={media.webm} type="video/webm" />
            <source src={media.mp4} type="video/mp4" />
          </video>
        )}

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background:
              isHovered && !isLocked
                ? `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.9) 100%)`
                : `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.95) 100%)`,
          }}
        />

        <div className="absolute inset-0 rounded-[2.5rem] border border-white/10 pointer-events-none" />
      </div>

      <AnimatePresence>
        {isLocked && isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 backdrop-blur-sm bg-black/50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-xl text-white">
                <Lock className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60 text-center max-w-[200px]">
                Complete the Previous Chapter to Unlock
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`absolute inset-0 flex flex-col justify-between p-5 md:p-10 text-white z-10 transition-opacity duration-500 ${
          isLocked ? "opacity-70" : "opacity-100"
        }`}
      >
        <div className="flex flex-col gap-1 md:gap-2">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] font-mono text-white/50"
          >
            Chapter {String(index + 1).padStart(2, "0")}
          </motion.span>

          <h3 className="font-serif italic text-xl md:text-3xl lg:text-4xl leading-[1.1] max-w-[240px] tracking-tight">
            {title}
          </h3>
        </div>

        <div className="relative">
          <AnimatePresence>
            {isHovered && !isLocked && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-xl">
                  <Play size={16} fill="currentColor" />
                </div>
                <span className="text-[12px] uppercase tracking-[0.3em] font-bold">
                  Start
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.span
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 0.1, x: 0 }}
        className="absolute bottom-4 right-4 md:bottom-6 md:right-6 text-6xl md:text-9xl font-serif italic text-white pointer-events-none select-none z-10"
      >
        {String(index + 1).padStart(2, "0")}
      </motion.span>

      {isCompleted && (
        <div className="absolute top-8 right-8 z-30">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full text-white shadow-xl"
          >
            <CheckCircle2 size={18} className="text-secondary-background" />
          </motion.div>
        </div>
      )}

      <motion.div
        className="absolute bottom-0 left-0 h-[3px] bg-secondary-background"
        initial={{ width: 0 }}
        animate={{ width: isCompleted ? "100%" : isHovered ? "40%" : "0%" }}
        transition={{ duration: 0.8, ease: "circOut" }}
      />
    </motion.div>
  );
};

export default SectionCardV2;
