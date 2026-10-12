"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import PricingCard, { PricingPlan } from "./PricingCard";
import PricingSectionV2 from "./PricingSectionV2";
import CurriculumSneakPeek from "./CurriculumSneakPeek";
import PredMindMuxPlayer from "./PredMindMuxPlayer";
import { useMuxTokens } from "./MuxTokenContext";
import { instance } from "@/utils/instance";

// Two relevant pricing plans for this section
const rewirePlans: PricingPlan[] = [
  {
    title: `${instance.productName} Program - Online Only`,
    titleWords: [instance.productName, "Program - Online", "Only"],
    description:
      `Ideal for clients looking to kickstart their understanding of ${instance.productName} with a focus on video-based modules and weekly open group sessions to get questions answered.`,
    features: [
      "Weekly Group Zoom sessions",
      "4 In-Depth Course Modules",
      "24/7 Community Support",
      "Practical Home Support Tools",
      "Final strategy PDF",
    ],
    disabledFeatures: [
      "1:1 Calls with a dedicated advisor",
      "Access to Our Annual LIVE Event",
    ],
    showFeatures: true,
    price: "$899",
    buttonText: "Enroll Now",
    buttonIcon: true,
    footerText:
      "No-refunds available. Payment plans with Affirm available at checkout for those who qualify. Disclosures",
  },
  {
    title: `${instance.productName} Program+`,
    titleWords: [instance.productName, "Program+"],
    description:
      `The full program is engineered for lasting change, moving you out of passive awareness and into specific actions that create measurable behavioral change. After your ${instance.productName} session identifies the pattern architecture driving your thoughts, emotions, and decisions, you'll progress through six highly structured appointments—each intentionally designed to expose self-deception, reveal blindspots, and reach the root of your patterns as efficiently as possible.<br /><br />There is no talking in circles or recapping your week; not a second is wasted. Every appointment generates custom tools and a plan mapped directly to your results, giving you the exact actions required to disrupt ingrained loops and build new, stable behavioral pathways that hold.`,
    descriptionBold: [
      "lasting change",
      "specific actions",
      "appointments",
      "not a second is wasted",
      "custom tools and a plan",
    ],
    features: [
      "A Diagnostic Evaluation",
      "Six 1:1 Calls with an advisor",
      "4 In-Depth Video Modules",
      "Weekly Group Zoom Sessions",
      "Final strategy PDF",
      "24/7 Community Support",
      "Access to Our Annual LIVE Event",
    ],
    showFeatures: true,
    price: "$2799",
    buttonText: "Enroll Now",
    buttonIcon: true,
    footerText:
      "No-refunds available. Payment plans with Affirm available at checkout for those who qualify. Disclosures",
  },
];

export default function HowToRewire({ onBookCall }: { onBookCall?: () => void }) {
  const { generalMuxUrls, onBeforePlay, onTokenError } = useMuxTokens();

  const formatDescription = (text: string, boldPhrases?: string[]) => {
    if (!boldPhrases || boldPhrases.length === 0) {
      return text;
    }
    let formattedText = text;
    boldPhrases.forEach((phrase) => {
      const regex = new RegExp(`(${phrase})`, "gi");
      formattedText = formattedText.replace(regex, `<strong>$1</strong>`);
    });
    return formattedText;
  };

  return (
    <section className="w-full bg-[#F7F2EA] pt-32 pb-24 px-6 lg:px-16 relative overflow-hidden">
      {/* Visual Connector - Thread Continuation */}
      {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-secondary-background/50 to-transparent hidden md:block" /> */}
      
      <div className="max-w-[1250px] mx-auto flex flex-col items-center">
        
        {/* 1. Header & Tutorial Section */}
        <div className="flex flex-col items-center justify-center mb-16 lg:mb-24 text-center max-w-5xl w-full relative">
          {/* Decorative Background Element */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-secondary-background/10 rounded-full blur-[120px] pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 relative z-10"
          >
            <span className="text-secondary-background font-black text-xs tracking-[0.5em] uppercase mb-6 block">
              The Methodology
            </span>
            <h2 className="text-6xl sm:text-7xl font-serif italic font-semibold leading-[0.85] tracking-tighter mb-10 text-primary-text">
              How <span className="font-serif italic text-secondary-background">it works</span>
            </h2>
            <p className="text-xl md:text-2xl text-black/50 font-semibold max-w-3xl mx-auto leading-tight">
              You&apos;ve identified the pattern architecture. Now discover the <span className="text-black/80">exact protocol</span> to rewire it.
            </p>
          </motion.div>

          {/* Vertical Video Player - Matched with ChapterOne */}
          <motion.div
             initial={{ opacity: 0, scale: 0.9, y: 30 }}
             whileInView={{ opacity: 1, scale: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
             className="relative w-full max-w-[440px] group mx-auto flex justify-center"
          >
             <PredMindMuxPlayer
                url={generalMuxUrls['how_to_rewire_section']?.playback_url}
                thumbnailUrl={generalMuxUrls['how_to_rewire_section']?.thumbnail_gif_url}
                onBeforePlay={onBeforePlay}
                onTokenError={onTokenError}
                className="w-full h-full mx-auto"
             />
          </motion.div>
        </div>

        {/* 2. Sneak Peek (Perspective Gallery) */}
        <div className="w-full mb-16 lg:mb-24 relative pt-16 lg:pt-24 border-t border-black/5">
             <div className="text-center mb-16">
                 <h3 className="text-sm font-black uppercase tracking-[0.4em] text-secondary-background mb-4">Inside the Course</h3>
                 <p className="text-5xl md:text-6xl font-semibold text-primary-text tracking-tighter">Unlock the <span className="font-serif italic text-secondary-background/80">full methodology.</span></p>
             </div>

             <CurriculumSneakPeek />

        </div>

        {/* 3. Pricing Section (Two Plans) */}
        <div id="pricing-section" className="w-full mb-16 lg:mb-24 scroll-mt-24">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto items-stretch">
               {/* Use the extracted PricingCard component */}
               {/* {rewirePlans.map((plan, index) => (
                   <PricingCard 
                      key={index} 
                      plan={plan} 
                      formatDescription={formatDescription} 
                   />
               ))} */}
           </div>
           <PricingSectionV2 />
        </div>

        {/* 4. Book a Call — hidden when the preview has no owner */}
        {onBookCall ? (
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-4xl bg-[#141414] rounded-[3rem] p-12 md:p-16 relative overflow-hidden text-white text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5"
        >
            {/* Background Texture/Gradient */}
            <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-secondary-background/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute inset-0 bg-[url('/background/gemini-brain-pattern.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
               <span className="text-secondary-background font-serif italic text-lg md:text-xl mb-6 block">
                 Personal Guidance
               </span>
               <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-[0.9] tracking-tighter">
                 Not sure where to start? <br/>
                 <span className="text-white/60">Let us guide you.</span>
               </h3>
               
               <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl leading-relaxed font-medium">
                 This is a deep process. If you&apos;re unsure which path fits your specific pattern, book a clarity call with our team.
               </p>

               <motion.button
                   onClick={onBookCall}
                   className="group relative bg-secondary-background text-white rounded-full py-6 px-12 font-bold text-xl overflow-hidden min-w-[280px] shadow-[0_20px_40px_-10px_rgba(204,160,119,0.4)]"
                   initial="initial"
                   whileHover="hover"
                   whileTap={{ scale: 0.98 }}
               >
                   <div className="relative flex items-center justify-center gap-3 h-[1.5rem]">
                      {/* Default Text - Slides DOWN out of view */}
                      <motion.span
                        className="absolute inset-0 flex items-center justify-center gap-3"
                        variants={{
                          initial: { y: 0, opacity: 1 },
                          hover: { y: 30, opacity: 0 },
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <span className="uppercase tracking-widest text-sm">Book a Call</span>
                        <ArrowUpRight className="w-5 h-5" />
                      </motion.span>

                      {/* Hover Text - Slides DOWN into view from top */}
                      <motion.span
                        className="absolute inset-0 flex items-center justify-center gap-3"
                        variants={{
                          initial: { y: -30, opacity: 0 },
                          hover: { y: 0, opacity: 1 },
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          delay: 0.05,
                        }}
                      >
                        <span className="uppercase tracking-widest text-sm">Book a Call</span>
                        <ArrowUpRight className="w-5 h-5" />
                      </motion.span>
                   </div>
               </motion.button>
            </div>
        </motion.div>
        ) : null}
      </div>
    </section>
  );
}
