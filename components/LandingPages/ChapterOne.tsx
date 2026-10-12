"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { onWidthResize } from "@/utils/onWidthResize";
import { THREAD_MEDIA_QUERY } from "./threadBreakpoints";
import SourceBeliefSpectrumResults from "./SourceBeliefSpectrumResults";
import PredMindMuxPlayer from "./PredMindMuxPlayer";
import SpectrumVisual from "./InsightVisuals/SpectrumVisual";
import { useMuxTokens } from "./MuxTokenContext";

gsap.registerPlugin(ScrollTrigger);

interface ChapterOneProps {
  id: string;
  title: string;
  subtitle: string;
  videoUrl?: string; // Chapter's general video
  isUnlocked: boolean;
  isCompleted: boolean;
  onComplete: () => void;
  behaviorProfileData?: any;
}

const INSIGHTS_CONTENT = [
  {
    title: "Self-Deception Themes",
    points: [""],
  },
  {
    title: "Underlying Motivations",
    points: [""],
  },
  {
    title: "Common Conflicts",
    points: [""],
  },
  {
    title: "What You Want Most",
    points: [""],
  },
];

export default function ChapterOne({
  id,
  title,
  subtitle,
  videoUrl,
  isUnlocked,
  isCompleted,
  onComplete,
  behaviorProfileData,
}: ChapterOneProps) {
  const [userGuess, setUserGuess] = useState<number | null>(null);
  const [hasGuessed, setHasGuessed] = useState(false);

  // Build dynamic content from API data if available
  const getInsightsContent = () => {
    if (behaviorProfileData) {
      const selfDeceptionPoints = behaviorProfileData.self_deception_themes?.text
        ? String(behaviorProfileData.self_deception_themes.text).split(",").map((s: string) => s.trim())
        : [];

      const underlyingMotivations = behaviorProfileData.underlying_motivations?.text || [];

      const commonConflictsPoints = behaviorProfileData.common_conflicts?.text
        ? String(behaviorProfileData.common_conflicts.text).split(",").map((s: string) => s.trim())
        : [];

      const whatYouWantMost = behaviorProfileData.what_you_want_most?.text
        ? String(behaviorProfileData.what_you_want_most.text).split(",").map((s: string) => s.trim())
        : [];

      return [
        {
          title: "Self-Deception Themes",
          subtitle: undefined as string | undefined,
          points: selfDeceptionPoints.length > 0 ? selfDeceptionPoints : INSIGHTS_CONTENT[0].points,
          playbackUrl: behaviorProfileData.self_deception_themes?.playback_urls?.playback_url as string | undefined,
          thumbnailUrl: behaviorProfileData.self_deception_themes?.playback_urls?.thumbnail_gif_url as string | undefined,
        },
        {
          title: "Underlying Motivations",
          subtitle: undefined as string | undefined,
          points: underlyingMotivations.length > 0 ? underlyingMotivations : INSIGHTS_CONTENT[1].points,
          playbackUrl: behaviorProfileData.underlying_motivations?.playback_urls?.playback_url as string | undefined,
          thumbnailUrl: behaviorProfileData.underlying_motivations?.playback_urls?.thumbnail_gif_url as string | undefined,
        },
        {
          title: "Common Conflicts",
          subtitle: undefined as string | undefined,
          points: commonConflictsPoints.length > 0 ? commonConflictsPoints : INSIGHTS_CONTENT[2].points,
          playbackUrl: behaviorProfileData.common_conflicts?.playback_urls?.playback_url as string | undefined,
          thumbnailUrl: behaviorProfileData.common_conflicts?.playback_urls?.thumbnail_gif_url as string | undefined,
        },
        {
          title: "What You Want Most",
          subtitle: "(But Often Struggle to Attain)" as string | undefined,
          points: whatYouWantMost.length > 0 ? whatYouWantMost : INSIGHTS_CONTENT[3].points,
          playbackUrl: behaviorProfileData.what_you_want_most?.playback_urls?.playback_url as string | undefined,
          thumbnailUrl: behaviorProfileData.what_you_want_most?.playback_urls?.thumbnail_gif_url as string | undefined,
        },
      ];
    }
    return INSIGHTS_CONTENT.map(item => ({
      ...item,
      subtitle: undefined as string | undefined,
      playbackUrl: undefined as string | undefined,
      thumbnailUrl: undefined as string | undefined,
    }));
  };

  const insightsContent = getInsightsContent();
  const strengths = behaviorProfileData?.current_strengths?.text || ["Clever", "Strategic", "Perceptive"];
  const { generalMuxUrls, onBeforePlay, onTokenError } = useMuxTokens();
  const displayTitle = title;

  const [strengthsVideoWatched, setStrengthsVideoWatched] = useState(isCompleted);
  const [generalVideoWatched, setGeneralVideoWatched] = useState(isCompleted);
  const [videosWatched, setVideosWatched] = useState<boolean[]>(
    new Array(insightsContent.length).fill(isCompleted)
  );

  const containerRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const pathRoadRef = useRef<SVGPathElement>(null);
  const insightsContainerRef = useRef<HTMLDivElement>(null);
  const endMarkerRef = useRef<HTMLDivElement>(null);

  const allVideosWatched = strengthsVideoWatched && generalVideoWatched && videosWatched.every((v) => v);

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

    // Use scrollHeight for accurate container height coverage
    const updateHeight = () => {
       // We only want the thread to go down to the "endMarker"
       const containerRect = container.getBoundingClientRect();
       const markerRect = endMarker.getBoundingClientRect();
       
       const threadHeight = markerRect.top - containerRect.top + (markerRect.height / 2);
       
       svg.style.height = `${threadHeight}px`;
       svg.setAttribute("viewBox", `0 0 1000 ${threadHeight}`);
       
       // Adjust steps for 7 total items (Strengths + Intro + Spectrum + 4 Insights)
       const totalSections = 7;
       const step = threadHeight / (totalSections + 1);
       
       // Build path d dynamically based on actual video/visual positions:
       // 1. Strengths: Right (750)
       // 2. Intro: Left (250)
       // 3. Spectrum Visual: Right (750)
       // 4. Insight 01: Left (250)
       // 5. Insight 02: Right (750)
       // 6. Insight 03: Left (250)
       // 7. Insight 04: Right (750)
       const xPositions = [750, 250, 750, 250, 750, 250, 750];

       let d = "M 500 0";
       let prevX = 500;
       for (let i = 0; i < totalSections; i++) {
         const yStart = step * (i + 0.2);
         const yEnd = step * (i + 0.8);
         const x = xPositions[i];
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
  }, [showThread]);

  return (
    <section
      ref={containerRef}
      id={id}
      className={`min-h-screen relative pt-20 pb-0 transition-opacity duration-1000 bg-[#F7F2EA] ${
        isUnlocked ? "opacity-100" : "opacity-40 pointer-events-none"
      }`}
    >
      {/* SVG Thread Container */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden md:block overflow-hidden">
         <svg
          ref={svgRef}
          className="w-full absolute top-0 left-0" 
          preserveAspectRatio="none"
        >
          <defs>
             <linearGradient id="threadGradientCh1" x1="0%" y1="0%" x2="0%" y2="100%">
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
            stroke="url(#threadGradientCh1)"
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
            Chapter 01
            </span>
            <h2 className="text-5xl md:text-6xl font-bold text-primary-text leading-tighter tracking-tighter mb-4">
            {displayTitle}
            </h2>
            <p className="text-xl md:text-2xl text-black/50 font-medium tracking-tight max-w-2xl mx-auto">
            {subtitle}
            </p>
        </motion.div>
      </div>

      {/* Current Strengths Section - Video on RIGHT, Points on LEFT, Sophisticated Subtle Background */}
      <div className="relative z-10 w-full mb-32 md:mb-48 px-4 md:px-8">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 1 }}
           className="max-w-7xl mx-auto bg-[#EFE9DE] rounded-[48px] p-8 md:p-16 relative overflow-hidden group border border-black/5 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.15)]"
        >
          {/* Subtle Parallax Background Spice */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-background/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 relative z-10">
            {/* Mobile Heading */}
            <div className="md:hidden w-full text-center mb-4">
              <h3 className="text-4xl font-bold text-primary-text leading-tight tracking-tighter">
                Current <span className="italic font-serif text-secondary-background">Strengths</span>
              </h3>
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
                <div className="relative group w-full max-w-[400px]">
                  {/* Premium Shadow Spice */}
                  <div className="absolute -inset-4 bg-secondary-background/5 rounded-[40px] blur-2xl group-hover:bg-secondary-background/10 transition-colors duration-700" />
                  <PredMindMuxPlayer
                    url={generalMuxUrls['current_strengths']?.playback_url}
                    thumbnailUrl={generalMuxUrls['current_strengths']?.thumbnail_gif_url}
                    onComplete={() => setStrengthsVideoWatched(true)}
                    isCompleted={strengthsVideoWatched}
                    onBeforePlay={onBeforePlay}
                    onTokenError={onTokenError}
                    showProgressTooltip
                  />
                </div>
              </motion.div>
            </div>

            {/* Text Side (Order 2 on mobile, 1 on desktop) */}
            <div className="w-full md:w-1/2 order-2 md:order-1">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* Desktop Heading (Hidden on mobile) */}
                <h3 className="hidden md:block text-4xl md:text-6xl font-bold text-primary-text leading-tight tracking-tighter">
                  Current <span className="italic font-serif text-secondary-background">Strengths</span>
                </h3>
                <div className="space-y-3 mt-8 md:mt-10">
                  {strengths.map((strength: string, i: number) => (
                    <div key={i} className="flex gap-4 items-start">
                      <span className="text-lg font-serif font-bold italic text-secondary-background mt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="text-xl text-black/70 font-[600] tracking-tight leading-relaxed">
                        {strength.charAt(0).toUpperCase() + strength.slice(1)}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Cinema Mode - General Section */}
      <div className="relative z-10 w-full mb-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto bg-[#1A1A1A] rounded-[48px] overflow-hidden shadow-2xl relative group">
          
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 p-8 md:p-16 relative z-10">
            {/* Mobile Heading */}
            <div className="lg:hidden w-full text-center mb-4">
              <h3 className="text-4xl font-bold text-white leading-tight">
                Understanding <br/><span className="italic font-serif text-secondary-background">Source Belief</span> <br/> Pattern
              </h3>
            </div>

            {/* Portrait Video (Order 1 on mobile, 1 on desktop) */}
            <div className="w-full lg:w-1/2 flex justify-center order-1">
              <div className="relative group w-full max-w-[380px]">
                <div className="absolute -inset-4 bg-secondary-background/20 rounded-[40px] blur-2xl group-hover:bg-secondary-background/30 transition-colors duration-700" />
                <div className="relative aspect-[9/16] border-[1px] border-white/10 rounded-[32px] overflow-hidden shadow-2xl bg-black">
                  <PredMindMuxPlayer
                    url={generalMuxUrls['source_belief_intro']?.playback_url}
                    thumbnailUrl={generalMuxUrls['source_belief_intro']?.thumbnail_gif_url}
                    onComplete={() => setGeneralVideoWatched(true)}
                    isCompleted={generalVideoWatched}
                    onBeforePlay={onBeforePlay}
                    onTokenError={onTokenError}
                    className="w-full h-full max-w-full border-0 shadow-none rounded-none"
                    showProgressTooltip
                  />
                  {/* Cinematic Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10" />
                </div>
              </div>
            </div>

            {/* General Theory (Order 2 on mobile, 2 on desktop) */}
            <div className="w-full lg:w-1/2 space-y-12 order-2">
              <div className="space-y-6">
                <h3 className="hidden lg:block text-4xl md:text-5xl font-bold text-white leading-tight">
                  Understanding <br/><span className="italic font-serif text-secondary-background">Source Belief</span> <br/> Pattern
                </h3>
                <div className="space-y-4">
                  <p className="text-white text-lg leading-relaxed max-w-xl font-medium">
                    Every human filters life through a subconscious belief formed in early childhood.
                  </p>
                  <p className="text-white text-lg leading-relaxed max-w-xl font-medium">
                    This belief becomes the “operating system” behind your perception, emotional reactions, and decision-making.
                  </p>
                  <p className="text-white text-lg leading-relaxed max-w-xl font-medium">
                    These core beliefs fall along a predictable spectrum — from Abandoned on the left to Rejection/Chaos on the right.
                  </p>
                  <p className="text-white text-lg leading-relaxed max-w-xl font-medium">
                    Your brain uses this belief to interpret safety, connection, conflict, and love.
                  </p>
                  <p className="text-white text-lg leading-relaxed max-w-xl font-medium">
                    Most people misidentify their own placement because they evaluate themselves based on who they want to be, not what their pattern actually does.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spectrum Visual on Light Background */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-32">
        {/* Interactive Prompt */}
        <div className="text-center mb-12">
            <h4 className="text-3xl md:text-4xl text-primary-text font-bold mb-4">
                Where do <span className="text-secondary-background italic font-serif">you</span> think you land?
            </h4>
            <p className="text-primary-text/40 text-sm md:text-base uppercase tracking-widest font-bold">
                Interact with the spectrum below to place your guess
            </p>
        </div>

        <div className="w-full">
          <SpectrumVisual 
            position={behaviorProfileData?.chart_range || 0} 
            // position={98}
            subtitle=""
          />
        </div>
      </div>

      {/* Alternating Insights */}
      <div ref={insightsContainerRef} className="relative z-10 max-w-7xl mx-auto px-6 space-y-32 md:space-y-48 pb-28 md:pb-32">
        {insightsContent.map((insight, index) => {
            const isVideoLeft = index % 2 === 0;

            return (
                <div 
                    key={index} 
                    className={`flex flex-col md:flex-row items-center gap-8 md:gap-24 ${!isVideoLeft ? 'md:flex-row-reverse' : ''}`}
                >
                    {/* Mobile Heading */}
                    <div className="md:hidden w-full text-center">
                        <span className="block text-secondary-background font-medium font-black text-xs tracking-[0.3rem] uppercase mb-2">
                            Insight {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="text-3xl font-bold text-primary-text mb-2">
                            {insight.title}
                        </h3>
                        {insight.subtitle && (
                            <p className="text-lg text-primary-text/60 italic mb-2">{insight.subtitle}</p>
                        )}
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
                                url={insight.playbackUrl}
                                thumbnailUrl={insight.thumbnailUrl}
                                onComplete={() => handleVideoEnd(index)}
                                isCompleted={videosWatched[index]}
                                onBeforePlay={onBeforePlay}
                                onTokenError={onTokenError}
                                showProgressTooltip
                            />
                        </motion.div>
                    </div>

                    {/* Text Side (Order 2 on mobile) */}
                    <div className={`w-full md:w-1/2 order-2 md:order-none ${!isVideoLeft ? 'pl-0 md:pl-16' : 'pr-0 md:pr-16'}`}>
                        <motion.div
                             initial={{ opacity: 0, x: isVideoLeft ? 50 : -50 }}
                             whileInView={{ opacity: 1, x: 0 }}
                             viewport={{ once: true }}
                             transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            {/* Desktop Heading (Hidden on mobile) */}
                            <div className="hidden md:block">
                                <span className="block text-secondary-background font-medium font-black text-sm tracking-[0.5rem] uppercase mb-3">
                                    Insight {String(index + 1).padStart(2, "0")}
                                </span>
                                <h3 className="text-3xl md:text-4xl font-bold text-primary-text mb-2">
                                    {insight.title}
                                </h3>
                                {insight.subtitle && (
                                    <p className="text-xl text-primary-text/60 italic mb-6">{insight.subtitle}</p>
                                )}
                            </div>

                            <div className="space-y-2 mt-0 md:mt-6">
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
        <div ref={endMarkerRef}></div>

      {/* Lock Overlay for Whole Chapter if Previous Not Complete */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F7F2EA]/90 backdrop-blur-[6px] z-50">
          <div className="flex flex-col items-center gap-4 text-primary-text">
            <div className="w-20 h-20 rounded-full border-[6px] border-secondary-background flex items-center justify-center mb-6 text-secondary-background shadow-xl">
              <Lock className="w-8 h-8" strokeWidth={3} />
            </div>
            <span className="text-sm font-black uppercase tracking-[0.3em] text-center max-w-[300px] leading-relaxed">
              Complete the Previous Chapter to Unlock
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
