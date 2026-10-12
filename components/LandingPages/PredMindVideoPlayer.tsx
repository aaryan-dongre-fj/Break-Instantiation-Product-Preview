"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PredMindVideoPlayerProps {
  src: string;
  teaserSrc?: string;
  poster?: string;
  onComplete?: () => void;
  isCompleted?: boolean;
  className?: string;
}

export default function PredMindVideoPlayer({
  src,
  teaserSrc,
  poster,
  onComplete,
  isCompleted: initialIsCompleted = false,
  className,
}: PredMindVideoPlayerProps) {
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const teaserRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Fullscreen logic: use the container instead of the video to keep custom UI
  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerContainerRef.current) return;
    
    const container = playerContainerRef.current;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      }
    }
  };

  // Intersection Observer for Ambient Mode (Teaser or Main Video if no teaser)
  useEffect(() => {
    const targetVideo = teaserSrc ? teaserRef.current : videoRef.current;
    if (!targetVideo || isActive) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          targetVideo.play().catch(() => {});
        } else {
          targetVideo.pause();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(targetVideo);
    return () => observer.disconnect();
  }, [isActive, teaserSrc]);

  const handleTogglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleActivate = () => {
    if (isActive) return;
    setIsActive(true);
    setIsMuted(false);
    setIsPlaying(true);
    
    // Pause teaser immediately
    if (teaserRef.current) {
      teaserRef.current.pause();
    }

    // Play main video
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = false;
      videoRef.current.loop = false;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleDeactivate = () => {
    setIsActive(false);
    setIsMuted(true);
    setIsPlaying(false);
    
    // Reset and play teaser
    if (teaserRef.current) {
      teaserRef.current.currentTime = 0;
      teaserRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      // If no teaser, just loop the main video
      videoRef.current.muted = true;
      videoRef.current.loop = true;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setCurrentTime(current);
    if (dur) setProgress((current / dur) * 100);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsCompleted(true);
    onComplete?.();
    setTimeout(() => handleDeactivate(), 2000);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (clientX: number) => {
    if (!videoRef.current || !isActive || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    videoRef.current.currentTime = newTime;
    setProgress(percentage * 100);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!isActive) return;
    setIsDragging(true);
    handleSeek(e.clientX);
  };

  useEffect(() => {
    const onMouseMoveGlobal = (e: MouseEvent) => {
      if (isDragging) handleSeek(e.clientX);
    };
    const onMouseUpGlobal = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMoveGlobal);
      window.addEventListener("mouseup", onMouseUpGlobal);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMoveGlobal);
      window.removeEventListener("mouseup", onMouseUpGlobal);
    };
  }, [isDragging, duration]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    const newVolume = newMuted ? 0 : (volume === 0 ? 1 : volume);
    videoRef.current.muted = newMuted;
    videoRef.current.volume = newVolume;
    setIsMuted(newMuted);
    if (!newMuted && volume === 0) setVolume(1);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMouseMove = () => {
    if (!isActive) return;
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isDragging) setShowControls(false);
    }, 3000);
  };

  return (
    <div
      ref={playerContainerRef}
      className={cn(
        "relative group w-full max-w-[400px] aspect-[9/16] transition-all duration-700 overflow-hidden rounded-[40px] bg-black",
        "border-[8px] border-white shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)]",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isActive && isPlaying && setShowControls(false)}
    >
      {/* Main Video Element */}
      <video
        ref={videoRef}
        src={src}
        className={cn(
          "w-full h-full cursor-pointer transition-all duration-700",
          isFullscreen ? "object-contain" : "object-cover",
          teaserSrc && !isActive ? "opacity-0 scale-105" : "opacity-100 scale-100"
        )}
        playsInline
        muted={isMuted}
        loop={!isActive && !teaserSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={isActive ? handleTogglePlay : handleActivate}
        preload="auto"
      />

      {/* Teaser Video Element (Optional) */}
      {teaserSrc && (
        <video
          ref={teaserRef}
          src={teaserSrc}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-all duration-700 pointer-events-none",
            isActive ? "opacity-0 scale-95" : "opacity-100 scale-100"
          )}
          playsInline
          muted
          loop
          preload="auto"
        />
      )}

      {/* Ambient Mode Overlay */}
      {!isActive && (
        <div 
          className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center cursor-pointer"
          onClick={handleActivate}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 rounded-full bg-secondary-background/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-md"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </motion.div>
        </div>
      )}

      {/* Custom Controls */}
      <AnimatePresence>
        {isActive && (showControls || !isPlaying || isDragging) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-0 z-20 flex flex-col justify-end p-6 pointer-events-none"
          >
            <div className="space-y-4 pointer-events-auto">
              {/* Draggable Progress Bar */}
              <div 
                ref={progressBarRef}
                className="relative h-2 w-full bg-white/20 rounded-full cursor-pointer group/progress"
                onMouseDown={onMouseDown}
              >
                <div 
                  className="absolute top-0 left-0 h-full bg-secondary-background rounded-full shadow-[0_0_10px_rgba(204,160,119,0.8)]"
                  style={{ width: `${progress}%` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                  style={{ left: `${progress}%`, marginLeft: "-8px" }}
                />
              </div>

              {/* Bottom Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <button onClick={handleTogglePlay} className="text-white hover:text-secondary-background transition-colors cursor-pointer">
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>
                  
                  {/* Volume Control */}
                  <div 
                    className="relative flex items-center gap-2 group/volume"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <button onClick={toggleMute} className="text-white hover:text-secondary-background transition-colors cursor-pointer">
                      {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                    <AnimatePresence>
                      {showVolumeSlider && (
                        <motion.input
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 80, opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="h-1 bg-white/30 accent-secondary-background cursor-pointer"
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  <span className="text-[10px] font-medium text-white/70 tracking-widest pt-0.5">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                <button onClick={handleFullscreen} className="text-white hover:text-secondary-background transition-colors cursor-pointer">
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Mark */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-6 right-6 z-30"
          >
            <div className="bg-white rounded-full p-1 shadow-lg ring-4 ring-secondary-background/10">
              <CheckCircle2 className="w-8 h-8 text-secondary-background" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
