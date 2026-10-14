"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import ReportNavbar from "../AppNavbar/ReportNavbar";
import { withCompany } from "@/utils/company";

export default function VerificationState() {
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSmsOptIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !phone.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(withCompany("/api/verificationSmsOptIn"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setPhone("");
        toast.success("Thanks! We'll text you when your results are ready.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-primary-background text-primary-text relative">
      <div className="relative min-h-screen bg-primary-background">
        <ReportNavbar />

        {/* Main Content */}
        <main className="relative z-10 min-h-screen flex items-center pt-[88px] sm:pt-[96px] lg:pt-[104px] pb-12 sm:pb-16 lg:pb-20 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full max-w-[1400px] mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 lg:gap-20 xl:gap-24 items-center">
              {/* Left: Text content */}
              <div className="space-y-6 sm:space-y-8 order-1">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-secondary-background/5 rounded-full text-secondary-background font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em]">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  Verification in Progress
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight leading-[1.08] text-left py-1">
                  Your Pattern is being{" "}
                  <span className="italic font-serif text-secondary-background">
                    verified.
                  </span>
                </h1>

                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-black/50 leading-relaxed font-medium text-left max-w-xl">
                  Our advisors are meticulously reviewing your
                  pattern to ensure absolute precision. Your results will be
                  ready within{" "}
                  <span className="font-bold text-secondary-background">
                    24 hours
                  </span>
                  , and you will be notified by email when they&apos;re ready for
                  review.
                </p>

                <div className="space-y-4 pt-2 sm:pt-4">
                  <p className="text-base sm:text-lg text-black/60 leading-relaxed font-medium">
                    Want us to send a text message when the results are ready?
                  </p>

                  <form
                    onSubmit={handleSmsOptIn}
                    className="flex flex-col sm:flex-row gap-3 sm:items-center max-w-lg"
                  >
                    <div className="flex-1 w-full sm:min-w-0">
                      <PhoneInput
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={setPhone}
                        defaultCountry="US"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting || !phone}
                      className="h-12 w-full sm:w-auto px-8 rounded-full bg-secondary-background text-white font-bold text-sm uppercase tracking-wider hover:bg-secondary-background/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                      {isSubmitting ? "Submitting…" : "Notify Me"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right: Video */}
              <div className="flex justify-center lg:justify-end order-2">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative group w-full max-w-[260px] sm:max-w-[300px] md:max-w-[340px] lg:max-w-[380px]"
                >
                  <div className="absolute -inset-3 sm:-inset-4 bg-secondary-background/10 rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] blur-xl lg:blur-2xl group-hover:bg-secondary-background/20 transition-colors duration-700" />
                  <video
                    poster="/fingerprints-poster.jpg"
                    className="relative w-full aspect-[9/16] object-cover rounded-[20px] sm:rounded-[24px] lg:rounded-[32px] border-4 sm:border-[5px] lg:border-[6px] border-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4)] lg:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)]"
                    muted
                    playsInline
                    autoPlay
                    loop
                    preload="auto"
                    onLoadedMetadata={(e) => {
                      const video = e.currentTarget;
                      if (video.paused) video.play().catch(() => {});
                    }}
                  >
                    <source src="/fingerprints.webm" type="video/webm" />
                  </video>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Subtle background decoration */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,#CCA077_0%,transparent_70%)] opacity-10 blur-[100px]" />
          <svg
            className="hidden sm:block w-full h-full opacity-20"
            preserveAspectRatio="none"
            viewBox="0 0 1000 1000"
          >
            <path
              d="M 500 0 C 500 250, 200 250, 200 500 C 200 750, 800 750, 800 1000"
              fill="none"
              stroke="#CCA077"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
