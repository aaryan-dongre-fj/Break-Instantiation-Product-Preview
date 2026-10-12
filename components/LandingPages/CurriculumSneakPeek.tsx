"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Play, BookOpen, RotateCcw } from "lucide-react";
import CurriculumModuleVideo from "./CurriculumModuleVideo";

interface Lesson {
  title: string;
  duration: string;
}

interface Module {
  id: string;
  number: string;
  title: string;
  description: string;
  lessons: Lesson[];
  stats: {
    lessons: number;
    hours: string;
    resources: number;
  };
  video: string;
  color: string;
}

const modules: Module[] = [
  {
    id: "discover",
    number: "01",
    title: "Discover",
    description: "Map your core behavioral patterns.",
    stats: { lessons: 14, hours: "5.5", resources: 8 },
    video: "/eye-static.mp4",
    color: "#cca077",
    lessons: [
      { title: "Recovering Lost Memories", duration: "8 min" },
      { title: "Spiritual Intelligence", duration: "23 min" },
      { title: "Stop Sign Technique + Thought Mapping", duration: "6 min" },
    ],
  },
  {
    id: "connect",
    number: "02",
    title: "Connect",
    description: "Connect patterns to your reality.",
    stats: { lessons: 11, hours: "4.2", resources: 6 },
    video: "/fingerprints.mp4",
    color: "#8a7b6a",
    lessons: [
      { title: "Anxiety, Intrusive Thoughts & OCD", duration: "40 min" },
      { title: "Relationship Dynamics", duration: "21 min" },
      { title: "Narcissist + The Victim", duration: "40 min" },
    ], 
  },
  {
    id: "rewire",
    number: "03",
    title: "Practice",
    description: "Create new, permanent baselines.",
    stats: { lessons: 16, hours: "6.8", resources: 12 },
    video: "/eye-closeup.mp4",
    color: "#4a443f",
    lessons: [
      { title: "Communication Without The Fight", duration: "50 min" },
      { title: "Toxic Relationships + Gaslighting", duration: "18 min" },
      { title: "Food + Sex", duration: "29 min" },
    ],
  },
];

export default function CurriculumSneakPeek() {
  const [flippedId, setFlippedId] = useState<string | null>(null);

  const scrollToPricing = (e: React.MouseEvent) => {
    e.stopPropagation();
    const pricingSection = document.getElementById("pricing-section");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full py-12 flex flex-col items-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl px-4 md:px-0">
        {modules.map((module) => {
          const isFlipped = flippedId === module.id;
          const remainingCount = module.stats.lessons - 3;

          return (
            <div key={module.id} className="relative aspect-[4/5] perspective-1000">
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-full h-full relative preserve-3d cursor-pointer"
                onClick={() => setFlippedId(isFlipped ? null : module.id)}
              >
                {/* FRONT SIDE */}
                <div className="absolute inset-0 backface-hidden rounded-[2rem] overflow-hidden bg-black border border-white/5 shadow-xl group">
                  <div className="absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-40">
                    <CurriculumModuleVideo
                      videoUrl={module.video}
                      isActive={!isFlipped}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  </div>

                  <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                    <span className="text-white/40 font-mono text-[10px] md:text-sm tracking-[0.3em] mb-2">{module.number}</span>
                    <h4 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tighter">{module.title}</h4>
                    <p className="text-white/70 text-xs md:text-sm line-clamp-2 mb-6 font-medium leading-relaxed">
                      {module.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-[9px] md:text-[10px] font-black tracking-widest text-white/90 uppercase border-t border-white/10 pt-6">
                      {/* <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 md:w-3.5 md:h-3.5" /> {module.stats.hours}H</span> */}
                      <span className="flex items-center gap-1.5"><BookOpen className="w-3 h-3 md:w-3.5 md:h-3.5" /> {module.stats.lessons} Lessons</span>
                    </div>

                    <div className="mt-6 flex items-center justify-center py-3 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-white group-hover:text-black transition-all duration-300">
                      Explore Curriculum
                    </div>
                  </div>
                  
                  <div className="absolute top-6 right-6 w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60">
                    <Lock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                </div>

                {/* BACK SIDE (flipped) - Compact Layout */}
                <div 
                  className="absolute inset-0 backface-hidden rounded-[2rem] overflow-hidden bg-[#0a0a0a] border border-white/10 shadow-2xl p-6 md:p-7 flex flex-col"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex flex-col">
                      <span className="text-secondary-background font-mono text-[9px] tracking-[0.3em] uppercase mb-0.5">Module {module.number}</span>
                      <h4 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase leading-none">{module.title}</h4>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-4 flex-1">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">Curriculum Highlights</h5>
                    {module.lessons.map((lesson, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-5 h-5 rounded-full bg-secondary-background/20 flex items-center justify-center shrink-0">
                            <Play className="w-2 h-2 text-secondary-background fill-current" />
                          </div>
                          <span className="text-[11px] md:text-xs font-bold text-white/90 line-clamp-1">{lesson.title}</span>
                        </div>
                        {/* <span className="text-[10px] font-bold text-white/20 whitespace-nowrap shrink-0 ml-2">{lesson.duration}</span> */}
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t border-white/5 text-center mt-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                        + {remainingCount} more modules
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <button 
                      onClick={scrollToPricing}
                      className="w-full py-3.5 md:py-4 rounded-full bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-secondary-background hover:text-white transition-all shadow-xl active:scale-95"
                    >
                      <Lock className="w-3 h-3" /> Enroll to Unlock
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* <div className="mt-12 text-black/10 font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-4">
        <div className="w-16 h-px bg-black/5" />
        Click a card to reveal lessons
        <div className="w-16 h-px bg-black/5" />
      </div> */}

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1500px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
