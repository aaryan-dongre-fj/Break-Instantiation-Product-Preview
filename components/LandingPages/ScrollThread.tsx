"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { HERO_THREAD_MEDIA_QUERY } from "./threadBreakpoints";

gsap.registerPlugin(ScrollTrigger);

interface ScrollThreadProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  sectionCount?: number;
}

export default function ScrollThread({
  containerRef,
  sectionCount = 2,
}: ScrollThreadProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const pathRef2 = useRef<SVGPathElement>(null);
  const [isReady, setIsReady] = useState(false);

  // The <svg> below is `hidden lg:block`, so under 1024px none of this is ever
  // painted. Skipping the setup keeps scroll work off phones and tablets.
  const showThread = useMediaQuery(HERO_THREAD_MEDIA_QUERY);

  useEffect(() => {
    if (!showThread) return;

    const container = containerRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    const path2 = pathRef2.current;

    if (!container || !svg || !path || !path2) return;

    // Use a fixed coordinate height that matches our simpler 2-section layout
    const coordinateHeight = 2000;

    svg.setAttribute("viewBox", `0 0 1000 ${coordinateHeight}`);

    const dValue = `
M 500 0 C 778 404 32 1243 36 831 C 41 657 405 622 518 1003 C 563 1183 426 1241 500 1360`;

    // Inverted X coordinates relative to 500 for the second thread to create intertwining effect
    const dValue2 = `
M 600 0 C 778 404 63 1286 105 850 C 141 657 305 622 518 1003 C 607 1219 326 1241 500 1360
    `;

    path.setAttribute("d", dValue);
    path2.setAttribute("d", dValue2);

    const pathLength = path.getTotalLength();
    const pathLength2 = path2.getTotalLength();

    // Initial setup: completely hidden
    gsap.set([path, path2], {
      strokeDasharray: pathLength, // assuming relatively similar length
      strokeDashoffset: pathLength,
    });

    // Fix for slightly different lengths
    gsap.set(path2, {
      strokeDasharray: pathLength2,
      strokeDashoffset: pathLength2,
    });

    setIsReady(true);

    const ctx = gsap.context(() => {
      // Animate entry: reveal the start of the thread slightly
      const tl = gsap.timeline({
        onComplete: () => {
          // Once entry is done, enable scroll control
          gsap.to([path, path2], {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top top",
              end: "bottom bottom",
              scrub: 1,
            },
          });
        },
      });

      tl.to(
        path,
        {
          strokeDashoffset: pathLength * 0.7,
          duration: 1.5,
          ease: "power2.out",
        },
        0
      );

      tl.to(
        path2,
        {
          strokeDashoffset: pathLength2 * 0.7,
          duration: 1.5,
          ease: "power2.out",
        },
        0
      );
    }, container);

    return () => ctx.revert();
  }, [sectionCount, containerRef, showThread]);

  return (
    <svg
      ref={svgRef}
      className="hidden lg:block pointer-events-none absolute top-0 left-0 z-[1]"
      fill="none"
      preserveAspectRatio="xMidYMin meet"
      style={{
        width: "100%",
        height: "100%", // Fit container height
        opacity: isReady ? 0.8 : 0,
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "100vw",
      }}
    >
      <defs>
        <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop
            offset="0%"
            stopColor="var(--predmind-secondary-background)"
            stopOpacity="1"
          />
          <stop
            offset="80%"
            stopColor="var(--predmind-secondary-background)"
            stopOpacity="1"
          />
          <stop
            offset="100%"
            stopColor="var(--predmind-secondary-background)"
            stopOpacity="0.1"
          />
        </linearGradient>
        <linearGradient id="fadeGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop
            offset="0%"
            stopColor="var(--predmind-secondary-background)"
            stopOpacity="0.6"
          />
          <stop
            offset="80%"
            stopColor="var(--predmind-secondary-background)"
            stopOpacity="0.6"
          />
          <stop
            offset="100%"
            stopColor="var(--predmind-secondary-background)"
            stopOpacity="0.1"
          />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        stroke="url(#fadeGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        ref={pathRef2}
        stroke="url(#fadeGradient2)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
