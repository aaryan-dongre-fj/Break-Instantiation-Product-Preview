"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { onWidthResize } from "@/utils/onWidthResize";
import { THREAD_MEDIA_QUERY } from "./threadBreakpoints";
import LockedChapterCard from "./LockedChapterCard";
import PredMindMuxPlayer from "./PredMindMuxPlayer";
import { useMuxTokens } from "./MuxTokenContext";

gsap.registerPlugin(ScrollTrigger);

interface ChapterTwoProps {
  id: string;
  title: string;
  subtitle: string;
  videoUrl?: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  onComplete: () => void;
  modelResponseData?: any;
  behaviorProfileData?: any;
  timelineProfileData?: any;
}

const CINEMA_INTROS = [
  {
    id: "origin",
    title: "The Origin",
    subtitle: "Phase 01",
    text: [
      "The Origin emotion is the first phase of your cycle, triggered the moment your brain detects a threat. It’s an automatic, fear-based interpretation that sets your entire behavioral trajectory. Before you're even conscious of it, your brain has already decided what's true and how you must respond."
    ],
  },
  {
    id: "protective",
    title: "The Protective",
    subtitle: "Phase 02",
    text: [
      "The Protective phase is where your brain shifts from interpretation to action. It mobilizes anger or anxiety-based states to regain stability and reduce threat. This patterned response shapes how you default to managing conflict, avoidance, or control—often automatically before you've even made a conscious choice."
    ],
  },
  {
    id: "escalating",
    title: "The Escalating",
    subtitle: "Phase 03",
    text: [
      "The Escalating phase is a high-level recalibration that occurs when initial strategies fail. Your brain pivots to more decisive, often contradictory behaviors to resolve the threat. This final stage reveals how your system adapts with increased urgency to restore stability and influence the outcome of a situation."
    ],
  }
];

const INSIGHTS_CONTENT = [
  {
    title: "",
    subtitle: "ORIGIN EMOTION",
    points: [] as string[],
    displayAsScaleRange: false,
    playbackUrl: undefined as string | undefined,
    thumbnailUrl: undefined as string | undefined,
  },
  {
    title: "",
    subtitle: "PROTECTIVE EMOTION",
    points: [] as string[],
    displayAsScaleRange: false,
    playbackUrl: undefined as string | undefined,
    thumbnailUrl: undefined as string | undefined,
  },
  {
    title: "",
    subtitle: "ESCALATING EMOTION",
    points: [] as string[],
    displayAsScaleRange: false,
    playbackUrl: undefined as string | undefined,
    thumbnailUrl: undefined as string | undefined,
  },
];

export default function ChapterTwo({
  id,
  title,
  subtitle,
  videoUrl,
  isUnlocked,
  isCompleted,
  onComplete,
  modelResponseData,
  behaviorProfileData,
  timelineProfileData,
}: ChapterTwoProps) {
  // Format emotion title (capitalize first letter, handle hyphens)
  const formatEmotionTitle = (emotion: string) => {
    if (!emotion) return "";
    return emotion
      .split(/[- ]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("-");
  };

  // Build dynamic content from API data if available
  const insightsContent = useMemo(() => {
    const correctedReport = behaviorProfileData?.corrected_report?.[0] || timelineProfileData?.report?.[0];
    const tp = timelineProfileData?.timeline_profile;
    
    // Fallback emotion names if correctedReport is missing
    const originEmotion = correctedReport?.eac_origin || behaviorProfileData?.eac_origin || "";
    const protectEmotion = correctedReport?.eac_protect || behaviorProfileData?.eac_protect || "";
    const escalatingEmotion = correctedReport?.eac_esc || behaviorProfileData?.eac_esc || "";
    
    // Parse protection_strategy from get_results API (comma-separated string in data.text)
    const rawStrategy = behaviorProfileData?.protection_strategy;
    const protectionStrategyPoints = rawStrategy?.text
      ? String(rawStrategy.text).split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const protectionStrategyInsight = {
      title: "Protection Strategy",
      subtitle: "",
      points: protectionStrategyPoints,
      displayAsScaleRange: false,
      playbackUrl: rawStrategy?.playback_urls?.playback_url as string | undefined,
      thumbnailUrl: rawStrategy?.playback_urls?.thumbnail_gif_url as string | undefined,
    };

    const originPoints = [
      ...(tp?.primary?.profile?.text || []),
      ...(tp?.secondary?.profile?.text || [])
    ].map(s => s?.trim()).filter(Boolean);
    const protectivePoints = [
      ...(tp?.secondary?.profile?.text || []),
      ...(tp?.tertiary_1?.profile?.text || [])
    ].map(s => s?.trim()).filter(Boolean);
    const escalatingPoints = [
      ...(tp?.tertiary_1?.profile?.text || []),
      ...(tp?.tertiary_2?.profile?.text || [])
    ].map(s => s?.trim()).filter(Boolean);

    if (correctedReport || originEmotion || protectEmotion || escalatingEmotion) {
      return [
        {
          ...INSIGHTS_CONTENT[0],
          title: formatEmotionTitle(originEmotion),
          points: originPoints.length > 0 ? originPoints : INSIGHTS_CONTENT[0].points,
        },
        {
          ...INSIGHTS_CONTENT[1],
          title: formatEmotionTitle(protectEmotion),
          points: protectivePoints.length > 0 ? protectivePoints : INSIGHTS_CONTENT[1].points,
        },
        {
          ...INSIGHTS_CONTENT[2],
          title: formatEmotionTitle(escalatingEmotion),
          points: escalatingPoints.length > 0 ? escalatingPoints : INSIGHTS_CONTENT[2].points,
        },
        protectionStrategyInsight,
      ];
    }

    return [
      { ...INSIGHTS_CONTENT[0], title: formatEmotionTitle(originEmotion), points: originPoints },
      { ...INSIGHTS_CONTENT[1], title: formatEmotionTitle(protectEmotion), points: protectivePoints },
      { ...INSIGHTS_CONTENT[2], title: formatEmotionTitle(escalatingEmotion), points: escalatingPoints },
      protectionStrategyInsight,
    ];
  }, [behaviorProfileData, timelineProfileData]);

  const { generalMuxUrls, onBeforePlay, onTokenError } = useMuxTokens();
  const EAC_MUX_KEYS = ['eac_origin_intro', 'eac_protective_intro', 'eac_escalating_intro'] as const;
  const EAC_BODY_MUX_KEYS = ['eac_origin_body', 'eac_protective_body', 'eac_escalating_body'] as const;

  const [introVideosWatched, setIntroVideosWatched] = useState<boolean[]>(
    new Array(CINEMA_INTROS.length).fill(isCompleted)
  );
  const [videosWatched, setVideosWatched] = useState<boolean[]>(
    new Array(insightsContent.length).fill(isCompleted)
  );

  // Sync watch state if completion status changes
  useEffect(() => {
    if (isCompleted) {
      setIntroVideosWatched(new Array(CINEMA_INTROS.length).fill(true));
      setVideosWatched(new Array(insightsContent.length).fill(true));
    }
  }, [isCompleted, insightsContent.length]);

  const containerRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const pathRoadRef = useRef<SVGPathElement>(null);
  const insightsContainerRef = useRef<HTMLDivElement>(null);
  const endMarkerRef = useRef<HTMLDivElement>(null);

  const allVideosWatched = introVideosWatched.every((v) => v) && videosWatched.every((v) => v);

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

  const handleIntroVideoEnd = (index: number) => {
    const newWatched = [...introVideosWatched];
    newWatched[index] = true;
    setIntroVideosWatched(newWatched);
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

    // Use scrollHeight for accurate container height coverage
    const updateHeight = () => {
       // We only want the thread to go down to the "endMarker"
       const containerRect = container.getBoundingClientRect();
       const markerRect = endMarker.getBoundingClientRect();
       
       // Calculate offset from top of container to center of the "Summary Unlocked" marker
       const threadHeight = markerRect.top - containerRect.top + (markerRect.height / 2);
       
       svg.style.height = `${threadHeight}px`;
       svg.setAttribute("viewBox", `0 0 1000 ${threadHeight}`);
       
       // Total sections: 3 Intro + 3 Emotion + 1 Protection Strategy = 7
       const totalSections = 7;
       const step = threadHeight / (totalSections + 1);
       
       // Build path d dynamically based on number of sections
       let d = "M 500 0";
       let prevX = 500;
       for (let i = 0; i < totalSections; i++) {
         const yStart = step * (i + 0.2);
         const yEnd = step * (i + 0.8);
         // Zigzag: 0:L, 1:R, 2:L, 3:R, 4:L, 5:R, 6:L
         const x = i % 2 === 0 ? 250 : 750;
         // Use prevX for the first control point to maintain a vertical tangent from the previous segment
         d += ` C ${prevX} ${yStart}, ${x} ${yStart}, ${x} ${yEnd}`;
         prevX = x;
       }
       // Final segment back to center
       d += ` C ${prevX} ${threadHeight - step * 0.2}, 500 ${threadHeight - step * 0.2}, 500 ${threadHeight}`;

      path.setAttribute("d", d);
      pathRoad.setAttribute("d", d);

      const length = path.getTotalLength();
      
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

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
  }, [insightsContent.map(i => i.points.length).join(','), isUnlocked, showThread]);

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
          currentChapterTitle="Emotional Addiction Cycle"
          previousChapterTitle="Source Belief Spectrum"
          previousChapterId="chapter-0"
        />
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      id={id}
      className={`min-h-screen relative pt-0 pb-0 transition-opacity duration-1000 bg-[#F7F2EA]`}
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
             <linearGradient id="threadGradientCh2" x1="0%" y1="0%" x2="0%" y2="100%">
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
            stroke="url(#threadGradientCh2)"
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
            Chapter 02
            </span>
            <h2 className="text-5xl md:text-7xl font-bold text-primary-text leading-tighter tracking-tighter mb-4">
            {title}
            </h2>
            <p className="text-xl md:text-2xl text-black/50 font-medium tracking-tight max-w-2xl mx-auto">
            {subtitle}
            </p>
        </motion.div>
      </div>

      {/* Insights and Intros Container */}
      <div ref={insightsContainerRef} className="relative z-10 max-w-7xl mx-auto px-6 pb-28 md:pb-32">
        {/* Loop through the 3 phases (Origin, Protective, Escalating) */}
        {CINEMA_INTROS.map((intro, index) => {
          const insight = insightsContent[index];
          
          return (
            <React.Fragment key={intro.id}>
              {/* Cinematic Intro Video Section - Video on LEFT */}
              <div className="relative z-10 w-full mb-32 md:mb-48">
                <div className="max-w-7xl mx-auto bg-[#0F0F0F] rounded-[48px] overflow-hidden shadow-2xl relative group">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary-background/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 p-8 md:p-16 relative z-10">
                    {/* Mobile Heading */}
                    <div className="lg:hidden w-full text-center mb-4">
                      <span className="text-secondary-background font-serif italic text-lg block mb-2">
                        {intro.subtitle}
                      </span>
                      <h3 className="text-4xl font-bold text-white leading-tight">
                        {intro.title}
                      </h3>
                    </div>

                    <div className="w-full lg:w-1/2 flex justify-center order-1">
                      <div className="relative group w-full max-w-[380px]">
                        <div className="absolute -inset-4 bg-secondary-background/10 rounded-[40px] blur-2xl group-hover:bg-secondary-background/20 transition-colors duration-700" />
                        <div className="relative aspect-[9/16] border-[1px] border-white/5 rounded-[32px] overflow-hidden shadow-2xl bg-black">
                          <PredMindMuxPlayer
                            url={generalMuxUrls[EAC_MUX_KEYS[index]]?.playback_url}
                            thumbnailUrl={generalMuxUrls[EAC_MUX_KEYS[index]]?.thumbnail_gif_url}
                            onComplete={() => handleIntroVideoEnd(index)}
                            isCompleted={introVideosWatched[index]}
                            onBeforePlay={onBeforePlay}
                            onTokenError={onTokenError}
                            className="w-full h-full max-w-full border-0 shadow-none rounded-none"
                            showProgressTooltip
                          />
                        </div>
                      </div>
                    </div>
                    <div className="w-full lg:w-1/2 space-y-8 lg:space-y-12 order-2">
                      <div className="space-y-6">
                        {/* Desktop Heading (Hidden on mobile) */}
                        <div className="hidden lg:block space-y-4">
                          <span className="text-secondary-background font-serif italic text-lg block">
                            {intro.subtitle}
                          </span>
                          <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            {intro.title}
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {intro.text.map((paragraph, pIdx) => (
                            <p key={pIdx} className="text-white text-lg leading-relaxed max-w-xl font-medium">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Corresponding Insight Section - Video on RIGHT */}
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-24 mb-32 md:mb-48">
                {/* Mobile Heading */}
                <div className="md:hidden w-full text-center mb-2">
                  <span className="block text-secondary-background font-black text-[10px] tracking-[0.3em] uppercase mb-2">
                    Insight {String((index * 2) + 2).padStart(2, "0")}
                  </span>
                  <h3 className="text-3xl font-bold text-primary-text mb-1">
                    {insight.title}
                  </h3>
                  {insight.subtitle && (
                    <p className="text-sm text-primary-text/60 font-black uppercase tracking-widest mb-4">
                      {insight.subtitle}
                    </p>
                  )}
                </div>

                {/* Video Side (Order 1 on mobile, 2 on desktop) */}
                <div className="w-full md:w-1/2 flex justify-center order-1 md:order-2">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, x: 50 }}
                    whileInView={{ opacity: 1, scale: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="w-full flex justify-center"
                  >
                    <PredMindMuxPlayer
                      url={generalMuxUrls[EAC_BODY_MUX_KEYS[index]]?.playback_url}
                      thumbnailUrl={generalMuxUrls[EAC_BODY_MUX_KEYS[index]]?.thumbnail_gif_url}
                      onComplete={() => handleVideoEnd(index)}
                      isCompleted={videosWatched[index]}
                      onBeforePlay={onBeforePlay}
                      onTokenError={onTokenError}
                      showProgressTooltip
                    />
                  </motion.div>
                </div>

                {/* Text Side (Order 2 on mobile, 1 on desktop) */}
                <div className="w-full md:w-1/2 order-2 md:order-1 pr-0 md:pr-16">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    {/* Desktop Heading (Hidden on mobile) */}
                    <div className="hidden md:block">
                      <span className="block text-secondary-background font-black text-xs tracking-[0.3em] uppercase mb-3">
                        Insight {String((index * 2) + 2).padStart(2, "0")}
                      </span>
                      <h3 className="text-3xl md:text-4xl font-bold text-primary-text mb-2">
                        {insight.title}
                      </h3>
                      {insight.subtitle && (
                        <p className="text-xl text-primary-text/60 font-black uppercase tracking-widest mb-6">
                          {insight.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 mt-4 md:mt-6">
                      {(insight as { displayAsScaleRange?: boolean }).displayAsScaleRange &&
                      insight.points.length === 2 ? (
                        <div className="flex flex-col gap-2">
                          <p className="text-lg text-black/70 font-medium">
                            {insight.points[0].charAt(0).toUpperCase() + insight.points[0].slice(1)}
                          </p>
                          <span className="h-px w-full bg-black/20" aria-hidden="true" />
                          <p className="text-lg text-black/70 font-medium">
                            {insight.points[1].charAt(0).toUpperCase() + insight.points[1].slice(1)}
                          </p>
                        </div>
                      ) : (
                        insight.points.map((point: string, i: number) => (
                          <div key={i} className="flex gap-4 items-start">
                            <span className="text-lg font-serif font-bold italic text-secondary-background mt-0.5">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <p className="text-lg text-black/70 font-[600] tracking-tight leading-relaxed">
                              {point.charAt(0).toUpperCase() + point.slice(1)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* 7. Protection Strategy (Now at the end) - Video on LEFT */}
        {/* No bottom margin: this is the last block, so the container's own pb
            is the chapter tail. Carrying mb-32 here too doubled the gap. */}
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
          {/* Mobile Heading */}
          <div className="md:hidden w-full text-center mb-4">
            <span className="block text-secondary-background font-black text-[10px] tracking-[0.3em] uppercase mb-2">
              Insight 07
            </span>
            <h3 className="text-4xl font-bold text-primary-text mb-2">
              {insightsContent[3].title}
            </h3>
          </div>

          <div className="w-full md:w-1/2 flex justify-center order-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: -50 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="w-full flex justify-center"
            >
              <PredMindMuxPlayer
                url={insightsContent[3].playbackUrl}
                thumbnailUrl={insightsContent[3].thumbnailUrl}
                onComplete={() => handleVideoEnd(3)}
                isCompleted={videosWatched[3]}
                onBeforePlay={onBeforePlay}
                onTokenError={onTokenError}
                showProgressTooltip
              />
            </motion.div>
          </div>
          <div className="w-full md:w-1/2 md:pl-16 order-2">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Desktop Heading (Hidden on mobile) */}
              <div className="hidden md:block">
                <span className="block text-secondary-background font-black text-xs tracking-[0.3em] uppercase mb-3">
                  Insight 07
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-primary-text mb-2">
                  {insightsContent[3].title}
                </h3>
              </div>
              {insightsContent[3].subtitle && (
                <p className="text-xl text-primary-text/60 font-black uppercase tracking-widest mb-6">
                  {insightsContent[3].subtitle}
                </p>
              )}
              <div className="space-y-2 mb-4">
                <p className="text-lg text-black/50 leading-relaxed font-[600]">
                  Your Protection Strategy is how your system acts on your protective emotion in real time.
                </p>
                <p className="text-lg text-black/50 leading-relaxed font-[600]">
                  When that emotion activates, the strategy takes over—driving the thoughts and behaviors that feel justified in the moment but keep the cycle in place.
                </p>
                <p className="text-lg text-black/50 leading-relaxed font-[600]">
                  It’s not random — it’s the bridge between what you feel and what you do, reinforcing the Emotional Addiction Cycle every time it runs.
                </p>
              </div>
              <div className="space-y-2">
                {insightsContent[3].points.map((point: string, i: number) => (
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
      </div>
      <div ref={endMarkerRef}></div>

      </div>
    </section>
  );
}
