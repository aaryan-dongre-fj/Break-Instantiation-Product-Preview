"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface ProgressNavProps {
  activeSection: number;
  completedSections: number[];
  onSectionClick: (index: number) => void;
  unlockedIndex: number;
  isVisible: boolean;
}

const sections = [
  "Source Belief",
  "Emotional Cycle",
  "Timeline",
  "Rebellion Zones",
];

export default function ProgressNav({
  activeSection,
  completedSections,
  onSectionClick,
  unlockedIndex,
  isVisible,
}: ProgressNavProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="scale-[0.8] fixed top-12 left-1/2 -translate-x-1/2 z-[100] px-2 py-2 bg-[#F2EDE4] border border-primary-text/10 rounded-full flex items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)] pointer-events-auto"
        >
          {sections.map((title, index) => {
            const isCompleted = completedSections.includes(index);
            const isActive = activeSection === index;
            const isLocked = index > unlockedIndex;

            return (
              <div key={index} className="flex items-center">
                <button
                  onClick={() => onSectionClick(index)}
                  className={`
                    relative flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-500
                    ${
                      isActive
                        ? "text-white"
                        : "hover:bg-black/5 text-primary-text"
                    }
                    ${
                      isLocked
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  `}
                >
                  <div
                    className={`
                      w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-extrabold border-2
                      ${
                        isCompleted
                          ? "bg-secondary-background border-secondary-background text-white"
                          : isActive
                          ? "bg-white border-white text-secondary-background"
                          : "border-primary-text/40"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" strokeWidth={3} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-[14px] uppercase tracking-[0.2em] font-black whitespace-nowrap hidden xl:block">
                    {title}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-secondary-background rounded-full -z-10"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </button>

                {index < sections.length - 1 && (
                  <div className="w-8 h-0.5 bg-primary-text/10 mx-1" />
                )}
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
