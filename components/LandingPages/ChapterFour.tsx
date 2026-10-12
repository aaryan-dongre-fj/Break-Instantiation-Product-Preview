"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { onWidthResize } from "@/utils/onWidthResize";
import { THREAD_MEDIA_QUERY } from "./threadBreakpoints";
import PredMindMuxPlayer from "./PredMindMuxPlayer";
import InsightCardStack from "./InsightVisuals/InsightCardStack";
import { useMuxTokens } from "./MuxTokenContext";
import LockedChapterCard from "./LockedChapterCard";

gsap.registerPlugin(ScrollTrigger);

interface ChapterFourProps {
  id: string;
  title: string;
  subtitle: string;
  videoUrl?: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  onComplete: () => void;
  behaviorProfileData?: any;
}

const INSIGHTS_CONTENT = [
  {
    title: "Long-term Effects",
    subtitle: "PATTERNS OF STAGNATION",
    points: [""] as string[],
    playbackUrl: undefined as string | undefined,
    thumbnailUrl: undefined as string | undefined,
  },
  {
    title: "Rebellion Zones",
    subtitle: "YOUR REWIRING PRESSURE POINTS",
    points: [""] as string[],
    playbackUrl: undefined as string | undefined,
    thumbnailUrl: undefined as string | undefined,
  },
];

const STRENGTHS = ["Clever", "Strategic", "Perceptive"];

export default function ChapterFour({
  id,
  title,
  subtitle,
  videoUrl,
  isUnlocked,
  isCompleted,
  onComplete,
  behaviorProfileData,
}: ChapterFourProps) {
  // Build dynamic content from API data if available
  const getInsightsContent = () => {
    if (behaviorProfileData) {
      const longtermEffectsPoints = behaviorProfileData.longterm_effects?.text
        ? String(behaviorProfileData.longterm_effects.text).split(",").map((s: string) => s.trim())
        : [];

      const rebellionZones = behaviorProfileData.rebellion_zones?.text || [];

      return [
        {
          title: "Cost Of Not Rewiring",
          subtitle: "PATTERNS OF STAGNATION",
          points: longtermEffectsPoints.length > 0 ? longtermEffectsPoints : INSIGHTS_CONTENT[0].points,
          playbackUrl: behaviorProfileData.longterm_effects?.playback_urls?.playback_url as string | undefined,
          thumbnailUrl: behaviorProfileData.longterm_effects?.playback_urls?.thumbnail_gif_url as string | undefined,
        },
        {
          title: "Rebellion Zones",
          subtitle: "YOUR REWIRING PRESSURE POINTS",
          points: rebellionZones.length > 0 ? rebellionZones : INSIGHTS_CONTENT[1].points,
          playbackUrl: behaviorProfileData.rebellion_zones?.playback_urls?.playback_url as string | undefined,
          thumbnailUrl: behaviorProfileData.rebellion_zones?.playback_urls?.thumbnail_gif_url as string | undefined,
        },
      ];
    }
    return INSIGHTS_CONTENT;
  };

  const insightsContent = getInsightsContent();
  const { generalMuxUrls, onBeforePlay, onTokenError } = useMuxTokens();

  const [generalVideoWatched, setGeneralVideoWatched] = useState(isCompleted);
  const [videosWatched, setVideosWatched] = useState<boolean[]>(
    new Array(insightsContent.length).fill(isCompleted)
  );

  const containerRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const pathRoadRef = useRef<SVGPathElement>(null);
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
       
       const step = threadHeight / 3;
       
       // Path for 2 items: Center -> Left -> Right -> Center
       const d = `
        M 500 0
        C 500 ${step * 0.2}, 250 ${step * 0.2}, 250 ${step * 0.8}
        C 250 ${step * 1.2}, 750 ${step * 1.2}, 750 ${step * 1.8}
        C 750 ${step * 2.2}, 500 ${step * 2.2}, 500 ${threadHeight}
      `;

      path.setAttribute("d", d);
      pathRoad.setAttribute("d", d);

      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      return threadHeight;
    };

    let timer = setTimeout(() => {
        updateHeight();
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
  }, [isUnlocked, showThread]);

  // When locked, render just the centered card — no tall dimmed content to
  // scroll, and no viewport-height floor padding out empty space below it.
  // Last chapter, so this is the one locked section that also pads the bottom.
  if (!isUnlocked) {
    return (
      <section
        id={id}
        className="pt-24 pb-24 flex items-center justify-center relative bg-[#F7F2EA]"
      >
        <LockedChapterCard
          currentChapterTitle="Rebellion Zones"
          previousChapterTitle="Timeline Imbalance"
          previousChapterId="chapter-2"
        />
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      id={id}
      className={`min-h-screen relative pt-0 pb-20 transition-opacity duration-1000 bg-[#F7F2EA] ${
        isUnlocked ? "opacity-100" : "opacity-40 pointer-events-none"
      }`}
    >
      {/* SVG Thread */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden md:block overflow-hidden">
         <svg ref={svgRef} className="w-full absolute top-0 left-0" preserveAspectRatio="none">
          <defs>
             <linearGradient id="threadGradient4" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#CCA077" stopOpacity="1" />
              <stop offset="100%" stopColor="#CCA077" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <path ref={pathRoadRef} stroke="#CCA077" strokeWidth="3" strokeOpacity="0.15" strokeLinecap="round" fill="none" />
          <path ref={pathRef} stroke="url(#threadGradient4)" strokeWidth="4" strokeLinecap="round" fill="none" />
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center mb-24 pt-12">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <span className="text-secondary-background font-serif italic text-xl md:text-2xl mb-4 block">Chapter 04</span>
            <h2 className="text-5xl md:text-7xl font-bold text-primary-text leading-tighter tracking-tighter mb-4">{title}</h2>
            <p className="text-xl md:text-2xl text-black/50 font-medium tracking-tight max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>
      </div>

      {/* NEW: Cinema Mode - General Section */}
      <div className="relative z-10 w-full mb-32 px-4 md:px-8">
        <div className="max-w-7xl mx-auto bg-[#0A0A0A] rounded-[48px] overflow-hidden shadow-2xl relative group border border-white/5">
           {/* Abstract Glow */}
           <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-background/5 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />
           
           <div className="p-8 md:p-16 relative z-10">
            {/* Centered Heading for all screens */}
            <div className="w-full text-center mb-12 md:mb-16">
              <h3 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Identifying <span className="italic font-serif text-secondary-background">Rebellion</span> Zones
              </h3>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
              {/* Portrait Video (Order 1 on mobile) */}
              <div className="w-full lg:w-1/2 flex justify-center order-1 lg:order-2">
              <div className="relative group w-full max-w-[380px]">
                <div className="absolute -inset-4 bg-secondary-background/10 rounded-[40px] blur-2xl group-hover:bg-secondary-background/20 transition-colors duration-700" />
                <div className="relative aspect-[9/16] border-[1px] border-white/10 rounded-[32px] overflow-hidden shadow-2xl bg-black">
                  <PredMindMuxPlayer
                    url={generalMuxUrls['rebellion_zones_intro']?.playback_url}
                    thumbnailUrl={generalMuxUrls['rebellion_zones_intro']?.thumbnail_gif_url}
                    teaserSrc={videoUrl || "/5.webm"}
                    onComplete={() => setGeneralVideoWatched(true)}
                    isCompleted={generalVideoWatched}
                    onBeforePlay={onBeforePlay}
                    onTokenError={onTokenError}
                    className="w-full h-full max-w-full border-0 shadow-none rounded-none"
                    showProgressTooltip
                  />
                </div>
              </div>
            </div>

            {/* General Theory (Order 2 on mobile) */}
            <div className="w-full lg:w-1/2 space-y-12 order-2 lg:order-1">
              <div className="space-y-3">
                <p className="text-white text-lg leading-relaxed max-w-xl font-medium">
                  Rebellion Zones are the emotional pressure points where your pattern resists change the most — and where rewiring must occur.
                </p>
                <p className="text-white text-lg leading-relaxed max-w-xl font-medium">
                  These zones activate the AMCC, the part of the brain responsible for overriding impulsive emotional patterns. Each result type has predictable pressure points based on:
                </p>
                
                <div className="space-y-2 pt-3 border-t border-white/5">
                  {[
                    "Their Source Belief",
                    "Their Emotional Cycle",
                    "Their Timeline positions"
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary-background shadow-[0_0_15px_rgba(204,160,119,0.4)]" />
                      <p className="text-white text-lg font-medium leading-relaxed tracking-tight">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-white text-lg leading-relaxed max-w-xl font-medium pt-3 border-t border-white/5 italic">
                  When you know these zones, you stop trying to fix the whole pattern at once and focus on the exact emotional entry points that create real change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Alternating Insights */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-32 md:space-y-48 pb-32">
        {insightsContent.map((insight, index) => {
            const isVideoLeft = index % 2 === 0;
            const isCardStack = index === 1; // Rebellion Zones is index 1

            return (
                <div key={index} className={`flex flex-col md:flex-row items-center gap-8 md:gap-24 ${!isVideoLeft ? 'md:flex-row-reverse' : ''}`}>
                    {/* Mobile Heading */}
                    <div className="md:hidden w-full text-center mb-4">
                        <span className="block text-secondary-background font-black text-[10px] tracking-[0.3em] uppercase mb-2">
                            Insight {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="text-3xl font-bold text-primary-text mb-1">
                            {insight.title}
                        </h3>
                        <p className="text-xs font-bold text-primary-text/40 uppercase tracking-widest mb-4">
                            {insight.subtitle}
                        </p>
                    </div>

                    {/* Video Side (Order 1 on mobile) */}
                    <div className="w-full md:w-1/2 flex justify-center order-1 md:order-none">
                        <motion.div initial={{ opacity: 0, scale: 0.9, x: isVideoLeft ? -50 : 50 }} whileInView={{ opacity: 1, scale: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="w-full flex justify-center">
                            <PredMindMuxPlayer url={insight.playbackUrl} thumbnailUrl={insight.thumbnailUrl} onComplete={() => handleVideoEnd(index)} isCompleted={videosWatched[index]} onBeforePlay={onBeforePlay} onTokenError={onTokenError} showProgressTooltip />
                        </motion.div>
                    </div>

                    {/* Text Side (Order 2 on mobile) */}
                    <div className={`w-full md:w-1/2 order-2 md:order-none ${!isVideoLeft ? 'pl-0 md:pl-16' : 'pr-0 md:pr-16'}`}>
                        <motion.div initial={{ opacity: 0, x: isVideoLeft ? 50 : -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
                            {/* Desktop Heading (Hidden on mobile) */}
                            <div className="hidden md:block">
                                <span className="block text-secondary-background font-black text-xs tracking-[0.3em] uppercase mb-3">Insight {String(index + 1).padStart(2, "0")}</span>
                                <h3 className="text-3xl md:text-4xl font-bold text-primary-text mb-2">{insight.title}</h3>
                                <p className="text-sm font-bold text-primary-text/40 uppercase tracking-widest mb-6">{insight.subtitle}</p>
                            </div>

                            {isCardStack ? (
                                <InsightCardStack 
                                    title={insight.title}
                                    subtitle={insight.subtitle}
                                    points={insight.points}
                                />
                            ) : (
                                <div className="space-y-2 mt-4 md:mt-6">
                                    {insight.points.map((point: string, i: number) => (
                                        <div key={i} className="flex gap-4 items-start">
                                            <span className="text-lg font-serif font-bold italic text-secondary-background mt-0.5">
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                            <p className="text-lg text-black/70 font-[600] tracking-tight leading-relaxed">{point.charAt(0).toUpperCase() + point.slice(1)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            );
        })}
      </div>

      {/* End Marker for SVG Thread */}
      <div ref={endMarkerRef} className="pb-20" />

      {/* Simplified Summary Section - Commented Out
      <div className="relative z-10 min-h-[50vh] flex flex-col items-center justify-center pb-20">
         <div className={`relative w-full transition-all duration-700 ${allVideosWatched ? 'opacity-100 blur-0' : 'opacity-50 blur-sm pointer-events-none'}`}>
             <div className="flex items-center gap-8 mb-20 max-w-4xl mx-auto px-6">
                <div className="h-px flex-1 bg-primary-text/10" />
                <div className="flex items-center gap-3 px-6 py-3 bg-secondary-background text-white rounded-full shadow-lg">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">Summary</span>
                </div>
                <div className="h-px flex-1 bg-primary-text/10" />
            </div>
            
            <div className="max-w-3xl mx-auto px-6">
                <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-sm border border-black/5">
                    <h3 className="text-3xl font-bold text-black mb-8 text-center">Current Strengths</h3>
                    <div className="flex flex-col items-center gap-6">
                        {strengths.map((strength: string, i: number) => (
                            <div key={i} className="flex items-center gap-4 w-full justify-center">
                                <div className="w-2 h-2 rounded-full bg-secondary-background" />
                                <span className="text-2xl font-bold text-black/80">{strength}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
         </div>

         {!allVideosWatched && (
             <div className="absolute inset-0 flex items-center justify-center z-20">
                 <div className="text-center p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/50">
                    <div className="w-16 h-16 rounded-full border-[4px] border-gray-300 flex items-center justify-center mb-4 text-gray-400 mx-auto">
                        <Lock className="w-6 h-6" strokeWidth={3} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 uppercase tracking-widest mb-2">Summary Locked</h3>
                    <p className="text-gray-600 max-w-xs">Complete both video insights to reveal your final summary.</p>
                </div>
             </div>
         )}
      </div>
      */}

    </section>
  );
}
