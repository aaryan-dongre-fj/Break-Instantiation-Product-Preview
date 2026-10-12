"use client";

import { motion } from "framer-motion";
import { PersonStanding } from "lucide-react";
import React from "react";

interface DashboardSpectrumVisualProps {
  position?: number; // 0 to 100
}

export default function DashboardSpectrumVisual({ 
  position = 0,
}: DashboardSpectrumVisualProps) {
  
  return (
    <div className="w-full py-16 px-0 bg-black rounded-[32px] overflow-hidden relative min-h-[500px] flex flex-col items-center justify-center select-none">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-secondary-background/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-white/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Graph Container */}
      <div className="relative w-full max-w-5xl h-[300px] flex flex-col justify-center px-12 pointer-events-none">
        {/* Horizontal Axis */}
        <div className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2 bg-white/40" />

        {/* Vertical Axis (Center) */}
        <div className="absolute top-1/2 left-1/2 w-px h-[120%] bg-white/40 -translate-x-1/2 -translate-y-1/2" />

        {/* Ticks on Horizontal Axis */}
        <div className="absolute top-1/2 left-0 w-full">
          {[10, 20, 30, 70, 90].map((pos) => (
            <div
              key={pos}
              className="absolute h-8 w-0.5 bg-secondary-background/40 -translate-y-1/2"
              style={{ left: `${pos}%` }}
            />
          ))}
        </div>

        {/* Labels below the horizontal axis */}
        <div className="absolute top-1/2 left-0 w-full mt-4">
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
              <span className="text-[8px] font-bold text-white/40 whitespace-nowrap tracking-wider uppercase">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Decorative Circles */}
        {[
          { pos: 0, size: "w-20 h-20" },
          { pos: 50, size: "w-32 h-32" },
          { pos: 100, size: "w-24 h-24" },
        ].map((circle, idx) => (
          <div
            key={idx}
            className={`absolute top-1/2 bg-secondary-background/10 rounded-full -translate-x-1/2 -translate-y-1/2 ${circle.size}`}
            style={{ left: `${circle.pos}%` }}
          />
        ))}

        {/* --- REALITY (ACTUAL RESULT) --- */}
        <motion.div
            initial={{ left: "50%", opacity: 0 }}
            animate={{ left: `${position}%`, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-40"
        >
            <div className="relative z-10 flex flex-col items-center">
                <PersonStanding className="w-12 h-12 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
            </div>
        </motion.div>
      </div>
    </div>
  );
}
