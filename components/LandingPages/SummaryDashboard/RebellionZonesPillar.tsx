"use client";

import React from "react";
import { Zap } from "lucide-react";

export default function RebellionZonesPillar({ behaviorProfileData }: { behaviorProfileData: any }) {
  const zones = behaviorProfileData?.rebellion_zones?.text || [];
  const displayZones = zones.slice(0, 3); // Just show the top 3 for the snapshot

  return (
    <div className="bg-[#141414] rounded-[32px] p-8 shadow-xl border border-white/5 flex flex-col h-full text-white">
      <div className="mb-8">
        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-secondary-background block mb-2">04</span>
        <h3 className="text-xl font-bold text-white uppercase tracking-tight">Rebellion Zones</h3>
      </div>

      <div className="flex-1 space-y-4">
        {displayZones.length > 0 ? (
          displayZones.map((zone: string, i: number) => (
            <div key={i} className="flex gap-3 items-start group">
              <div className="mt-1">
                <Zap className="w-3 h-3 text-secondary-background fill-secondary-background" />
              </div>
              <p className="text-sm font-medium text-white/70 leading-snug group-hover:text-white transition-colors">
                {zone}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-white/30 italic uppercase tracking-widest text-center mt-12">
            Verification Pending
          </p>
        )}
        
        {zones.length > 3 && (
          <p className="text-[10px] text-secondary-background font-bold uppercase tracking-widest pt-2">
            + {zones.length - 3} More in Full Report
          </p>
        )}
      </div>
    </div>
  );
}
