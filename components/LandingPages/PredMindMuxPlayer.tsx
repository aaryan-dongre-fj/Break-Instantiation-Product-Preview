"use client";

import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  CheckCircle2,
  Loader2,
  VideoOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PredMindMuxPlayerProps {
  url?: string;
  thumbnailUrl?: string;
  teaserSrc?: string;
  onComplete?: () => void;
  isCompleted?: boolean;
  className?: string;
  onBeforePlay?: () => Promise<void>;
  onTokenError?: () => void;
  /** Chapter videos gate progression — surface why finishing them matters. */
  showProgressTooltip?: boolean;
}

export default function PredMindMuxPlayer({
  url,
  thumbnailUrl,
  teaserSrc,
  onComplete,
  isCompleted: initialIsCompleted = false,
  className,
  onBeforePlay,
  onTokenError,
  showProgressTooltip = false,
}: PredMindMuxPlayerProps) {
  const [isActive, setIsActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [showControls, setShowControls] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [nativePlayerMounted, setNativePlayerMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // iOS/WebKit ignores the HTMLMediaElement.volume setter entirely — audio level
  // is only controllable via the hardware buttons there, so a software slider
  // can't do anything. Fall back to a plain mute toggle on those devices.
  const [isIOS] = useState(
    () =>
      typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent)
  );

  // react-player picks native playback over hls.js whenever canPlayType()
  // reports HLS support. Chromium browsers spoofing an iOS user agent (Brave's
  // device emulation, and any UA-override extension) answer "maybe" for the
  // HLS mime type while having no native HLS engine, so the .m3u8 is handed to
  // a <video> that cannot decode it — MEDIA_ERR_SRC_NOT_SUPPORTED, and the
  // request aborts before it completes. Trust the claim only on genuine WebKit,
  // where native HLS is real and preferable (hardware decode, battery); force
  // hls.js everywhere else. Chromium's UA spoofing does not fake window.chrome.
  const [forceHLS] = useState(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return false;
    // react-player's forceHLS hands ANY url to hls.js, and the preview tool
    // plays plain local .mp4 fixtures through this player — only force for
    // actual HLS manifests (production Mux streams).
    if (!url || !url.includes(".m3u8")) return false;
    const claimsNativeHls = document
      .createElement("video")
      .canPlayType("application/vnd.apple.mpegurl") !== "";
    if (!claimsNativeHls) return false; // react-player uses hls.js anyway
    const isChromium =
      "chrome" in window || (navigator as { brave?: unknown }).brave !== undefined;
    return isChromium;
  });

  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const teaserRef = useRef<HTMLVideoElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const TAP_THRESHOLD_PX = 12;

  // Auto-play/pause teaser based on viewport visibility
  useEffect(() => {
    if (!teaserSrc || !teaserRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!teaserRef.current || isActive) return;
        if (entry.isIntersecting) {
          teaserRef.current.play().catch(() => {});
        } else {
          teaserRef.current.pause();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(teaserRef.current);
    return () => observer.disconnect();
  }, [teaserSrc, isActive]);

  // Sync fullscreen state and fix objectFit on the internal video element
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      const video = playerRef.current?.getInternalPlayer() as HTMLVideoElement | null;
      if (video) video.style.objectFit = isFull ? "contain" : "cover";
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keep isPlaying in sync with the actual <video> element. This matters most
  // for iOS: exiting the native fullscreen player (tapping "Done") pauses
  // playback at the OS level without going through our handlers, so without
  // this our custom controls would be left showing a stale "playing" state.
  useEffect(() => {
    if (!isActive || !nativePlayerMounted) return;
    const video = playerRef.current?.getInternalPlayer() as HTMLVideoElement | null;
    if (!video) return;

    const syncPlaying = () => setIsPlaying(!video.paused);
    video.addEventListener("play", syncPlaying);
    video.addEventListener("pause", syncPlaying);
    video.addEventListener("webkitendfullscreen", syncPlaying);

    return () => {
      video.removeEventListener("play", syncPlaying);
      video.removeEventListener("pause", syncPlaying);
      video.removeEventListener("webkitendfullscreen", syncPlaying);
    };
  }, [isActive, nativePlayerMounted]);

  useEffect(() => {
    if (!isActive) setNativePlayerMounted(false);
  }, [isActive]);

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    const container = containerRef.current;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    if (container.requestFullscreen) {
      container.requestFullscreen();
      return;
    }
    // iOS Safari/WebKit doesn't support the Fullscreen API on arbitrary
    // elements — fall back to the native fullscreen video player.
    const video = playerRef.current?.getInternalPlayer() as
      | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
      | null;
    video?.webkitEnterFullscreen?.();
  };

  const handleTogglePlay = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    if (!isActive) {
      handleActivate();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleActivate = async () => {
    if (isActive || isPreloading) return;

    if (onBeforePlay) {
      setIsPreloading(true);
      try {
        await onBeforePlay();
      } catch {
        setIsPreloading(false);
        return;
      }
      setIsPreloading(false);
    }

    // Stop teaser before HLS takes over
    if (teaserRef.current) {
      teaserRef.current.pause();
    }

    setIsHovering(false);
    setIsActive(true);
    setIsMuted(false);
    setIsPlaying(true);
    if (playerRef.current) {
      playerRef.current.seekTo(0);
    }
  };

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    if (isDragging) return;
    setProgress(state.played * 100);
    setCurrentTime(state.playedSeconds);
  };

  const handleDuration = (dur: number) => {
    setDuration(dur);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsCompleted(true);
    onComplete?.();
    setTimeout(() => {
      setIsActive(false);
      setIsMuted(true);
    }, 2000);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (clientX: number) => {
    if (!playerRef.current || !isActive || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    playerRef.current.seekTo(percentage, "fraction");
    setProgress(percentage * 100);
  };

  const onSeekPointerDown = (e: React.PointerEvent) => {
    if (!isActive) return;
    setIsDragging(true);
    handleSeek(e.clientX);
  };

  useEffect(() => {
    // Pointer events (not mouse events) so this also tracks touch drags on mobile.
    const onPointerMoveGlobal = (e: PointerEvent) => {
      if (isDragging) handleSeek(e.clientX);
    };
    const onPointerUpGlobal = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("pointermove", onPointerMoveGlobal);
      window.addEventListener("pointerup", onPointerUpGlobal);
    }
    return () => {
      window.removeEventListener("pointermove", onPointerMoveGlobal);
      window.removeEventListener("pointerup", onPointerUpGlobal);
    };
  }, [isDragging]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleMouseMove = () => {
    if (!isActive) return;
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isDragging) setShowControls(false);
    }, 3000);
  };

  const handleOverlayPointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    if (isActive) handleMouseMove();
  };

  const handleOverlayPointerUp = (e: React.PointerEvent) => {
    if (isPreloading || !pointerStartRef.current) return;
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    // Ignore drags — allow vertical page scroll when the gesture moves noticeably.
    if (Math.hypot(dx, dy) > TAP_THRESHOLD_PX) return;
    handleTogglePlay();
  };

  const handleOverlayPointerCancel = () => {
    pointerStartRef.current = null;
  };

  // Enter/leave rather than pointermove: the player moves under a stationary
  // cursor as the page scrolls, and only the boundary events get re-fired then.
  const handleOverlayPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    setIsHovering(true);
  };

  const handleOverlayPointerLeave = () => setIsHovering(false);

  // Only nudge while the video is still outstanding — once it's playing the hint
  // would sit on top of the controls, and once it's done it no longer applies.
  const isCaptionVisible =
    showProgressTooltip && !isActive && !isCompleted && isHovering;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative group w-full max-w-[400px] aspect-[9/16] transition-all duration-700 bg-black touch-pan-y",
        !isFullscreen && "overflow-hidden rounded-[40px] border-[8px] border-white shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)]",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      {/* No video uploaded for this profile */}
      {!url ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <VideoOff className="w-8 h-8 text-white/20" />
          <p className="text-white/30 text-xs font-semibold tracking-[0.2em] uppercase">Video not available</p>
        </div>
      ) : (
        <>
          {/* 1. HLS Stream — mounts on activate, hidden until ready */}
          {isActive && (
            <ReactPlayer
              ref={playerRef}
              url={url}
              width="100%"
              height="100%"
              playing={isPlaying}
              muted={isMuted}
              loop={false}
              volume={volume}
              onReady={() => setNativePlayerMounted(true)}
              onProgress={(state) => {
                if (!isReady && state.playedSeconds > 0) setIsReady(true);
                handleProgress(state);
              }}
              onDuration={handleDuration}
              onEnded={handleEnded}
              onError={() => onTokenError?.()}
              playsinline
              config={{
                file: {
                  forceHLS,
                  attributes: {
                    style: { width: "100%", height: "100%", objectFit: "cover" },
                  },
                },
              }}
              style={{ position: "absolute", top: 0, left: 0 }}
            />
          )}

          {/* 2. Ambient preview — looping teaser video or static GIF thumbnail */}
          <AnimatePresence>
            {(!isActive || !isReady) && (
              teaserSrc ? (
                <motion.div
                  key="teaser"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 z-10 pointer-events-none"
                >
                  <video
                    ref={teaserRef}
                    src={teaserSrc}
                    playsInline
                    muted
                    loop
                    preload="auto"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </motion.div>
              ) : thumbnailUrl ? (
                <motion.img
                  key="thumbnail"
                  src={thumbnailUrl}
                  alt=""
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
                  onError={() => onTokenError?.()}
                />
              ) : null
            )}
          </AnimatePresence>

          {/* 3. Interaction Layer — touch-pan-y lets page scroll; tap vs drag distinguishes play.
                 Also owns the hover state for the progress caption below. */}
          <div
            className="absolute inset-0 z-20 cursor-pointer touch-pan-y"
            onPointerEnter={handleOverlayPointerEnter}
            onPointerLeave={handleOverlayPointerLeave}
            onPointerDown={handleOverlayPointerDown}
            onPointerUp={handleOverlayPointerUp}
            onPointerCancel={handleOverlayPointerCancel}
          />

          {/* 4. Center State Icons */}
          <AnimatePresence>
            {/* Play button in ambient mode */}
            {!isActive && !isPreloading && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
              >
                <div className="w-16 h-16 rounded-full bg-secondary-background/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-md">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
              </motion.div>
            )}

            {/* Spinner while awaiting token refresh before activation */}
            {isPreloading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
              >
                <Loader2 className="w-10 h-10 text-white drop-shadow-lg animate-spin" />
              </motion.div>
            )}

            {/* Spinner over ambient preview while HLS buffers after click */}
            {isActive && !isReady && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
              >
                <Loader2 className="w-10 h-10 text-white drop-shadow-lg animate-spin" />
              </motion.div>
            )}

            {/* Play indicator when active and manually paused */}
            {isActive && isReady && !isPlaying && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
              >
                <div className="w-16 h-16 rounded-full bg-secondary-background/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-md">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 5. Custom Controls */}
          <AnimatePresence>
            {isActive && (showControls || !isPlaying || isDragging) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute inset-0 z-40 flex flex-col justify-end p-6 pointer-events-none"
              >
                <div className="space-y-4 pointer-events-auto">
                  {/* Gold Progress Bar */}
                  <div
                    ref={progressBarRef}
                    className="relative h-2 w-full bg-white/20 rounded-full cursor-pointer group/progress touch-none"
                    onPointerDown={onSeekPointerDown}
                  >
                    <div
                      className="absolute top-0 left-0 h-full bg-secondary-background rounded-full shadow-[0_0_10px_rgba(204,160,119,0.8)]"
                      style={{ width: `${progress}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                      style={{ left: `${progress}%`, marginLeft: "-6px" }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <button onClick={handleTogglePlay} className="text-white hover:text-secondary-background transition-colors">
                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                      </button>

                      {/* Volume — iOS ignores the JS volume setter entirely (hardware
                          buttons only control it there), so a slider would be
                          non-functional and misleading; just offer mute toggle. */}
                      {isIOS ? (
                        <button onClick={toggleMute} className="text-white hover:text-secondary-background transition-colors">
                          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                        </button>
                      ) : (
                        <div
                          className="relative flex items-center gap-2"
                          onMouseEnter={() => setShowVolumeSlider(true)}
                          onMouseLeave={() => setShowVolumeSlider(false)}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // On touch devices there's no hover to reveal the
                              // slider, so the first tap opens it instead of muting.
                              if (!showVolumeSlider) {
                                setShowVolumeSlider(true);
                                return;
                              }
                              toggleMute(e);
                            }}
                            className="text-white hover:text-secondary-background transition-colors"
                          >
                            {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                          </button>
                          {showVolumeSlider && (
                            <motion.input
                              initial={{ width: 0, opacity: 0 }}
                              animate={{ width: 80, opacity: 1 }}
                              exit={{ width: 0, opacity: 0 }}
                              type="range" min="0" max="1" step="0.01"
                              value={volume}
                              onChange={handleVolumeChange}
                              onClick={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                              className="h-1 bg-white/30 accent-secondary-background cursor-pointer touch-none"
                            />
                          )}
                        </div>
                      )}

                      <span className="text-[10px] font-medium text-white/70 tracking-widest pt-0.5">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <button onClick={handleFullscreen} className="text-white hover:text-secondary-background transition-colors">
                      {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 6. Completion Mark */}
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-6 right-6 z-50"
              >
                <div className="bg-white rounded-full p-1 shadow-lg ring-4 ring-secondary-background/10">
                  <CheckCircle2 className="w-8 h-8 text-secondary-background" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 7. Progress caption — sits inside the frame so it reads as part of
                 the player rather than a floating UI chip. */}
          <AnimatePresence>
            {isCaptionVisible && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                role="tooltip"
                className="absolute inset-x-4 bottom-4 md:inset-x-5 md:bottom-5 z-30 pointer-events-none"
              >
                <div className="rounded-2xl border border-secondary-background/25 bg-primary-text/70 backdrop-blur-xl px-4 py-3 text-center shadow-[0_16px_40px_-20px_rgba(7,4,1,0.9)]">
                  {/* Primary emphasis carries the idea; the instruction below
                      stays regular weight so it reads as a step, not a headline. */}
                  <span className="block font-serif font-bold italic text-sm leading-snug text-secondary-background">
                    Progress follows understanding.
                  </span>
                  <span className="mt-1 block text-[11px] leading-snug tracking-tight text-primary-background/70 font-bold">
                    Complete this video before continuing.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
