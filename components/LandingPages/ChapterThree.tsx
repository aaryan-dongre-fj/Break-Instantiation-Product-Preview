"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { onWidthResize } from "@/utils/onWidthResize";
import { THREAD_MEDIA_QUERY } from "./threadBreakpoints";
import TimelineVisual from "./InsightVisuals/TimelineVisual";
import LockedChapterCard from "./LockedChapterCard";
import PredMindMuxPlayer from "./PredMindMuxPlayer";
import { useMuxTokens } from "./MuxTokenContext";

gsap.registerPlugin(ScrollTrigger);

interface ChapterThreeProps {
  id: string;
  title: string;
  subtitle: string;
  videoUrl?: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  onComplete: () => void;
  behaviorProfileData?: any;
  timelineProfileData?: any;
}

export default function ChapterThree({
  id,
  title,
  subtitle,
  isUnlocked,
  isCompleted,
  onComplete,
  timelineProfileData,
}: ChapterThreeProps) {
  const { generalMuxUrls, onBeforePlay, onTokenError } = useMuxTokens();
  // Build dynamic content from API data if available
  const getInsightsContent = () => {
    const tp = timelineProfileData?.timeline_profile;

    const sections = [
      { key: 'primary',    label: 'PRIMARY' },
      { key: 'secondary',  label: 'SECONDARY' },
      { key: 'tertiary_1', label: 'TERTIARY 1' },
      { key: 'tertiary_2', label: 'TERTIARY 2' },
    ];

    // Temporary fallbacks for when a timeline video isn't uploaded yet
    const fallbackMuxUrl = tp?.tertiary_1?.video?.playback_url ?? null;
    const fallbackThumbnailGifUrl = tp?.tertiary_1?.video?.thumbnail_gif_url ?? null;

    return sections.map(sec => {
      const data = tp?.[sec.key];
      const hasData = data && Object.keys(data).length > 0;

      return {
        title: hasData ? data.timeline_number : "",
        subtitle: sec.label,
        points: hasData ? (data.profile?.text || []) : [],
        muxUrl: data?.video?.playback_url ?? fallbackMuxUrl,
        thumbnailGifUrl: data?.video?.thumbnail_gif_url ?? fallbackThumbnailGifUrl,
        isEmpty: !hasData,
      };
    });
  };

  const insightsContent = getInsightsContent();
  // Only show sections that have data
  const visibleInsights = insightsContent.filter(insight => !insight.isEmpty);

  const [generalVideoWatched, setGeneralVideoWatched] = useState(isCompleted);
  const [videosWatched, setVideosWatched] = useState<boolean[]>(
    new Array(visibleInsights.length).fill(isCompleted)
  );

  const containerRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const pathRoadRef = useRef<SVGPathElement>(null);
  const insightsContainerRef = useRef<HTMLDivElement>(null);
  const endMarkerRef = useRef<HTMLDivElement>(null);

  const allVideosWatched = generalVideoWatched && videosWatched.every((v) => v);

  useEffect(() => {
    if (allVideosWatched && !isCompleted) {
      onComplete();
    }
  }, [allVideosWatched, isCompleted, onComplete]);

  const handleVideoEnd = (index: number) => {
    const newWatched = [...videosWatched];
    newWatched[index] = true;
    setVideosWatched(newWatched);
  };

  // The thread container is `hidden md:block`, so below that breakpoint all of
  // this measuring and scrubbing draws nothing. Skipping it keeps flick-scroll
  // smooth on phones without changing anything visible on larger screens.
  const showThread = useMediaQuery(THREAD_MEDIA_QUERY);

  // SVG Animation
  useEffect(() => {
    if (!showThread) return;

    const container = containerRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    const pathRoad = pathRoadRef.current;
    const endMarker = endMarkerRef.current;

    if (!container || !svg || !path || !pathRoad || !endMarker) return;

    const updateHeight = () => {
       const containerRect = container.getBoundingClientRect();
       const markerRect = endMarker.getBoundingClientRect();
       const threadHeight = markerRect.top - containerRect.top + (markerRect.height / 2);
       
       svg.style.height = `${threadHeight}px`;
       svg.setAttribute("viewBox", `0 0 1000 ${threadHeight}`);
       
       // Adjust steps for visible items + intro
       const totalSections = visibleInsights.length;
       const step = threadHeight / (totalSections + 1);
       
       let d = "M 500 0";
       let prevX = 500;
       for (let i = 0; i < totalSections; i++) {
         const yStart = step * (i + 0.2);
         const yEnd = step * (i + 0.8);
         const x = i % 2 === 0 ? 250 : 750;
         d += ` C ${prevX} ${yStart}, ${x} ${yStart}, ${x} ${yEnd}`;
         prevX = x;
       }
       d += ` C ${prevX} ${threadHeight - step * 0.2}, 500 ${threadHeight - step * 0.2}, 500 ${threadHeight}`;

      path.setAttribute("d", d);
      pathRoad.setAttribute("d", d);

      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      return threadHeight;
    };

    let currentThreadHeight = 0;
    const timer = setTimeout(() => {
        currentThreadHeight = updateHeight() || 0;
        const ctx = gsap.context(() => {
            gsap.to(path, {
                strokeDashoffset: 0,
                ease: "none",
                scrollTrigger: {
                trigger: container,
                start: "top center", 
                endTrigger: endMarker,
                end: "center center", 
                scrub: 0.5,
                },
            });
        }, container);

        // Re-measure once the trigger exists and the path has its final shape.
        ScrollTrigger.refresh();
    }, 200);

    // Width-only + debounced: a plain `resize` listener here fires on every iOS
    // URL-bar collapse mid-flick. `refresh(true)` is GSAP's safe variant — it
    // waits for scrolling to stop instead of re-measuring the page underneath it.
    const stopResizeListener = onWidthResize(() => {
        updateHeight();
        ScrollTrigger.refresh(true);
    });
    return () => {
        stopResizeListener();
        clearTimeout(timer);
        ScrollTrigger.getAll().forEach(t => {
            if (t.trigger === container || t.trigger === endMarker) t.kill();
        });
    };
  }, [visibleInsights.length, isUnlocked, showThread]);

  // When locked, render just the centered card — no tall dimmed content to
  // scroll, and no viewport-height floor padding out empty space below it.
  // Top padding only: locked chapters stack, so a bottom pad here would sum with
  // the next one's top pad and double the gap. Chapter Four closes out the run.
  if (!isUnlocked) {
    return (
      <section
        id={id}
        className="pt-24 flex items-center justify-center relative bg-[#F7F2EA]"
      >
        <LockedChapterCard
          currentChapterTitle="Timeline Imbalance"
          previousChapterTitle="Emotional Addiction Cycle"
          previousChapterId="chapter-1"
        />
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      id={id}
      className={`min-h-screen relative pt-0 pb-20 transition-opacity duration-1000 bg-[#F7F2EA]`}
    >
      <div className={`${isUnlocked ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
      {/* SVG Thread Container */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden md:block overflow-hidden">
         <svg
          ref={svgRef}
          className="w-full absolute top-0 left-0" 
          preserveAspectRatio="none"
        >
          <defs>
             <linearGradient id="threadGradientCh3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#CCA077" stopOpacity="1" />
              <stop offset="100%" stopColor="#CCA077" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <path
            ref={pathRoadRef}
            stroke="#CCA077"
            strokeWidth="3"
            strokeOpacity="0.15"
            strokeLinecap="round"
            fill="none"
          />
          <path
            ref={pathRef}
            stroke="url(#threadGradientCh3)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center mb-24 pt-12">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
        >
            <span className="text-secondary-background font-serif italic text-xl md:text-2xl mb-4 block">
            Chapter 03
            </span>
            <h2 className="text-5xl md:text-7xl font-bold text-primary-text leading-tighter tracking-tighter mb-4">
            {title}
            </h2>
            <p className="text-xl md:text-2xl text-black/50 font-medium tracking-tight max-w-2xl mx-auto">
            {subtitle}
            </p>
        </motion.div>
      </div>

      {/* Cinema Mode - General Section (Timeline Introduction) */}
      <div className="relative z-10 w-full mb-32 px-4 md:px-8">
        <div className="max-w-7xl mx-auto bg-[#1A1A1A] rounded-[48px] overflow-hidden shadow-2xl relative group">
           <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
                style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }} />
           
           <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 p-8 md:p-16 relative z-10">
            {/* Mobile Heading */}
            <div className="lg:hidden w-full text-center mb-4">
              <h3 className="text-4xl font-bold text-white leading-tight">
                Your Behavioral <span className="italic font-serif text-secondary-background">Timeline</span>
              </h3>
            </div>

            <div className="w-full lg:w-1/2 flex justify-center order-1">
              <div className="relative group w-full max-w-[380px]">
                <div className="absolute -inset-4 bg-secondary-background/20 rounded-[40px] blur-2xl group-hover:bg-secondary-background/30 transition-colors duration-700" />
                <div className="relative aspect-[9/16] border-[1px] border-white/10 rounded-[32px] overflow-hidden shadow-2xl bg-black">
                  <PredMindMuxPlayer
                    url={generalMuxUrls['timeline_intro']?.playback_url}
                    thumbnailUrl={generalMuxUrls['timeline_intro']?.thumbnail_gif_url}
                    onComplete={() => setGeneralVideoWatched(true)}
                    isCompleted={generalVideoWatched}
                    onBeforePlay={onBeforePlay}
                    onTokenError={onTokenError}
                    className="w-full h-full border-0 shadow-none rounded-none"
                    showProgressTooltip
                  />
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 space-y-12 order-2">
              <div className="space-y-4">
                {/* Desktop Heading (Hidden on mobile) */}
                <h3 className="hidden lg:block text-4xl md:text-5xl font-bold text-white leading-tight">
                  Your Behavioral <span className="italic font-serif text-secondary-background">Timeline</span>
                </h3>
                <div className="space-y-6">
                  <p className="text-white text-lg leading-relaxed max-w-xl font-medium">
                    Every pattern expresses itself along a timeline of behavior.
                  </p>
                  
                <div className="space-y-3">
                  <p className="text-white/80 text-sm font-black uppercase tracking-[0.2em] mb-3">The Timeline consists of four predictable positions:</p>
                    {[
                      { label: "Primary Response", desc: "your immediate instinct" },
                      { label: "Secondary Response", desc: "your early processing" },
                      { label: "Tertiary 1", desc: "your mid-stage behavior" },
                      { label: "Tertiary 2", desc: "your late-stage behavior" }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 items-baseline">
                        <span className="text-lg font-serif font-bold italic text-secondary-background leading-none flex-shrink-0">
                            {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="text-white text-lg font-medium leading-relaxed">
                          <span className="font-bold uppercase text-sm tracking-[0.2em] mr-2">{item.label}</span>
                          <span className="opacity-70">— {item.desc}</span>
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <p className="text-white/80 text-sm font-black uppercase tracking-[0.2em] mb-3">These markers explain:</p>
                    {[
                      "Why certain situations feel harder than others",
                      "Why you get stuck in repeat arguments",
                      "Why you shut down, escalate, avoid, or over-control"
                    ].map((text, i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary-background shadow-[0_0_10px_rgba(204,160,119,0.3)]" />
                        <p className="text-white text-lg font-medium leading-relaxed italic opacity-90">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="text-white text-lg leading-relaxed max-w-xl font-medium pt-4 border-t border-white/5">
                    Timeline reveals where you lose traction and why change hasn’t lasted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alternating Insights */}
      <div ref={insightsContainerRef} className="relative z-10 max-w-7xl mx-auto px-6 space-y-32 md:space-y-48 pb-28 md:pb-32">
        {visibleInsights.map((insight, index) => {
            const isVideoLeft = index % 2 === 0;

            return (
                <div 
                    key={index} 
                    className={`flex flex-col md:flex-row items-center gap-8 md:gap-24 ${!isVideoLeft ? 'md:flex-row-reverse' : ''}`}
                >
                    {/* Mobile Heading */}
                    <div className="md:hidden w-full text-center mb-4">
                        <span className="block text-secondary-background font-black text-[10px] tracking-[0.3em] uppercase mb-2">
                            Insight {String(index + 1).padStart(2, "0")}
                        </span>
                        {insight.subtitle && (
                            <p className="text-sm text-primary-text/40 font-bold uppercase tracking-widest mb-3">
                                {insight.subtitle}
                            </p>
                        )}
                        <h3 className="text-3xl font-bold text-primary-text mb-1">
                            {insight.title}
                        </h3>
                    </div>

                    {/* Video Side (Order 1 on mobile) */}
                    <div className="w-full md:w-1/2 flex justify-center order-1 md:order-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: isVideoLeft ? -50 : 50 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="w-full flex justify-center"
                        >
                            <PredMindMuxPlayer
                                key={insight.muxUrl ?? `timeline-${index}`}
                                url={insight.muxUrl ?? undefined}
                                thumbnailUrl={insight.thumbnailGifUrl ?? undefined}
                                onComplete={() => handleVideoEnd(index)}
                                isCompleted={videosWatched[index]}
                                onBeforePlay={onBeforePlay}
                                onTokenError={onTokenError}
                                showProgressTooltip
                            />
                        </motion.div>
                    </div>

                    {/* Text Side (Order 2 on mobile) */}
                    <div className={`w-full md:w-1/2 order-2 md:order-none ${!isVideoLeft ? 'pl-0 md:pl-16 text-left' : 'pr-0 md:pr-16 text-left'}`}>
                        <motion.div
                             initial={{ opacity: 0, x: isVideoLeft ? 50 : -50 }}
                             whileInView={{ opacity: 1, x: 0 }}
                             viewport={{ once: true }}
                             transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            {/* Desktop Heading (Hidden on mobile) */}
                            <div className="hidden md:block">
                                <span className="block text-secondary-background font-black text-xs tracking-[0.3em] uppercase mb-3">
                                    Insight {String(index + 1).padStart(2, "0")}
                                </span>
                                {insight.subtitle && (
                                    <p className="text-xl text-primary-text/40 font-bold uppercase tracking-widest mb-6">{insight.subtitle}</p>
                                )}
                                <div className="w-full h-[4px] bg-primary-text/10 mb-6" />
                                <h3 className="text-3xl md:text-5xl font-bold text-primary-text mb-6">
                                    {insight.title}
                                </h3>
                            </div>

                            <div className="space-y-2 mt-4 md:mt-6">
                                {insight.points.map((point: string, i: number) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <span className="text-lg font-serif font-bold italic text-secondary-background mt-0.5">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <p className="text-lg text-black/70 font-[600] tracking-tight leading-relaxed">
                                            {point.charAt(0).toUpperCase() + point.slice(1)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            );
        })}
      </div>

      {/* Summary Section (Locked/Unlocked) */}
      <div className="relative z-10 min-h-[50vh] flex flex-col items-center justify-center pb-20">
         <div className={`relative w-full transition-all duration-700 ${allVideosWatched ? 'opacity-100 blur-0' : 'opacity-50 blur-sm pointer-events-none select-none'}`}>
             <div ref={endMarkerRef} className="flex items-center gap-8 mb-20 max-w-4xl mx-auto px-6">
                <div className="h-px flex-1 bg-primary-text/10" />
                <div className="flex items-center gap-3 px-6 py-3 bg-secondary-background text-white rounded-full shadow-lg relative z-20">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">
                        Summary
                    </span>
                </div>
                <div className="h-px flex-1 bg-primary-text/10" />
            </div>
            
            <div className="max-w-7xl mx-auto px-6">
                 <TimelineVisual timelineProfileData={timelineProfileData} />
            </div>
         </div>

         {!allVideosWatched && (
             <div className="absolute inset-0 flex items-center justify-center z-20">
                 <div className="text-center p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/50">
                     <div className="w-16 h-16 rounded-full border-[4px] border-gray-300 flex items-center justify-center mb-4 text-gray-400 mx-auto">
                        <Lock className="w-6 h-6" strokeWidth={3} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 uppercase tracking-widest mb-2">Summary Locked</h3>
                    <p className="text-gray-600 max-w-xs">Complete all {visibleInsights.length + 1} video insights above to reveal your summary.</p>
                </div>
             </div>
         )}
      </div>

      </div>

    </section>
  );
}
