"use client";

import React from "react";

export default function SourceBeliefPillar({ behaviorProfileData }: { behaviorProfileData: any }) {
  const correctedReport = behaviorProfileData?.corrected_report?.[0];
  const origin = correctedReport?.osb || behaviorProfileData?.osb || "Not Set";
  const adaptive = correctedReport?.asb || behaviorProfileData?.asb || "Not Set";
  const modifier = correctedReport?.modifier || behaviorProfileData?.modifier || "";
  const interactionStyle = correctedReport?.interaction_style || behaviorProfileData?.interaction_style || "";
  const selfTrust = correctedReport?.self_trust || behaviorProfileData?.self_trust || "";

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 flex flex-col h-full">
      <div className="mb-8">
        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-secondary-background block mb-2">01</span>
        <h3 className="text-xl font-bold text-primary-text uppercase tracking-tight">Source Belief</h3>
      </div>

      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1">Origin</p>
            <p className="text-lg font-bold text-primary-text">{origin}</p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1">Adaptive</p>
            <p className="text-lg font-bold text-primary-text">{adaptive}</p>
          </div>
        </div>

        {modifier && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1">Modifier</p>
            <p className="text-lg font-bold text-secondary-background italic font-serif">{modifier}</p>
          </div>
        )}

        {(interactionStyle || selfTrust) && (
          <div className="pt-4 border-t border-black/[0.03] grid grid-cols-2 gap-6">
            {interactionStyle && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1">Interaction Style</p>
                <p className="text-md font-bold text-primary-text">{interactionStyle}</p>
              </div>
            )}
            {selfTrust && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1">Self Trust</p>
                <p className="text-md font-bold text-primary-text">{selfTrust}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
