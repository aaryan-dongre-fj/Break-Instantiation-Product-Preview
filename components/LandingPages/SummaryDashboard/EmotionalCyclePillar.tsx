"use client";

import React from "react";
import { ArrowDown } from "lucide-react";

export default function EmotionalCyclePillar({ behaviorProfileData }: { behaviorProfileData: any }) {
  const correctedReport = behaviorProfileData?.corrected_report?.[0];
  
  const formatEmotion = (text: string) => {
    if (!text) return "Pending";
    return text.split(/[- ]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("-");
  };

  const emotions = [
    { label: "Origin", value: formatEmotion(correctedReport?.eac_origin) },
    { label: "Protective", value: formatEmotion(correctedReport?.eac_protect) },
    { label: "Escalating", value: formatEmotion(correctedReport?.eac_esc) },
  ];

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 flex flex-col h-full">
      <div className="mb-8">
        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-secondary-background block mb-2">02</span>
        <h3 className="text-xl font-bold text-primary-text uppercase tracking-tight">Emotional Cycle</h3>
      </div>

      <div className="flex-1 flex flex-col justify-between py-2">
        {emotions.map((emotion, i) => (
          <React.Fragment key={i}>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1">{emotion.label}</p>
              <p className="text-xl font-bold text-primary-text">{emotion.value}</p>
            </div>
            {i < emotions.length - 1 && (
              <div className="flex justify-center my-2 text-secondary-background/30">
                <ArrowDown className="w-4 h-4" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
