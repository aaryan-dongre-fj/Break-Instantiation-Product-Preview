"use client";

import React from "react";
import { motion } from "framer-motion";
import SourceBeliefPillar from "./SourceBeliefPillar";
import EmotionalCyclePillar from "./EmotionalCyclePillar";
import TimelinePillar from "./TimelinePillar";
import RebellionZonesPillar from "./RebellionZonesPillar";
import { FileDown, LayoutDashboard } from "lucide-react";

interface SummaryDashboardProps {
  modelResponseData: any;
  behaviorProfileData: any;
  isDashboardView?: boolean; // If true, show as the "Home Base" dashboard
  onRevisitJourney?: () => void;
  onDownloadReport?: () => void;
}

export default function SummaryDashboard({
  modelResponseData,
  behaviorProfileData,
  isDashboardView = false,
  onRevisitJourney,
  onDownloadReport,
}: SummaryDashboardProps) {
  return (
    <section className={`w-full bg-[#F7F2EA] py-24 px-6 lg:px-16 relative overflow-hidden ${isDashboardView ? 'min-h-screen flex flex-col justify-center' : ''}`}>
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-background/10 rounded-full text-secondary-background font-bold text-[10px] uppercase tracking-[0.2em]">
              <LayoutDashboard className="w-3 h-3" />
              {isDashboardView ? "Command Center" : "Summary"}
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-primary-text tracking-tight">
              Your Brain <span className="italic font-serif text-secondary-background">Map</span>
            </h2>
            <p className="text-primary-text/40 text-lg md:text-xl font-medium max-w-xl">
              A high-level snapshot of your pattern architecture.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {isDashboardView && onRevisitJourney && (
              <button
                onClick={onRevisitJourney}
                className="flex items-center gap-3 bg-transparent border border-black/10 px-8 py-4 rounded-full hover:bg-black/5 transition-all text-sm font-black uppercase tracking-widest text-primary-text"
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

        {/* Pillars Grid - 2x2 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SourceBeliefPillar behaviorProfileData={behaviorProfileData} />
          <EmotionalCyclePillar behaviorProfileData={behaviorProfileData} />
          <TimelinePillar behaviorProfileData={behaviorProfileData} />
          <RebellionZonesPillar behaviorProfileData={behaviorProfileData} />
        </div>
      </div>
    </section>
  );
}
