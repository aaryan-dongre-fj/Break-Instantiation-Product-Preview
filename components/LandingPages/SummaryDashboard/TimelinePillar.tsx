"use client";

import React from "react";

export default function TimelinePillar({ behaviorProfileData }: { behaviorProfileData: any }) {
  const correctedReport = behaviorProfileData?.corrected_report?.[0];

  const markers = [
    { label: "Primary", value: correctedReport?.primary || "Pending" },
    { label: "Secondary", value: correctedReport?.secondary || "Pending" },
    { label: "Tertiary 1", value: correctedReport?.tertiary_1 || "Pending" },
    { label: "Tertiary 2", value: correctedReport?.tertiary_2 || "Pending" },
  ];

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 flex flex-col h-full">
      <div className="mb-8">
        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-secondary-background block mb-2">03</span>
        <h3 className="text-xl font-bold text-primary-text uppercase tracking-tight">Timeline Numbers</h3>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4">
        {markers.map((marker, i) => (
          <div key={i} className="bg-[#F7F2EA]/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-black/5">
            <p className="text-[9px] font-black uppercase tracking-widest text-black/30 mb-1">{marker.label}</p>
            <p className="text-lg font-black text-secondary-background">{marker.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
