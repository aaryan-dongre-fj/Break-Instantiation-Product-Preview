"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, RotateCcw } from "lucide-react";

interface InsightCardStackProps {
  title: string;
  subtitle: string;
  points: string[];
}

export default function InsightCardStack({ title, subtitle, points }: InsightCardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % points.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + points.length) % points.length);
  };

  const isLast = currentIndex === points.length - 1;

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Card Stack Container */}
      <motion.div 
        whileHover="hover"
        className="relative group"
      >
        {/* Background Cards (Visual Depth) - Animated spread on hover */}
        <motion.div 
          variants={{
            hover: { y: 24, scale: 0.94, opacity: 0.3 }
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 translate-y-4 scale-[0.92] opacity-20 bg-black rounded-[40px] blur-sm pointer-events-none" 
        />
        <motion.div 
          variants={{
            hover: { y: 12, scale: 0.98, opacity: 0.5 }
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 translate-y-2 scale-[0.96] opacity-40 bg-[#1A1A1A] border border-white/5 rounded-[40px] pointer-events-none" 
        />

        {/* Main Card - Fixed Height enforced here */}
        <motion.div
          variants={{
            hover: { y: -10, scale: 1.01 }
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-[#0F0F0F] rounded-[40px] p-10 md:p-14 shadow-2xl border border-white/10 min-h-[580px] flex flex-col justify-between overflow-hidden"
        >
          {/* Internal Glow Effect */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-secondary-background/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 blur-[80px] rounded-full pointer-events-none" />

          {/* Top Info */}
          <div className="flex justify-between items-center relative z-10">
            <span className="text-sm font-mono text-secondary-background font-bold tracking-widest">
                {String(currentIndex + 1).padStart(2, "0")} <span className="opacity-20 text-white mx-1">/</span> {String(points.length).padStart(2, "0")}
            </span>
            
            <div className="flex gap-2">
              <button 
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm hover:bg-secondary-background hover:border-secondary-background transition-all duration-500 active:scale-90 group/prev"
              >
                <ChevronLeft className="w-5 h-5 text-white group-hover/prev:-translate-x-0.5 transition-transform" />
              </button>
              <button 
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm hover:bg-secondary-background hover:border-secondary-background transition-all duration-500 active:scale-90 group/next"
              >
                {isLast ? (
                  <RotateCcw className="w-4 h-4 text-white group-hover/next:rotate-[-45deg] transition-transform duration-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-white group-hover/next:translate-x-0.5 transition-transform" />
                )}
              </button>
            </div>
          </div>

          {/* Content Area (Stable Height) */}
          <div className="relative flex-1 flex items-center py-6 z-10">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction * 30, filter: "blur(8px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -direction * 30, filter: "blur(8px)" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <span className="text-2xl font-serif font-semibold italic text-secondary-background mt-0.5">
                      {String(currentIndex + 1).padStart(2, "0")}
                    </span>
                    <p className="text-2xl text-white font-[600] leading-[1.2] tracking-tight">
                      {points[currentIndex]}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Progress Navigation */}
          <div className="relative z-10 pt-8 mt-auto">
             <div className="flex items-center justify-end mb-4">
                <span className="text-[12px] font-bold text-white/50 uppercase tracking-[0.2em] transition-colors duration-500">
                   {isLast ? "Restart Sequence" : "Next Zone"}
                </span>
             </div>

             {/* Minimalist Dotted Progress */}
             <div className="flex gap-2 h-[4px] w-full">
                {points.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-full rounded-full transition-all duration-1000 ease-out flex-1 ${
                      i === currentIndex 
                        ? "bg-secondary-background shadow-[0_0_15px_rgba(204,160,119,0.6)]" 
                        : i < currentIndex 
                          ? "bg-white/80" 
                          : "bg-white/40"
                    }`}
                  />
                ))}
             </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
