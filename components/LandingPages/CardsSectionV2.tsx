"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProgressNav from "./ProgressNav";
import Chapter from "./Chapter";
import ChapterOne from "./ChapterOne";
import ChapterTwo from "./ChapterTwo";
import ChapterThree from "./ChapterThree";
import ChapterFour from "./ChapterFour";
import SourceBeliefSpectrumResults from "./SourceBeliefSpectrumResults";
import CycleVisual from "./InsightVisuals/CycleVisual";
import TimelineVisual from "./InsightVisuals/TimelineVisual";
import RebellionZonesResults from "./RebellionZonesResults";
import HowToRewire from "./HowToRewire";
import SectionCardV2 from "./SectionCardV2";
import SummaryDashboard from "./SummaryDashboard/SummaryDashboard";

function loadProgress() {
  try {
    const saved = localStorage.getItem("bpm_progress");
    if (!saved) return { completed: [] as number[], unlocked: 0, journeyStarted: false };
    const { completed, unlocked, journeyStarted } = JSON.parse(saved);
    return {
      completed: (completed as number[]) || [],
      unlocked: (unlocked as number) || 0,
      journeyStarted: (journeyStarted as boolean) || false,
    };
  } catch {
    return { completed: [] as number[], unlocked: 0, journeyStarted: false };
  }
}

gsap.registerPlugin(ScrollTrigger);

const sections = [
  {
    title: "What your results say about you",
    subtitle: "The Foundation of Your Reality",
    description: [
      "Every human filters life through a subconscious belief formed in early childhood.",
      'This belief becomes the "operating system" behind your perception, emotional reactions, and decision-making.',
      "These core beliefs fall along a predictable spectrum — from Abandoned on the left to Rejection/Chaos on the right.",
      "Your brain uses this belief to interpret safety, connection, conflict, and love.",
      "Most people misidentify their own placement because they evaluate themselves based on who they want to be, not what their pattern actually does.",
    ],
    videoUrl: "/6.webm",
  },
  {
    title: "Emotional Addiction Cycle",
    subtitle: "The Three Stages of Your Pattern",
    description: [
      "Emotions do not happen randomly — they follow a predictable 3-stage cycle.",
      "Every pattern begins with an Origin Emotion, shifts into a Protective Emotion, and eventually escalates into a Late-Stage Emotion.",
      "This cycle becomes addictive over time because it creates emotional familiarity, even if it creates chaos or conflict.",
      "The cycle determines how you react, withdraw, pursue, escalate, or shut down.",
      "Without understanding this sequence, it's almost impossible to change the behaviors tied to it.",
    ],
    videoUrl: "/7.webm",
  },
  {
    title: "Timeline Imbalance",
    subtitle: "Mapping Your Behavior Flow",
    description: [
      "Every pattern expresses itself along a timeline of behavior.",
      "The Timeline consists of four predictable positions: Primary Response, Secondary Response, Tertiary 1, and Tertiary 2.",
      "These markers explain why certain situations feel harder than others, why you get stuck in repeat arguments, and why you shut down, escalate, avoid, or over-control.",
      "Timeline reveals where you lose traction and why change hasn't lasted.",
    ],
    videoUrl: "/1.webm",
  },
  {
    title: "Rebellion Zones",
    subtitle: "The Emotional Pressure Points",
    description: [
      "Rebellion Zones are the emotional pressure points where your pattern resists change the most — and where rewiring must occur.",
      "These zones activate the AMCC, the part of the brain responsible for overriding impulsive emotional patterns.",
      "Each result type has predictable pressure points based on source belief, emotional cycle, and timeline positions.",
      "When you know these zones, you stop trying to fix the whole pattern at once and focus on the exact emotional entry points that create real change.",
    ],
    videoUrl: "/5.webm",
  },
];

const BASE_HEIGHT = 480;
const HOVERED_HEIGHT = 600;
const NEIGHBOR_HEIGHT = 520;
const MOBILE_CARD_HEIGHT_MIN = 240;
const MOBILE_CARD_HEIGHT_MAX = 400;
const MOBILE_CARD_HEIGHT_VH = 0.38;
const TABLET_HEIGHT = 380;

function getMobileCardHeight(viewportHeight: number) {
  return Math.round(
    Math.min(
      Math.max(viewportHeight * MOBILE_CARD_HEIGHT_VH, MOBILE_CARD_HEIGHT_MIN),
      MOBILE_CARD_HEIGHT_MAX
    )
  );
}

type ScreenTier = "mobile" | "tablet" | "desktop";

type CardsSectionV2Props = {
  modelResponseData: any;
  behaviorProfileData: any;
  timelineProfileData: any;
  hasPattern: boolean;
  onBookCall?: () => void;
  onDownloadReport?: () => void;
};

export default function CardsSectionV2({
  modelResponseData,
  behaviorProfileData,
  timelineProfileData,
  hasPattern,
  onBookCall,
  onDownloadReport,
}: CardsSectionV2Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>(() => loadProgress().completed);
  const [unlockedIndex, setUnlockedIndex] = useState<number>(() => loadProgress().unlocked);
  const [isJourneyStarted, setIsJourneyStarted] = useState<boolean>(() => loadProgress().journeyStarted);
  // Tracks whether we've scrolled past the hero section (top of this component),
  // so the fixed progress nav doesn't overlap the hero logo/heading when scrolled to top.
  const [isPastHero, setIsPastHero] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(
      "bpm_progress",
      JSON.stringify({
        completed: completedSections,
        unlocked: unlockedIndex,
        journeyStarted: isJourneyStarted,
      })
    );
  }, [completedSections, unlockedIndex, isJourneyStarted]);

  // Scroll Orchestration
  useEffect(() => {
    if (!isJourneyStarted) return;

    // Refresh GSAP ScrollTrigger when components mount or state changes
    ScrollTrigger.refresh();

    const ctx = gsap.context(() => {
      sections.forEach((_, i) => {
        ScrollTrigger.create({
          trigger: `#chapter-${i}`,
          start: "top center", // Changed to top center for more intuitive navigation response
          end: "bottom center",
          onEnter: () => setActiveSection(i),
          onEnterBack: () => setActiveSection(i),
        });
      });

      // Hide the progress nav while the hero (with the logo/heading) is in view,
      // and bring it back once the user scrolls back down past it.
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        onEnter: () => setIsPastHero(true),
        onLeaveBack: () => setIsPastHero(false),
      });
    }, journeyRef);

    return () => ctx.revert();
  }, [isJourneyStarted, completedSections]);

  const handleSectionComplete = (index: number) => {
    if (!completedSections.includes(index)) {
      const newCompleted = [...completedSections, index];
      setCompletedSections(newCompleted);
      setUnlockedIndex(Math.max(unlockedIndex, index + 1));
      // Trigger a refresh after state update
      setTimeout(() => ScrollTrigger.refresh(), 100);
    }
  };

  const scrollToSection = (index: number) => {
    setIsJourneyStarted(true);
    // Give it a moment to render the chapters if they weren't visible
    setTimeout(() => {
      const element = document.getElementById(`chapter-${index}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  const [screenTier, setScreenTier] = useState<ScreenTier>("desktop");
  const [viewportHeight, setViewportHeight] = useState(800);

  useEffect(() => {
    const updateLayout = () => {
      const w = window.innerWidth;
      if (w >= 1280) setScreenTier("desktop");
      else if (w >= 640) setScreenTier("tablet");
      else setScreenTier("mobile");
      setViewportHeight(window.innerHeight);
    };
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  const getHeight = (index: number) => {
    if (screenTier === "mobile") return getMobileCardHeight(viewportHeight);
    if (screenTier === "tablet") return TABLET_HEIGHT;
    if (hoveredIndex === null) return BASE_HEIGHT;
    const distance = Math.abs(index - hoveredIndex);
    if (distance === 0) return HOVERED_HEIGHT;
    if (distance === 1) return NEIGHBOR_HEIGHT;
    return BASE_HEIGHT;
  };

  const isAllCompleted = completedSections.length === sections.length;

  // Save a dedicated completion flag when all chapters are done
  useEffect(() => {
    if (isAllCompleted) {
      localStorage.setItem("bpm_journey_completed", "true");
    }
  }, [isAllCompleted]);

  return (
    <div
      ref={containerRef}
      className={`relative bg-primary-background scroll-smooth min-h-screen`}
    >
      {/* Initial View: Comparison Cards */}
      <section className="min-h-dvh flex flex-col items-center justify-center py-6 px-4 sm:py-10 md:min-h-screen md:py-20 md:px-6 bg-[#F7F2EA] relative overflow-hidden">
        <div className="w-full max-w-xl mx-auto mb-8 md:mb-14 flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-3 md:gap-5 w-full">
            <span className="h-px flex-1 max-w-[48px] md:max-w-[90px] bg-primary-text/15" />
            <span className="whitespace-nowrap text-[9px] md:text-[10px] uppercase tracking-[0.35em] text-secondary-background font-bold">
              How Progress Works
            </span>
            <span className="h-px flex-1 max-w-[48px] md:max-w-[90px] bg-primary-text/15" />
          </div>
          <p className="mt-3 md:mt-5 font-serif text-base md:text-xl leading-relaxed text-primary-text/55">
            Each insight builds on the one before it.{" "}
            {/* The unlock condition carries the emphasis — it's the actionable half. */}
            <span className="font-bold italic text-secondary-background">
              Complete every video in this chapter to unlock the next chapter.
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 xl:flex xl:flex-nowrap items-center justify-center gap-3 md:gap-6 w-full max-w-[1600px] mx-auto">
          {sections.map((section, index) => (
            <div key={index} className="flex items-center justify-center w-full xl:w-auto xl:flex-1 xl:max-w-[340px]">
              <motion.div
                onMouseEnter={() => screenTier === "desktop" && setHoveredIndex(index)}
                onMouseLeave={() => screenTier === "desktop" && setHoveredIndex(null)}
                className="w-full"
              >
                <SectionCardV2
                  title={section.title}
                  videoUrl={section.videoUrl}
                  height={getHeight(index)}
                  index={index}
                  isLocked={!hasPattern || index > unlockedIndex}
                  isCompleted={completedSections.includes(index)}
                  onClick={() => scrollToSection(index)}
                />
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* Progress Navigation - Only visible when journey started */}
      <ProgressNav
        activeSection={activeSection}
        completedSections={completedSections}
        unlockedIndex={unlockedIndex}
        onSectionClick={scrollToSection}
        isVisible={isJourneyStarted && isPastHero}
      />

      {/* Chapters */}
      <div
        ref={journeyRef}
        className={`relative z-10`}
      >
        {sections.map((section, index) => {
          const isUnlocked = hasPattern && index <= unlockedIndex;
          
          if (index === 0) {
            return (
              <ChapterOne
                key={index}
                id={`chapter-${index}`}
                {...section}
                isUnlocked={isUnlocked}
                isCompleted={completedSections.includes(index)}
                onComplete={() => handleSectionComplete(index)}
                behaviorProfileData={behaviorProfileData}
              />
            );
          }
          if (index === 1) {
            return (
              <ChapterTwo
                key={index}
                id={`chapter-${index}`}
                {...section}
                isUnlocked={isUnlocked}
                isCompleted={completedSections.includes(index)}
                onComplete={() => handleSectionComplete(index)}
                modelResponseData={modelResponseData}
                behaviorProfileData={behaviorProfileData}
                timelineProfileData={timelineProfileData}
              />
            );
          }
          if (index === 2) {
            return (
              <ChapterThree
                key={index}
                id={`chapter-${index}`}
                {...section}
                isUnlocked={isUnlocked}
                isCompleted={completedSections.includes(index)}
                onComplete={() => handleSectionComplete(index)}
                behaviorProfileData={behaviorProfileData}
                timelineProfileData={timelineProfileData}
              />
            );
          }
          if (index === 3) {
            return (
              <ChapterFour
                key={index}
                id={`chapter-${index}`}
                {...section}
                isUnlocked={isUnlocked}
                isCompleted={completedSections.includes(index)}
                onComplete={() => handleSectionComplete(index)}
                behaviorProfileData={behaviorProfileData}
              />
            );
          }
          return (
            <Chapter
              key={index}
              id={`chapter-${index}`}
              index={index}
              {...section}
              isUnlocked={index <= unlockedIndex}
              isCompleted={completedSections.includes(index)}
              onComplete={() => handleSectionComplete(index)}
            >
              {index === 1 && <CycleVisual />}
              {index === 2 && <TimelineVisual />}
              {index === 3 && <RebellionZonesResults />}
            </Chapter>
          );
        })}

        {/* Final CTA Section - Shows up after all completed */}
        <AnimatePresence>
          {isAllCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="space-y-0"
            >
              <SummaryDashboard 
                modelResponseData={modelResponseData}
                behaviorProfileData={behaviorProfileData}
                onDownloadReport={onDownloadReport}
              />
              <HowToRewire onBookCall={onBookCall} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
