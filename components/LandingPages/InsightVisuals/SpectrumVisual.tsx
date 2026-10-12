"use client";

import React, { useState, useRef, useEffect, useCallback, memo, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PersonStanding, MousePointerClick } from "lucide-react";
import SpectrumVisualMobile from "./SpectrumVisualMobile";

interface SpectrumVisualProps {
  position?: number; // 0 to 100 (The actual result)
  subtitle?: string; // e.g. "people pleasing engaging"
}

export default function SpectrumVisual({
  position = 0,
  subtitle,
}: SpectrumVisualProps) {
  const [guess, setGuess] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHoveringContainer, setIsHoveringContainer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculate = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Hard cutoff at 1024px as requested.
      // 1024px and smaller shows the "Tap to Interact" card.
      setIsMobile(width <= 1024);
      setScale(width < 1280 ? Math.max(0.3, (width - 40) / 1200) : 1);
    };
    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, []);

  const getPositionFromMouse = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isRevealed) return;
    setIsMouseDown(true);
    setGuess(getPositionFromMouse(e));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isRevealed) return;
    const pos = getPositionFromMouse(e);
    setHoverPosition(pos);
    if (isMouseDown) {
      if (!isDragging) setIsDragging(true);
      setGuess(pos);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsMouseDown(false);
      setIsDragging(false);
    };
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isMouseDown && !isRevealed) {
        if (!isDragging) setIsDragging(true);
        setGuess(getPositionFromMouse(e));
      }
    };
    if (isMouseDown) {
      window.addEventListener("mouseup", handleGlobalMouseUp);
      window.addEventListener("mousemove", handleGlobalMouseMove);
    }
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [isMouseDown, isDragging, isRevealed, getPositionFromMouse]);

  if (isMobile) {
    return <SpectrumVisualMobile position={position} subtitle={subtitle} />;
  }

  return (
    <div
      className="w-full bg-black rounded-[40px] overflow-hidden relative flex flex-col items-center justify-center select-none touch-none py-16 md:py-32"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsHoveringContainer(true)}
      onMouseLeave={() => {
        setIsHoveringContainer(false);
        if (guess === null) setHoverPosition(null);
      }}
      style={{ cursor: isRevealed ? "default" : isDragging ? "grabbing" : "crosshair" }}
    >
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-secondary-background/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-full max-w-sm flex justify-between pointer-events-none opacity-20">
        <div className="flex items-center">
          <svg width="150" height="24" viewBox="0 0 150 24" fill="none">
            <path d="M150 12 H 0 M 0 12 L 12 4 M 0 12 L 12 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex items-center">
          <svg width="150" height="24" viewBox="0 0 150 24" fill="none">
            <path d="M0 12 H 150 M 150 12 L 138 4 M 150 12 L 138 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div
        className="relative flex items-center justify-center"
        style={{ width: 1200 * scale, height: 500 * scale }}
      >
        <GraphContent
          ref={containerRef}
          isActive={isHoveringContainer}
          currentScale={scale}
          showInfoCards={true}
          guess={guess}
          hoverPosition={hoverPosition}
          isDragging={isDragging}
          isRevealed={isRevealed}
          position={position}
          subtitle={subtitle}
        />
      </div>

      <div className="absolute bottom-12 left-0 w-full flex justify-center z-50">
        <AnimatePresence>
          {guess !== null && !isRevealed && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIsRevealed(true);
              }}
              className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-secondary-background transition-colors duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)] cursor-pointer"
            >
              Reveal Reality
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const GraphContent = memo(forwardRef<HTMLDivElement, {
  isActive: boolean,
  guess: number | null,
  hoverPosition: number | null,
  isDragging: boolean,
  isRevealed: boolean,
  position: number,
  subtitle?: string,
  currentScale: number,
  showInfoCards?: boolean
}>(({
  isActive,
  guess,
  hoverPosition,
  isDragging,
  isRevealed,
  position,
  subtitle,
  currentScale,
  showInfoCards = true
}, ref) => {
  const displayGhostPos = (guess !== null) ? guess : hoverPosition;
  const shouldShowGhost = displayGhostPos !== null && (isActive || guess !== null);

  return (
    <div
      ref={ref}
      className="relative w-[1200px] h-[500px] flex flex-col justify-center pointer-events-auto"
      style={{ transform: `scale(${currentScale})`, transformOrigin: "center center" }}
    >
      <div className={`absolute top-1/2 left-0 w-full h-px -translate-y-1/2 transition-all duration-1000 ${guess === null ? "bg-white/60 animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.5)]" : "bg-white/40"}`} />

      {showInfoCards && (
        <div className="absolute -top-24 left-12 flex flex-col gap-3 z-20">
          {[
            { text: "SITUATIONAL AWARENESS INCREASES", bg: "bg-secondary-background", textColor: "text-black" },
            { text: "SELF-TRUST INCREASES", bg: "bg-[#1A1A1A]", textColor: "text-white" },
            { text: "INDEPENDENCE INCREASES", bg: "bg-[#4B4B4B]", textColor: "text-white" },
            { text: "WORK OR PURPOSE ORIENTATION INCREASES", bg: "bg-white", textColor: "text-black" },
          ].map((card, i) => (
            <div key={i} className={`${card.bg} ${card.textColor} px-4 py-4 rounded-full text-[10px] font-bold tracking-widest w-[300px] text-center shadow-2xl uppercase`}>
              {card.text}
            </div>
          ))}
        </div>
      )}

      {showInfoCards && (
        <div className="absolute -top-24 right-12 flex flex-col gap-3 z-20">
          {[
            { text: "SITUATIONAL AWARENESS DECREASES", bg: "bg-secondary-background", textColor: "text-black" },
            { text: "SELF-TRUST DECREASES", bg: "bg-[#1A1A1A]", textColor: "text-white" },
            { text: "INDEPENDENCE DECREASES", bg: "bg-[#4B4B4B]", textColor: "text-white" },
            { text: "WORK OR PURPOSE ORIENTATION DECREASES", bg: "bg-white", textColor: "text-black" },
          ].map((card, i) => (
            <div key={i} className={`${card.bg} ${card.textColor} px-4 py-4 rounded-full text-[10px] font-bold tracking-widest w-[300px] text-center shadow-2xl uppercase`}>
              {card.text}
            </div>
          ))}
        </div>
      )}

      <div className="absolute top-1/2 left-1/2 w-px h-[150%] bg-white/40 -translate-x-1/2 -translate-y-1/2" />

      <div className="absolute top-1/2 left-0 w-full">
        {[10, 20, 30, 70, 90].map((pos) => (
          <div
            key={pos}
            className="absolute h-16 w-0.5 bg-secondary-background/40 -translate-y-1/2"
            style={{ left: `${pos}%` }}
          />
        ))}
      </div>

      <div className="absolute top-1/2 left-0 w-full mt-6">
        {[
          { label: "A- CTRL OVERT", pos: 5 },
          { label: "A- CTRL SWITCH", pos: 15 },
          { label: "A- CTRL COVERT", pos: 25 },
          { label: "A- HIAT", pos: 40 },
          { label: "REJ- LOVE & SAFE", pos: 60 },
          { label: "REJ- LOVE", pos: 80 },
          { label: "CHAOS - REJ", pos: 95 },
        ].map((item) => (
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
                <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-xs font-bold text-white tracking-wider uppercase flex items-center gap-2">
                  {guess === null ? (
                    <>
                      <MousePointerClick className="w-3 h-3 text-secondary-background" />
                      <span>Click to set</span>
                    </>
                  ) : (
                    <span>Drag to adjust</span>
                  )}
                </div>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/20 mx-auto" />
              </motion.div>
            )}

            <div className="relative z-10 flex flex-col items-center gap-2">
              {guess !== null && (
                <span className="text-[10px] font-bold text-secondary-background uppercase tracking-widest bg-black/50 px-2 py-1 rounded">
                  Your Guess
                </span>
              )}
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
              <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/50 px-2 py-1 rounded border border-white/20 mb-2">
                Reality
              </span>
              {subtitle && (
                <span className="text-[9px] font-black text-secondary-background uppercase tracking-[0.2em] mb-1 whitespace-nowrap drop-shadow-sm">
                  {subtitle}
                </span>
              )}
              <PersonStanding className="w-16 h-16 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}));

GraphContent.displayName = "GraphContent";
