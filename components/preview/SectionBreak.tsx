"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import EditorialHeading from "./EditorialHeading";

/**
 * Section-break interstitial for `content: "section"`: editorial heading and
 * intro on the left,
 * the section's looping square video card on the right, one PROCEED button.
 *
 * The heading and intro copy come from the API's authored section object;
 * the looping visual is the numbered clip production shows for that section
 * (`/{number}.webm`). A stand-in line renders if a section has no authored
 * description.
 */
export default function SectionBreak({
  heading,
  description,
  number,
  onProceed,
  disabled,
}: {
  heading: string;
  description?: string;
  number: number;
  onProceed: () => void;
  disabled?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Production's numbered section clips run 1–14; wrap for longer walks.
  const clipNumber = ((number - 1) % 14) + 1;

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [heading]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen pt-[88px] w-full m-0 bg-primary-background text-primary-text flex flex-col relative overflow-y-auto"
    >
      <div className="flex-1 flex flex-col justify-center pt-4 pb-8 lg:pt-6 lg:pb-10 w-full max-w-7xl mx-auto px-6 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center space-y-5 lg:space-y-6 w-full md:pl-8 lg:pl-12"
          >
            <h2 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-left">
              <EditorialHeading text={heading} />
            </h2>

            <div className="text-primary-text/50 font-sans font-medium text-lg md:text-xl leading-normal tracking-tight max-w-xl whitespace-pre-line">
              {description?.trim()
                ? description.replace(/\\n/g, "\n")
                : "The live questionnaire introduces this section here — this one has no authored intro copy yet."}
            </div>

            <motion.div
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.5 }}
              className="pt-2"
            >
              <Button
                onClick={onProceed}
                disabled={disabled}
                className="bg-primary-text text-primary-background hover:bg-primary-text/90 hover:cursor-pointer font-medium text-base px-8 py-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                PROCEED TO SECTION
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-[380px] xl:max-w-[420px] mx-auto aspect-square border-6 border-white shadow-xl rounded-3xl overflow-hidden"
          >
            <video
              key={clipNumber}
              poster={`/${clipNumber}-poster.jpg`}
              autoPlay
              loop
              muted
              playsInline
              className={`absolute inset-0 w-full h-full object-cover scale-[1.01] ${
                clipNumber === 3 ? "object-right" : "object-center"
              }`}
              preload="auto"
            >
              <source src={`/${clipNumber}.webm`} type="video/webm" />
              <source src={`/${clipNumber}.mp4`} type="video/mp4" />
            </video>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
