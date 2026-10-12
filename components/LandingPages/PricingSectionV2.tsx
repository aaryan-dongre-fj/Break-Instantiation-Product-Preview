"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, ShieldCheck, X } from "lucide-react";
import { instance } from "@/utils/instance";

const AffirmLogo = ({ isDark = false }: { isDark?: boolean }) => (
  <svg 
    className="h-5 w-auto inline-block relative -top-[4px] mx-0.5" 
    enableBackground="new 0 0 420 167" 
    viewBox="0 0 420 167" 
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Affirm"
  >
    <g clipRule="evenodd" fillRule="evenodd">
      <g fill={isDark ? "#ffffff" : "#060809"}>
        <path d="m34.3 94.1c-11.3 0-24.4 5.4-31.5 11l6.5 13.6c5.7-5.2 14.9-9.6 23.2-9.6 7.9 0 12.2 2.6 12.2 7.9 0 3.6-2.9 5.4-8.3 6.1-20.4 2.6-36.4 8.2-36.4 23.9 0 12.4 8.9 20 22.7 20 9.9 0 18.7-5.5 22.9-12.7v10.7h18.4v-44.9c0-18.5-12.9-26-29.7-26zm-6.9 58.5c-5.2 0-7.8-2.5-7.8-6.7 0-7.8 8.7-10.4 24.6-12.1.1 10.4-7 18.8-16.8 18.8z"></path>
        <path d="m237.5 107.7v-11.6h-18.4v68.9h19.7v-33.2c0-15.8 9.5-20.4 16.2-20.4 2.6 0 6.1.8 8.4 2.5l3.6-18.2c-3-1.3-6.2-1.6-8.8-1.6-10.1 0-16.5 4.5-20.7 13.6z"></path>
        <path d="m358.4 94.1c-10.4 0-18.2 6.2-22.3 12.1-3.8-7.7-11.7-12.1-21.3-12.1-10.4 0-17.6 5.8-21 12.4v-10.4h-19v68.9h19.7v-35.5c0-12.7 6.7-18.8 12.9-18.8 5.6 0 10.8 3.6 10.8 13v41.3h19.8v-35.5c0-12.9 6.5-18.8 13-18.8 5.2 0 10.7 3.8 10.7 12.9v41.4h19.7v-47.6c0-15.5-10.4-23.3-23-23.3z"></path>
        <path d="m133.6 91v5.1h-29.9v-7c0-9.1 5.2-11.7 9.7-11.7 2.6 0 6 .6 8.8 2.2l6.1-13.9c-3.6-2.1-9.5-4-17.4-4-12.6 0-26.9 7.1-26.9 29.4v5.1h-11.4v15.2h11.4v53.6h19.7v-53.7h29.9v53.7h19.7v-53.7h17.9v-15.2h-17.9v-7c0-9.1 5.2-11.7 9.7-11.7 5 0 8.8 2.2 8.8 2.2l6.1-13.9s-6.2-4-17.4-4c-12.5-.1-26.9 7-26.9 29.3z"></path>
        <path d="m182.9 96.1h19.7v68.9h-19.7z"></path>
      </g>
      <path d="m297.7 0c-53.2 0-100.6 36.9-114 84.4h19.3c11.2-35.4 49.3-66.4 94.7-66.4 55.2 0 102.8 42 102.8 107.4 0 14.7-1.9 27.9-5.5 39.6h18.7l.2-.6c3.1-12.1 4.6-25.2 4.6-39 0-72.9-53.1-125.4-120.8-125.4" fill="#4a4af4"></path>
    </g>
  </svg>
);

interface PricingPlanV2 {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  description: string;
  features: string[];
  disabledFeatures?: string[];
  cta: string;
  theme: "light" | "dark";
}

const plans: PricingPlanV2[] = [
  {
    id: "online-only",
    title: `${instance.productName} Program`,
    subtitle: "Online Only",
    price: "899",
    description: "The essential methodology for self-paced behavioral strategy and neural re-patterning.",
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
    cta: "Enroll Now",
    theme: "light"
  },
  {
    id: "program-plus",
    title: `${instance.productName} Program+`,
    subtitle: "Full Program",
    price: "2,799",
    description: `A high-proximity experience mapped to your specific ${instance.productName} results.`,
    features: [
      "A Diagnostic Evaluation",
      "Six 1:1 Calls with an advisor",
      "4 In-Depth Video Modules",
      "Weekly Group Zoom Sessions",
      "Final strategy PDF",
      "24/7 Community Support",
      "Access to Our Annual LIVE Event",
    ],
    cta: "Enroll Now",
    theme: "dark"
  }
];

export default function PricingSectionV2() {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  return (
    <div className="w-full relative overflow-hidden">

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Area */}
        <div className="flex flex-col items-center mb-12 text-center">
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tighter text-primary-text mb-2">
            Select Your <span className="font-serif italic text-secondary-background">Path.</span>
          </h2>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch mb-16">
          {plans.map((plan) => {
            const isDark = plan.theme === "dark";
            const isHovered = hoveredPlan === plan.id;

            return (
              <motion.div
                key={plan.id}
                onHoverStart={() => setHoveredPlan(plan.id)}
                onHoverEnd={() => setHoveredPlan(null)}
                className={`relative flex flex-col rounded-[3rem] p-10 md:p-14 transition-all duration-500 overflow-hidden shadow-2xl ${
                  isDark 
                    ? "bg-[#141414] text-white border border-white/5" 
                    : "bg-white text-primary-text border border-black/5"
                } ${isHovered ? "scale-[1.02]" : "scale-100"}`}
              >
                {/* Background Textures for Dark Card */}
                {isDark && (
                  <>
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary-background/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute inset-0 bg-[url('/background/gemini-brain-pattern.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                  </>
                )}

                <div className="relative z-10 flex flex-col h-full">
                  {/* Card Header */}
                  <div className="mb-12">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col">
                        <h3 className="text-4xl font-bold tracking-normal">{plan.title}</h3>
                        <span className={`text-xl font-black font-serif italic tracking-normal mt-2 ${isDark ? "text-secondary-background" : "text-secondary-background"}`}>
                          {plan.subtitle}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-5xl font-medium tracking-normal">${plan.price}</span>
                    </div>

                    <p className={`text-lg font-medium leading-relaxed ${isDark ? "text-white/60" : "text-black/50"}`}>
                      {plan.description}
                    </p>
                  </div>

                  

                  {/* Features List */}
                  <div className="flex-1 space-y-5 mb-12">
                    <h4 className={`text-[12px] font-black uppercase tracking-[0.3em] mb-6 ${isDark ? "text-white/40" : "text-black/40"}`}>
                      Program Components
                    </h4>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isDark ? "bg-secondary-background/20" : "bg-secondary-background/20"}`}>
                          <Check className="w-3 h-3 text-secondary-background" />
                        </div>
                        <span className={`text-sm font-semibold ${isDark ? "text-white/80" : "text-black/70"}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                    {plan.disabledFeatures?.map((feature, i) => (
                      <div key={`disabled-${i}`} className={`flex items-center gap-4 opacity-30`}>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isDark ? "border-white/20" : "border-black/80"}`}>
                          <X className={`w-3 h-3 ${isDark ? "text-white" : "text-black"}`} strokeWidth={2} />
                        </div>
                        <span className={`text-sm font-normal line-through ${isDark ? "text-white/80" : "text-black/70"}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Disclosures Section */}
                  <div className={`text-[11px] font-bold leading-relaxed tracking-widest ${isDark ? "text-white/50" : "text-black/50"}`}>
                    <p className="uppercase mb-3">No-refunds available.</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-start flex-wrap gap-x-1">
                        <span className="uppercase">Payment plans with</span>
                        <AffirmLogo isDark={isDark} />
                        <span className="uppercase">available</span>
                      </div>
                      <span className="uppercase">at checkout for those who qualify.</span>
                      <a 
                        href="https://www.affirm.com/disclosures" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`uppercase underline hover:opacity-70 transition-opacity mt-1 ${isDark ? "text-white/60" : "text-black/60"}`}
                      >
                        Disclosures
                      </a>
                    </div>
                  </div>

                  {/* CTA Area */}
                  <div className={`mt-auto pt-10 `}>
                    <a 
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <motion.button
                        className={`group relative w-full rounded-full py-6 px-8 font-black text-sm uppercase tracking-[0.3em] overflow-hidden transition-all duration-300 ${
                          isDark 
                            ? "bg-white text-black" 
                            : "bg-black text-white"
                        }`}
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
                            {plan.cta}
                            <ArrowUpRight className="w-4 h-4" />
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
                            {plan.cta}
                            <ArrowUpRight className="w-4 h-4" />
                          </motion.span>
                        </div>
                      </motion.button>
                    </a>
                    
                    <div className="mt-6 flex items-center justify-center gap-6 opacity-50 group-hover:opacity-90 transition-opacity">
                      <div className="flex items-center gap-1.5 grayscale opacity-50">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[12px] font-black uppercase tracking-widest">Secure Checkout</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}