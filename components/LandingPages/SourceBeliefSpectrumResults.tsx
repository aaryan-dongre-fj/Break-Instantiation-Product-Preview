"use client";

import { motion } from "framer-motion";
import SpectrumVisual from "./InsightVisuals/SpectrumVisual";

type SourceBeliefSpectrumResultsProps = {
  behaviorProfileData?: any;
};

const SourceBeliefSpectrumResults = ({ behaviorProfileData }: SourceBeliefSpectrumResultsProps) => {
  // Get data from behaviorProfileData or use empty strings/arrays
  const osb = behaviorProfileData?.osb || "";
  const asb = behaviorProfileData?.asb || "";
  const modifier = behaviorProfileData?.modifier || "";
  const selfDeceptionThemes = behaviorProfileData?.self_deception_themes?.text || "";
  const underlyingMotivations = behaviorProfileData?.underlying_motivations?.text || [];
  const commonConflicts = behaviorProfileData?.common_conflicts?.text || "";
  const whatYouWantMost = behaviorProfileData?.what_you_want_most?.text || "";

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      {/* Summary Header */}
      <div className="space-y-6">
        <h3 className="text-3xl md:text-5xl font-bold text-primary-text tracking-tight">
          Your Source Belief Pattern
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Source Belief Summary (White Card) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-[40px] p-12 shadow-sm border border-black/5 flex flex-col items-start text-left space-y-12"
        >
          <h4 className="text-4xl font-bold text-black flex items-center gap-2">
            Source{" "}
            <span className="font-black text-secondary-background">Belief</span>
          </h4>

          <div className="w-full space-y-10">
            <div className="space-y-2">
              <h5 className="text-4xl font-bold text-black tracking-tight">
                {osb}
              </h5>
              <p className="text-[12px] uppercase tracking-[0.2em] font-bold text-black/40">
                Origin Source Belief
              </p>
            </div>

            <div className="h-px bg-black/10 w-full" />

            <div className="space-y-2">
              <h5 className="text-4xl font-bold text-black tracking-tight">
                {asb}
              </h5>
              <p className="text-[12px] uppercase tracking-[0.2em] font-bold text-black/40">
                Adaptive Source Belief
              </p>
            </div>

            <div className="h-px bg-black/10 w-full" />

            <div className="space-y-2">
              <h5 className="text-4xl font-bold text-black tracking-tight">
                {modifier}
              </h5>
              <p className="text-[12px] uppercase tracking-[0.2em] font-bold text-black/40">
                Modifier
              </p>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Pattern Breakdown (Dark Card) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-[#1A1A1A] rounded-[40px] p-12 shadow-xl flex flex-col space-y-10"
        >
          <div className="space-y-2">
            <h4 className="text-4xl font-bold text-white leading-tight">
              Origin + Adaptive Source Belief
            </h4>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <h5 className="text-secondary-background font-bold text-lg">
                Self-Deception Themes:
              </h5>
              <p className="text-white/80 leading-relaxed italic">
                {selfDeceptionThemes}
              </p>
            </div>

            <div className="space-y-3">
              <h5 className="text-secondary-background font-bold text-lg">
                Underlying Motivations:
              </h5>
              {underlyingMotivations.length > 0 ? (
                <ul className="text-white/80 leading-relaxed space-y-2">
                  {underlyingMotivations.map((motivation: string, index: number) => (
                    <li key={index}>
                      • {motivation}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-white/80 leading-relaxed"></p>
              )}
            </div>

            <div className="space-y-3">
              <h5 className="text-secondary-background font-bold text-lg">
                Common Conflicts:
              </h5>
              <p className="text-white/80 leading-relaxed">
                {commonConflicts}
              </p>
            </div>

            <div className="space-y-3">
              <h5 className="text-secondary-background font-bold text-lg">
                What You Want Most (But Often Struggle to Attain):
              </h5>
              <p className="text-white/80 leading-relaxed font-semibold">
                {whatYouWantMost}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Graph Visual Row */}
      <div className="w-full">
        <SpectrumVisual position={behaviorProfileData?.chart_range || 0} />
      </div>
    </div>
  );
};

export default SourceBeliefSpectrumResults;
