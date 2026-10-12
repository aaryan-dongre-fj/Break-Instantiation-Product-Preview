"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PersonStanding, Maximize2, X, MousePointerClick } from "lucide-react";

interface SpectrumVisualMobileProps {
  position?: number;
  subtitle?: string;
}

const TICKS = [10, 20, 30, 70, 90];

const SPECTRUM_LABELS = [
  { label: "A- CTRL OVERT", pos: 5 },
  { label: "A- CTRL SWITCH", pos: 15 },
  { label: "A- CTRL COVERT", pos: 25 },
  { label: "A- HIAT", pos: 40 },
  { label: "REJ- LOVE & SAFE", pos: 60 },
  { label: "REJ- LOVE", pos: 80 },
  { label: "CHAOS - REJ", pos: 95 },
];

const INFO_CARDS_LEFT = [
  { text: "SITUATIONAL AWARENESS INCREASES", bg: "bg-secondary-background", textColor: "text-black" },
  { text: "SELF-TRUST INCREASES", bg: "bg-[#1A1A1A]", textColor: "text-white" },
  { text: "INDEPENDENCE INCREASES", bg: "bg-[#4B4B4B]", textColor: "text-white" },
  { text: "WORK OR PURPOSE ORIENTATION INCREASES", bg: "bg-white", textColor: "text-black" },
];

const INFO_CARDS_RIGHT = [
  { text: "SITUATIONAL AWARENESS DECREASES", bg: "bg-secondary-background", textColor: "text-black" },
  { text: "SELF-TRUST DECREASES", bg: "bg-[#1A1A1A]", textColor: "text-white" },
  { text: "INDEPENDENCE DECREASES", bg: "bg-[#4B4B4B]", textColor: "text-white" },
  { text: "WORK OR PURPOSE ORIENTATION DECREASES", bg: "bg-white", textColor: "text-black" },
];

export default function SpectrumVisualMobile({
  position = 0,
  subtitle,
}: SpectrumVisualMobileProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [guess, setGuess] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const check = () => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const landscape = screenW > screenH;
      setIsLandscape(landscape);
      
      // The total "virtual" size of our content including info cards and buttons
      const contentW = 1200;
      const contentH = 750; // Graph (500) + Cards (~150) + Button (~100)
      
      // Rotate 90deg if in portrait and width <= 1024px
      const needsRotation = !landscape && screenW <= 1024;
      
      if (landscape || !needsRotation) {
        // Normal landscape or large portrait: 
        // We need to fit 1200 into Width and 750 into Height
        const scaleW = (screenW - 60) / contentW;
        const scaleH = (screenH - 60) / contentH;
        setScale(Math.min(1, scaleW, scaleH));
      } else {
        // Rotated portrait:
        // We need to fit 1200 into Screen Height and 750 into Screen Width
        const scaleW = (screenW - 60) / contentH;
        const scaleH = (screenH - 60) / contentW;
        setScale(Math.min(1, scaleW, scaleH));
      }
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const getPositionFromEvent = useCallback((e: MouseEvent | TouchEvent) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const isSmallPortrait = !isLandscape && typeof window !== 'undefined' && window.innerWidth <= 1024;

    if (isSmallPortrait) {
      return Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    } else {
      return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    }
  }, [isLandscape]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isRevealed) return;
    setIsMouseDown(true);
    setGuess(getPositionFromEvent(e.nativeEvent));
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (isRevealed || !isMouseDown) return;
    if (!isDragging) setIsDragging(true);
    setGuess(getPositionFromEvent(e));
  };

  const handleEnd = () => {
    setIsMouseDown(false);
    setIsDragging(false);
  };

  useEffect(() => {
    if (isMouseDown) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove);
      window.addEventListener("touchend", handleEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isMouseDown, isRevealed, isLandscape, getPositionFromEvent]);

  const modal = (
    <div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden touch-none select-none"
      style={{ zIndex: 9999 }}
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-secondary-background/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-white/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Close button */}
      <div className="absolute top-6 right-6" style={{ zIndex: 100 }}>
        <button
          onClick={() => setIsFullscreen(false)}
          className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors border border-white/20"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content Area */}
      <div 
        className="relative flex items-center justify-center"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        style={{ cursor: isRevealed ? "default" : isDragging ? "grabbing" : "crosshair" }}
      >
        <div
          ref={containerRef}
          className="relative"
          style={{
            width: 1200,
            height: 500,
            transform: `scale(${scale}) ${(!isLandscape && typeof window !== 'undefined' && window.innerWidth <= 1024) ? 'rotate(90deg)' : ''}`,
            transformOrigin: "center center",
          }}
        >
          <GraphContentInternal
            guess={guess}
            isDragging={isDragging}
            isRevealed={isRevealed}
            position={position}
            subtitle={subtitle}
            onReveal={() => setIsRevealed(true)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* On-page preview */}
      <div className="w-full bg-black rounded-[40px] overflow-hidden relative flex flex-col items-center justify-center select-none py-16 min-h-[300px]">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary-background/5 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-secondary-background/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="flex flex-col items-center text-center px-6">
            <h3 className="text-white/80 text-xs font-bold uppercase tracking-[0.3em] mb-4">
              Reality Spectrum Visual
            </h3>
            <p className="text-white/40 text-[10px] uppercase tracking-widest max-w-[280px] leading-relaxed">
              Please rotate your phone and interact with the spectrum to reveal your results
            </p>
          </div>

          <button
            onClick={() => setIsFullscreen(true)}
            className="group bg-white/5 backdrop-blur-xl px-10 py-5 rounded-[2rem] border border-white/10 flex items-center gap-4 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all duration-500 shadow-2xl"
          >
            <div className="bg-white text-black p-2 rounded-full group-hover:scale-110 transition-transform duration-500">
              <Maximize2 className="w-4 h-4" />
            </div>
            <span className="text-white text-xs font-bold uppercase tracking-[0.2em]">
              Tap to Interact
            </span>
          </button>
        </div>
      </div>

      {mounted && isFullscreen && createPortal(modal, document.body)}
    </>
  );
}

const GraphContentInternal = memo(({
  guess,
  isDragging,
  isRevealed,
  position,
  subtitle,
  onReveal,
}: {
  guess: number | null,
  isDragging: boolean,
  isRevealed: boolean,
  position: number,
  subtitle?: string,
  onReveal: () => void,
}) => {
  const displayGhostPos = (guess !== null) ? guess : null;
  const shouldShowGhost = displayGhostPos !== null;

  return (
    <div className="relative w-full h-full flex flex-col justify-center pointer-events-none">
      <div className={`absolute top-1/2 left-0 w-full h-px -translate-y-1/2 transition-all duration-1000 ${guess === null ? "bg-white/60 animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.5)]" : "bg-white/40"}`} />

      {/* Info Cards - Moved closer and scaled down for mobile */}
      <div className="absolute -top-16 lg:-top-24 left-4 lg:left-12 flex flex-col gap-2 lg:gap-3 z-20 scale-90 lg:scale-100 origin-bottom-left">
        {INFO_CARDS_LEFT.map((card, i) => (
          <div key={i} className={`${card.bg} ${card.textColor} px-3 lg:px-4 py-3 lg:py-4 rounded-full text-[9px] lg:text-[10px] font-bold tracking-widest w-[260px] lg:w-[300px] text-center shadow-2xl uppercase`}>
            {card.text}
          </div>
        ))}
      </div>

      <div className="absolute -top-16 lg:-top-24 right-4 lg:right-12 flex flex-col gap-2 lg:gap-3 z-20 scale-90 lg:scale-100 origin-bottom-right">
        {INFO_CARDS_RIGHT.map((card, i) => (
          <div key={i} className={`${card.bg} ${card.textColor} px-3 lg:px-4 py-3 lg:py-4 rounded-full text-[9px] lg:text-[10px] font-bold tracking-widest w-[260px] lg:w-[300px] text-center shadow-2xl uppercase`}>
            {card.text}
          </div>
        ))}
      </div>

      <div className="absolute top-1/2 left-1/2 w-px h-[150%] bg-white/40 -translate-x-1/2 -translate-y-1/2" />

      <div className="absolute top-1/2 left-0 w-full">
        {TICKS.map((pos) => (
          <div
            key={pos}
            className="absolute h-16 w-0.5 bg-secondary-background/40 -translate-y-1/2"
            style={{ left: `${pos}%` }}
          />
        ))}
      </div>

      <div className="absolute top-1/2 left-0 w-full mt-6">
        {SPECTRUM_LABELS.map((item) => (
          <div
            key={item.label}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${item.pos}%` }}
          >
            <span className="text-[10px] font-bold text-white whitespace-nowrap tracking-wider">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {[
        { pos: -1.5, size: "w-36 h-36" },
        { pos: 50, size: "w-[200px] h-[200px]" },
        { pos: 97, size: "w-52 h-52" },
      ].map((circle, idx) => (
        <div
          key={idx}
          className={`absolute top-1/2 bg-secondary-background/20 rounded-full -translate-x-1/2 -translate-y-1/2 ${circle.size}`}
          style={{ left: `${circle.pos}%` }}
        />
      ))}

      <AnimatePresence>
        {shouldShowGhost && (
          <motion.div
            transition={isDragging ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 25 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              left: `${displayGhostPos}%`,
              opacity: isRevealed ? 0.4 : 1,
              scale: 1
            }}
            exit={{ opacity: 0 }}
            className={`absolute top-1/2 -translate-x-1/2 ${guess !== null ? "-translate-y-[70%]" : "-translate-y-1/2"} flex flex-col items-center z-30`}
          >
            {!isRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: -20 }}
                className="absolute -top-12 whitespace-nowrap"
              >
                <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-[8px] font-bold text-white tracking-wider uppercase flex items-center gap-2">
                  <MousePointerClick className="w-3 h-3 text-secondary-background" />
                  <span>Drag to adjust</span>
                </div>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/20 mx-auto" />
              </motion.div>
            )}

            <div className="relative z-10 flex flex-col items-center gap-2">
              <span className="text-[8px] font-bold text-secondary-background uppercase tracking-widest bg-black/50 px-2 py-1 rounded">
                Your Guess
              </span>
              <PersonStanding className={`w-16 h-16 ${guess !== null ? "text-secondary-background drop-shadow-[0_0_15px_rgba(204,160,119,0.5)]" : "text-white/50"}`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ left: `${guess}%`, opacity: 0 }}
            animate={{ left: `${position}%`, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-[70%] flex flex-col items-center z-40"
          >
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-[8px] font-bold text-white uppercase tracking-widest bg-black/50 px-2 py-1 rounded border border-white/20 mb-2">
                Reality
              </span>
              {subtitle && (
                <span className="text-[8px] font-black text-secondary-background uppercase tracking-[0.2em] mb-1 whitespace-nowrap drop-shadow-sm">
                  {subtitle}
                </span>
              )}
              <PersonStanding className="w-16 h-16 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROTATED Reveal Reality Button & Hint - Part of the stage */}
      <div className="absolute bottom-[-100px] left-0 w-full flex justify-center z-50 pointer-events-auto">
        <AnimatePresence mode="wait">
          {guess === null ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] bg-white/5 backdrop-blur-sm px-8 py-4 rounded-full border border-white/10"
            >
              Tap to place your guess
            </motion.p>
          ) : !isRevealed && (
            <motion.button
              key="reveal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onMouseDown={(e) => { e.stopPropagation(); onReveal(); }}
              onTouchStart={(e) => { e.stopPropagation(); onReveal(); }}
              className="bg-white text-black px-12 py-5 rounded-full font-bold uppercase tracking-widest text-base shadow-2xl cursor-pointer active:scale-95 transition-all"
            >
              Reveal Reality
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

GraphContentInternal.displayName = "GraphContentInternal";
