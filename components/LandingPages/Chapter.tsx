"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { CheckCircle2, Lock, ArrowDown } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LockedChapterCard from "./LockedChapterCard";
import PredMindVideoPlayer from "./PredMindVideoPlayer";

gsap.registerPlugin(ScrollTrigger);

interface ChapterProps {
  id: string;
  title: string;
  subtitle: string;
  description: string[];
  videoUrl: string;
  index: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  onComplete: () => void;
  children?: React.ReactNode; // Insights visual goes here
}

export default function Chapter({
  id,
  title,
  subtitle,
  description,
  videoUrl,
  index,
  isUnlocked,
  isCompleted,
  onComplete,
  children,
}: ChapterProps) {
  const [isVideoWatched, setIsVideoWatched] = useState(isCompleted);
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;

    const ctx = gsap.context(() => {
      gsap.to(bg, {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // Refresh ScrollTrigger when insights are revealed
  useEffect(() => {
    if (isVideoWatched) {
      ScrollTrigger.refresh();
    }
  }, [isVideoWatched]);

  const handleVideoEnd = () => {
    setIsVideoWatched(true);
    onComplete();
  };

  const scrollToInsights = () => {
    const insights = document.getElementById(`${id}-insights`);
    if (insights) {
      insights.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // When locked, render just the centered card — no tall dimmed content to
  // scroll, and no viewport-height floor padding out empty space below it.
  if (!isUnlocked) {
    return (
      <section
        id={id}
        className="py-24 flex items-center justify-center relative bg-[#F7F2EA]"
      >
        <LockedChapterCard
          currentChapterTitle={title}
          previousChapterTitle={`Chapter ${index}`}
          previousChapterId={`chapter-${index - 1}`}
        />
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`min-h-screen py-32 px-6 md:px-24 flex flex-col justify-center relative transition-opacity duration-1000`}
    >
      <div className={`${isUnlocked ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
      {/* Background Parallax Layer */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div
          ref={bgRef}
          className="absolute inset-0 opacity-[0.03] scale-110"
          style={{
            backgroundImage: `url('/background/predmind-thread-bg.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(204,160,119,0.05)_0%,transparent_70%)]" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        {/* Left Side: Content */}
        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-secondary-background font-serif italic text-xl md:text-2xl mb-4 block">
              Chapter {String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="text-5xl md:text-7xl font-bold text-primary-text leading-tighter tracking-tighter">
              {title}
            </h2>
            <p className="text-xl md:text-2xl text-black/50 mt-4 font-medium tracking-tight">
              {subtitle}
            </p>
          </motion.div>

          <div className="space-y-4">
            {description.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex gap-6 items-start group"
              >
                <span className="text-xl font-serif font-semibold italic text-secondary-background mt-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-lg text-black/50 font-medium leading-normal tracking-tight">
                  {item}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side: Video Player */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="w-full flex justify-center"
          >
            <PredMindVideoPlayer
              src={videoUrl}
              onComplete={handleVideoEnd}
              isCompleted={isVideoWatched}
            />
          </motion.div>

          {/* Scroll Indicator after video completion */}
          <AnimatePresence>
            {isVideoWatched && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={scrollToInsights}
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-secondary-background font-bold group"
              >
                <span className="text-[10px] uppercase tracking-widest">
                  View Your Insights
                </span>
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results Section (Unlocked after video) */}
      <AnimatePresence>
        {isVideoWatched && (
          <motion.div
            id={`${id}-insights`}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mt-48 w-full scroll-mt-32"
          >
            <div className="relative">
              {/* Divider with Icon */}
              <div className="flex items-center gap-8 mb-20">
                <div className="h-px flex-1 bg-primary-text/10" />
                <div className="flex items-center gap-3 px-6 py-3 bg-secondary-background text-white rounded-full shadow-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    Personalized Results Unlocked
                  </span>
                </div>
                <div className="h-px flex-1 bg-primary-text/10" />
              </div>

              {/* The Insight Visual */}
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
    </section>
  );
}
