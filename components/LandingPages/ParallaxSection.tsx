"use client";

import { useRef, useEffect, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { THREAD_MEDIA_QUERY } from "./threadBreakpoints";
import { motion } from "framer-motion";
import PredMindMuxPlayer from "./PredMindMuxPlayer";
import { useMuxTokens } from "./MuxTokenContext";

gsap.registerPlugin(ScrollTrigger);

type ParallaxSectionProps = {
  id: string;
  title: ReactNode;
  description: ReactNode;
  imageUrl: string;
  bgSpeed?: number;
  textOffset?: number;
};

export default function ParallaxSection({
  id,
  title,
  description,
  imageUrl,
  bgSpeed = 0.4,
  textOffset = 60,
}: ParallaxSectionProps) {
  const { generalMuxUrls, onBeforePlay, onTokenError } = useMuxTokens();
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  // Desktop only — one less scroll-linked animation running on phones. Note the
  // background layer this drives currently has no image in it (see below), so
  // this animation has no visible output on any device as things stand.
  const runParallax = useMediaQuery(THREAD_MEDIA_QUERY);

  useEffect(() => {
    if (!runParallax) return;

    const section = sectionRef.current;
    const bg = bgRef.current;

    if (!section || !bg) return;

    const ctx = gsap.context(() => {
      // ===== BACKGROUND PARALLAX =====
      gsap.to(bg, {
        yPercent: bgSpeed * 100,
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
  }, [bgSpeed, runParallax]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className="relative min-h-screen w-full overflow-x-clip flex items-center pt-[72px] lg:pt-[88px] pb-10 sm:pb-14 lg:pb-16"
    >
      {/* Background Layer */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-[90%] -top-[5%] will-change-transform"
      >
        {/* <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover opacity-50"
          loading="lazy"
        /> */}
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 lg:gap-20 xl:gap-24 items-center w-full max-w-[1400px] mx-auto">
          {/* Left Side: Title */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full overflow-visible"
          >
            {typeof title === "string" ? (
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-primary-text drop-shadow-sm py-1">
                {title}
              </h2>
            ) : (
              title
            )}
          </motion.div>

          {/* Right Side: Vertical Video (Story-like) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative group w-full max-w-[320px] md:max-w-[400px] mx-auto lg:ml-auto lg:mr-0">
              {/* Decorative Glow */}
              <div className="absolute -inset-4 bg-secondary-background/10 rounded-[40px] blur-2xl group-hover:bg-secondary-background/20 transition-colors duration-700" />

              <PredMindMuxPlayer
                url={generalMuxUrls['overall_break_down_of_bpm_and_9_markers']?.playback_url}
                thumbnailUrl={generalMuxUrls['overall_break_down_of_bpm_and_9_markers']?.thumbnail_gif_url}
                onBeforePlay={onBeforePlay}
                onTokenError={onTokenError}
                className="w-full aspect-[9/16] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
