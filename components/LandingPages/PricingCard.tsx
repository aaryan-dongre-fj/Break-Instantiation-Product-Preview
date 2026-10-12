"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X, ArrowUpRight } from "lucide-react";

export type PricingPlan = {
  id?: string;
  title: string;
  titleWords: string[];
  description: string;
  descriptionBold?: string[];
  features?: string[];
  disabledFeatures?: string[];
  showFeatures?: boolean;
  price?: string;
  buttonText: string;
  buttonIcon?: boolean;
  footerText?: string;
  href?: string;
};

export default function PricingCard({
  plan,
  formatDescription,
}: {
  plan: PricingPlan;
  formatDescription: (text: string, boldPhrases?: string[]) => string;
}) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-10 lg:p-14 border border-black/5 relative overflow-hidden"
    >
      <div className="flex-grow">
        {/* Title */}
        <div className="mb-8">
          {plan.titleWords.map((word, i) => (
            <h3
              key={i}
              className={`text-3xl sm:text-4xl md:text-4xl font-medium tracking-tight leading-[1.1] text-black ${i > 0 ? 'opacity-100' : ''}`}
            >
              {word}
            </h3>
          ))}
        </div>

        {/* Description */}
        <p
          className="text-lg leading-relaxed mb-6 font-medium text-black/80 [&_strong]:text-black [&_strong]:font-bold"
          dangerouslySetInnerHTML={{
            __html: formatDescription(plan.description, plan.descriptionBold),
          }}
        />

        {/* Divider and Features */}
        {plan.showFeatures && (
          <div className="mb-8">
            <div className="h-px w-full bg-black/10 mb-6" />
            <h4 className="text-lg font-medium mb-6 text-black">
              What you will get:
            </h4>
            <div className="space-y-4">
              {plan.features?.map((feature, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full border border-black/80 flex items-center justify-center">
                      <Check
                        className="w-3 h-3 text-black"
                        strokeWidth={3}
                      />
                    </div>
                  </div>
                  <span className="text-base font-medium text-black leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
              {plan.disabledFeatures?.map((feature, i) => (
                <div
                  key={`disabled-${i}`}
                  className="flex items-start gap-4 opacity-30"
                >
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full border border-black/80 flex items-center justify-center">
                      <X
                          className="w-3 h-3 text-black"
                          strokeWidth={2}
                      />
                    </div>
                  </div>
                  <span className="text-base font-normal text-black leading-relaxed line-through">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pricing and Action */}
      {plan.price && (
        <div className="mt-8">
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-[3rem] font-medium tracking-tighter text-primary-text leading-none">
                {plan.price}
            </span>
          </div>

          {plan.footerText && (
            <div className="mb-8 text-[16px] leading-relaxed font-medium text-black/80 tracking-normal max-w-[400px]">
              {plan.footerText
                ?.split(".")
                .filter(Boolean)
                .map((sentence, i) => (
                  <span key={i} className="block">
                    {sentence.trim()}.
                  </span>
                ))}
            </div>
          )}
          
          <motion.button
            className={`group relative w-full rounded-full py-6 px-8 font-bold text-lg overflow-hidden transition-all duration-300 bg-black text-white`}
            initial="initial"
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative flex items-center justify-center gap-2 h-[1.5rem]">
              <motion.span
                className="absolute inset-0 flex items-center justify-center gap-2"
                variants={{
                  initial: { y: 0, opacity: 1 },
                  hover: { y: 30, opacity: 0 },
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {plan.buttonText}
                {plan.buttonIcon && <ArrowUpRight className="w-5 h-5" />}
              </motion.span>

              <motion.span
                className="absolute inset-0 flex items-center justify-center gap-2"
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
                {plan.buttonText}
                {plan.buttonIcon && <ArrowUpRight className="w-5 h-5" />}
              </motion.span>
            </div>
          </motion.button>
        </div>
      )}
    </motion.div>
  );

  if (plan.href) {
    return (
      <a 
        href={plan.href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block h-full"
      >
        {content}
      </a>
    );
  }

  return content;
}
