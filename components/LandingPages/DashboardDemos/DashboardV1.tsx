"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileDown, LayoutDashboard, ArrowRight } from "lucide-react";
import StaticSpectrumVisual from "./StaticSpectrumVisual";
import HowToRewire from "../HowToRewire";
import { normalizePoint, getCorrectedReportRow } from "../Report/pdf/utils";

interface DashboardV1Props {
  modelResponseData?: any;
  behaviorProfileData: any;
  onRevisitJourney?: () => void;
  onBookCall?: () => void;
  onDownloadReport?: () => void;
}

export default function DashboardV1({
  behaviorProfileData,
  onRevisitJourney,
  onBookCall,
  onDownloadReport,
}: DashboardV1Props) {
  const profile = behaviorProfileData;
  const cr = getCorrectedReportRow(profile);
  const effectiveModifier = profile?.modifier?.trim() || profile?.interaction_style || null;
  const modifierDisplay = effectiveModifier ? normalizePoint(effectiveModifier) : "Not Set";
  const sourceBeliefFields = [
    { label: "Origin Belief", value: profile?.osb || "Not Set" },
    { label: "Adaptive Belief", value: profile?.asb || "Not Set", isAccent: true },
    { label: "Modifier", value: modifierDisplay },
    { label: "Self Trust", value: profile?.self_trust || "Not Set" },
  ];

  const formatEmotion = (text: string) => {
    if (!text) return "Unset";
    return text.split(/[- ]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("-");
  };

  const timelinePrimary = cr?.primary || "—";
  const timelineSecondary = cr?.secondary || "—";
  const timelineTertiary1 = cr?.tertiary_1 || "—";
  const timelineTertiary2 = cr?.tertiary_2 || "—";
  
  // Data processing for right column
  const allStrengths = profile?.current_strengths?.text || [];
  const displayStrengths = allStrengths.slice(0, 3);
  const remainingStrengths = allStrengths.length - 3;

  const allRebellionZones = profile?.rebellion_zones?.text || [];
  const displayRebellionZones = allRebellionZones.slice(0, 3);
  const remainingRebellionZones = allRebellionZones.length - 3;

  const scrollToRewire = () => {
    const element = document.getElementById("rewire-options");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F2EA] relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full pt-8 sm:pt-12 px-4 sm:px-6 lg:px-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-background/10 rounded-full text-secondary-background font-bold text-[10px] uppercase tracking-[0.2em]">
              <LayoutDashboard className="w-3 h-3" />
              Dashboard
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-text tracking-tight">
              Your <span className="italic font-serif text-secondary-background font-light">report</span>
            </h2>
            <p className="text-primary-text/40 text-lg md:text-xl font-medium max-w-xl">
              A high-level snapshot of your pattern architecture.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onRevisitJourney && (
              <button
                onClick={onRevisitJourney}
                className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full hover:bg-black/80 transition-all text-sm font-black uppercase tracking-widest"
              >
                Revisit Journey
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDownloadReport}
              className="flex items-center gap-3 bg-white border border-black/5 px-8 py-4 rounded-full shadow-sm hover:shadow-md transition-all text-sm font-black uppercase tracking-widest text-primary-text"
            >
              <FileDown className="w-4 h-4 text-secondary-background" />
              Download Full Report
            </motion.button>
          </div>
        </div>

        <div className="border-t-4 border-secondary-background mb-8" />

        <div className="grid grid-cols-12 gap-6 mb-24">
          {/* Column 1: Core Architecture */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-black/5 rounded-[32px] shadow-sm overflow-hidden">
              
              {/* 1. Pattern Profile Content (Now First) */}
              <section className="px-4 sm:px-8 lg:px-12 py-6 lg:py-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-primary-text uppercase tracking-tight">Source Belief Pattern</h3>
                </div>
                <div className="bg-[#F7F2EA] rounded-[28px] border border-black/[0.05] px-6 sm:px-8 py-4">
                  {sourceBeliefFields.map((field, index) => (
                    <div
                      key={field.label}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4 ${
                        index === sourceBeliefFields.length - 1
                          ? ""
                          : "border-b border-black/[0.06]"
                      }`}
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest text-black/60">
                        {field.label}
                      </p>
                      <p
                        className={`text-lg sm:text-xl font-bold tracking-tight sm:text-right ${
                          field.isAccent
                            ? "text-secondary-background"
                            : "text-primary-text"
                        }`}
                      >
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="h-px bg-black/[0.05] mx-4 sm:mx-8 lg:mx-12" />

              {/* 2. Source Belief Spectrum (Now Second) */}
              <section className="px-4 sm:px-8 lg:px-12 py-6 lg:py-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-primary-text uppercase tracking-tight">Source Belief Spectrum</h3>
                </div>
                <StaticSpectrumVisual position={profile?.chart_range || 0} />
              </section>

              <div className="h-px bg-black/[0.05] mx-4 sm:mx-8 lg:mx-12" />

              {/* 3. Emotional Addiction Cycle (EAC) */}
              <section className="px-4 sm:px-8 lg:px-12 py-6 lg:py-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-primary-text uppercase tracking-tight">Emotional Addiction Cycle</h3>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { label: "Origin", val: formatEmotion(cr?.eac_origin || profile?.eac_origin || "") },
                    { label: "Protective", val: formatEmotion(cr?.eac_protect || profile?.eac_protect || "") },
                    { label: "Escalating", val: formatEmotion(cr?.eac_esc || profile?.eac_esc || "") }
                  ].map((em, i) => (
                    <div key={i} className="p-6 bg-[#F7F2EA] rounded-2xl border border-black/[0.03] text-center">
                      <p className="text-[9px] font-black text-black/30 uppercase tracking-widest mb-2">{em.label}</p>
                      <p className="text-sm font-bold text-primary-text uppercase tracking-tight leading-tight">{em.val}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="h-px bg-black/[0.05] mx-4 sm:mx-8 lg:mx-12" />

              {/* 4. Timeline Numbers */}
              <section className="px-4 sm:px-8 lg:px-12 py-6 lg:py-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-primary-text uppercase tracking-tight">Timeline Numbers</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {[
                     { val: timelinePrimary, label: "PRIMARY" },
                     { val: timelineSecondary, label: "SECONDARY" },
                     { val: timelineTertiary1, label: "TERTIARY 1" },
                     { val: timelineTertiary2, label: "TERTIARY 2" }
                   ].map((pt, i) => (
                     <div key={i} className="bg-[#F7F2EA] rounded-2xl p-6 text-center border border-black/[0.03]">
                        <p className="text-lg font-bold text-primary-text mb-1">{pt.val}</p>
                        <p className="text-[10px] font-black text-black/30 tracking-[0.2em] uppercase">{pt.label}</p>
                     </div>
                   ))}
                </div>
              </section>
            </div>
          </div>

          {/* Column 2: Insights & Action */}
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            {/* Current Strengths */}
            <div className="bg-white border border-black/5 rounded-[32px] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-primary-text uppercase tracking-tight">Current Strengths</h3>
              </div>
              <div className="space-y-3">
                {displayStrengths.length > 0 ? (
                  displayStrengths.map((strength: string, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-secondary-background/5 rounded-2xl border border-secondary-background/10">
                      <div className="w-1.5 h-1.5 bg-secondary-background rounded-full" />
                      <p className="text-sm font-bold text-primary-text uppercase tracking-tight">{strength}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-black/30 font-medium italic">Calculating strengths...</p>
                )}
                {remainingStrengths > 0 && (
                  <p className="text-[10px] font-black text-secondary-background uppercase tracking-widest text-center pt-2">
                    + {remainingStrengths} more in full report
                  </p>
                )}
              </div>
            </div>

            {/* Rebellion Zones */}
            <div className="bg-[#1A1A1A] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-8 relative z-10">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Rebellion Zones</h3>
              </div>
              <div className="space-y-3 relative z-10">
                {displayRebellionZones.length > 0 ? (
                  displayRebellionZones.map((zone: string, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="w-1.5 h-1.5 bg-secondary-background rounded-full" />
                      <p className="text-[11px] text-white font-bold uppercase tracking-tight">{zone}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/30 font-medium italic">Analyzing zones...</p>
                )}
                {remainingRebellionZones > 0 && (
                  <p className="text-[10px] font-black text-secondary-background uppercase tracking-widest text-center pt-2">
                    + {remainingRebellionZones} more in full report
                  </p>
                )}
              </div>
            </div>

            {/* CTA Card - Now smooth scrolls to rewire section */}
            <motion.button 
              whileHover={{ y: -4 }}
              onClick={scrollToRewire}
              className="w-full bg-secondary-background rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm uppercase tracking-widest">Next steps</h3>
                <ArrowRight className="w-5 h-5" />
              </div>
              <p className="text-lg font-bold leading-tight mb-2">
                Access your custom action-protocol.
              </p>
              <p className="text-white/60 text-sm font-medium">
                Choose the path that fits your needs.
              </p>
            </motion.button>
          </aside>
        </div>
      </div>

      {/* The Decision Bridge: How to Rewire Section */}
      <div id="rewire-options" className="border-t border-black/5">
        <HowToRewire onBookCall={onBookCall} />
      </div>
    </div>
  );
}
