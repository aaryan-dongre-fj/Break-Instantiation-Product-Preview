"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import PredMindMuxPlayer from "../PredMindMuxPlayer";
import { useMuxTokens } from "../MuxTokenContext";

type TimelineVisualProps = {
  timelineProfileData?: any;
};

const timelineItems = [
  { key: 'primary', label: "1+C", color: "bg-[#B48F6F]", textColor: "text-black" },
  { key: 'secondary', label: "5+/-", color: "bg-[#2A2A2A]", textColor: "text-white/60" },
  { key: 'tertiary_1', label: "4-/+", color: "bg-[#555555]", textColor: "text-white/80" },
  { key: 'tertiary_2', label: "6+/-", color: "bg-[#FAF7F2]", textColor: "text-black/80" },
];

export default function TimelineVisual({ timelineProfileData }: TimelineVisualProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { generalMuxUrls, onBeforePlay, onTokenError } = useMuxTokens();

  const tp = timelineProfileData?.timeline_profile;

  // Labels from timeline profile API; hover bullets from the same `profile.text` arrays
  const dynamicTimelineItems = [
    {
      label: tp?.primary?.timeline_number || "",
      points: tp?.primary?.profile?.text || [],
      color: timelineItems[0].color,
      textColor: timelineItems[0].textColor,
    },
    {
      label: tp?.secondary?.timeline_number || "",
      points: tp?.secondary?.profile?.text || [],
      color: timelineItems[1].color,
      textColor: timelineItems[1].textColor,
    },
    {
      label: tp?.tertiary_1?.timeline_number || "",
      points: tp?.tertiary_1?.profile?.text || [],
      color: timelineItems[2].color,
      textColor: timelineItems[2].textColor,
    },
    {
      label: tp?.tertiary_2?.timeline_number || "",
      points: tp?.tertiary_2?.profile?.text || [],
      color: timelineItems[3].color,
      textColor: timelineItems[3].textColor,
    },
  ];

  return (
    <div className="w-full h-auto min-h-[700px] flex flex-col lg:flex-row rounded-[40px] overflow-hidden bg-black relative">
      {/* Left Sidebar Content - Centered Vertically */}
      <div className="w-full lg:w-[480px] p-10 md:p-16 flex flex-col justify-center items-center lg:items-start z-10 space-y-12 text-center lg:text-left">
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
            Timeline Behavior <span className="text-secondary-background">Pattern</span>
          </h2>
        </div>

        {/* Watchable Video in Summary */}
        <div className="w-full max-w-[320px] mx-auto lg:mx-0">
          <PredMindMuxPlayer
            url={generalMuxUrls['timeline_summary_video']?.playback_url}
            thumbnailUrl={generalMuxUrls['timeline_summary_video']?.thumbnail_gif_url}
            onBeforePlay={onBeforePlay}
            onTokenError={onTokenError}
            className="w-full border-0 shadow-2xl rounded-3xl"
          />
        </div>
      </div>

      {/* Right Visual Content - Dynamic Height Items */}
      <motion.div 
        layout
        className="flex-1 flex flex-col justify-center items-center lg:items-start xl:items-center gap-3 p-8 md:p-16 relative"
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-l from-secondary-background/5 to-transparent pointer-events-none" />

        {dynamicTimelineItems.map((item, i) => {
          const isHovered = hoveredIndex === i;
          
          return (
            <motion.div
              key={i}
              layout="position"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                layout: { 
                  type: "spring", 
                  stiffness: 250, 
                  damping: 30,
                },
                opacity: { duration: 0.6, delay: i * 0.1 },
                x: { duration: 0.6, delay: i * 0.1 },
              }}
              className={`w-full max-w-2xl ${item.color} rounded-[2rem] flex flex-col justify-start px-10 py-8 relative overflow-hidden cursor-pointer shadow-lg`}
              style={{ minHeight: "112px" }}
            >
              {/* Subtle Darkening Overlay */}
              <div className={`absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`} />
              
              <div className="flex flex-col relative z-10 w-full h-full">
                <span
                  className={`text-3xl md:text-4xl font-bold ${item.textColor} tracking-tight`}
                >
                  {item.label}
                </span>

                <AnimatePresence>
                  {isHovered && item.points.length > 0 && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ 
                        height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                        opacity: { duration: 0.3, delay: 0.1 } 
                      }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 space-y-3 pb-2">
                        <div className={`w-full h-px ${item.textColor === 'text-black' ? 'bg-black/10' : 'bg-white/10'} mb-4`} />
                        {item.points.map((point: string, pIdx: number) => (
                          <div key={pIdx} className="flex gap-3 items-baseline">
                            <span className={`text-md font-bold font-serif italic ${item.textColor} opacity-40 flex-shrink-0`}>
                              {String(pIdx + 1).padStart(2, "0")}
                            </span>
                            <p className={`text-base md:text-lg font-medium leading-tight ${item.textColor} opacity-80`}>
                              {point.charAt(0).toUpperCase() + point.slice(1)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
