"use client";

import React, { useRef, useState, useEffect } from "react";
import { PersonStanding } from "lucide-react";

interface StaticSpectrumVisualProps {
  position?: number; // 0 to 100
  subtitle?: string;
}

const TICKS = [10, 20, 30, 70, 90];

const LABELS = [
  { label: "A- CTRL OVERT", pos: 5 },
  { label: "A- CTRL SWITCH", pos: 15 },
  { label: "A- CTRL COVERT", pos: 25 },
  { label: "A- HIAT", pos: 40 },
  { label: "REJ- LOVE & SAFE", pos: 60 },
  { label: "REJ- LOVE", pos: 80 },
  { label: "CHAOS - REJ", pos: 95 },
];

const CIRCLES = [
  { pos: -1.5, size: "w-36 h-36" },
  { pos: 50, size: "w-[200px] h-[200px]" },
  { pos: 97, size: "w-52 h-52" },
];

const LEFT_CARDS = [
  { text: "SITUATIONAL AWARENESS INCREASES", bg: "bg-secondary-background", textColor: "text-black" },
  { text: "SELF-TRUST INCREASES", bg: "bg-[#1A1A1A]", textColor: "text-white" },
  { text: "INDEPENDENCE INCREASES", bg: "bg-[#4B4B4B]", textColor: "text-white" },
  { text: "WORK OR PURPOSE ORIENTATION INCREASES", bg: "bg-white", textColor: "text-black" },
];

const RIGHT_CARDS = [
  { text: "SITUATIONAL AWARENESS DECREASES", bg: "bg-secondary-background", textColor: "text-black" },
  { text: "SELF-TRUST DECREASES", bg: "bg-[#1A1A1A]", textColor: "text-white" },
  { text: "INDEPENDENCE DECREASES", bg: "bg-[#4B4B4B]", textColor: "text-white" },
  { text: "WORK OR PURPOSE ORIENTATION DECREASES", bg: "bg-white", textColor: "text-black" },
];

export default function StaticSpectrumVisual({ position = 0, subtitle }: StaticSpectrumVisualProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const calculate = () => {
      if (!wrapperRef.current) return;
      const w = wrapperRef.current.clientWidth;
      setScale(Math.max(0.3, Math.min(1, w / 1200)));
    };
    calculate();
    const ro = new ResizeObserver(calculate);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  const showCards = scale >= 0.48;

  return (
    <div
      ref={wrapperRef}
      className="w-full bg-black rounded-[32px] overflow-hidden relative flex items-center justify-center select-none"
      style={{ height: Math.round((showCards ? 700 : 500) * scale) }}
    >
      {/* Background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-secondary-background/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Scaled inner canvas */}
      <div
        className="relative w-[1200px] h-[500px] flex flex-col justify-center"
        style={{ transform: `scale(${scale})`, transformOrigin: "center center", flexShrink: 0 }}
      >
        {/* Horizontal axis */}
        <div className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2 bg-white/60" />

        {/* Info cards — left */}
        {showCards && (
          <div className="absolute -top-24 left-12 flex flex-col gap-3 z-20">
            {LEFT_CARDS.map((card, i) => (
              <div
                key={i}
                className={`${card.bg} ${card.textColor} px-4 py-4 rounded-full text-[10px] font-bold tracking-widest w-[300px] text-center shadow-2xl uppercase`}
              >
                {card.text}
              </div>
            ))}
          </div>
        )}

        {/* Info cards — right */}
        {showCards && (
          <div className="absolute -top-24 right-12 flex flex-col gap-3 z-20">
            {RIGHT_CARDS.map((card, i) => (
              <div
                key={i}
                className={`${card.bg} ${card.textColor} px-4 py-4 rounded-full text-[10px] font-bold tracking-widest w-[300px] text-center shadow-2xl uppercase`}
              >
                {card.text}
              </div>
            ))}
          </div>
        )}

        {/* Vertical center axis */}
        <div className="absolute top-1/2 left-1/2 w-px h-[150%] bg-white/40 -translate-x-1/2 -translate-y-1/2" />

        {/* Ticks */}
        <div className="absolute top-1/2 left-0 w-full">
          {TICKS.map((pos) => (
            <div
              key={pos}
              className="absolute h-16 w-0.5 bg-secondary-background/40 -translate-y-1/2"
              style={{ left: `${pos}%` }}
            />
          ))}
        </div>

        {/* Labels */}
        <div className="absolute top-1/2 left-0 w-full mt-6">
          {LABELS.map((item) => (
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

        {/* Decorative circles */}
        {CIRCLES.map((circle, idx) => (
          <div
            key={idx}
            className={`absolute top-1/2 bg-secondary-background/20 rounded-full -translate-x-1/2 -translate-y-1/2 ${circle.size}`}
            style={{ left: `${circle.pos}%` }}
          />
        ))}

        {/* Person indicator — static, always at position */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-[70%] flex flex-col items-center z-40"
          style={{ left: `${position}%` }}
        >
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
      </div>
    </div>
  );
}
