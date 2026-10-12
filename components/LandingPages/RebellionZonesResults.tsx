"use client";

import { motion } from "framer-motion";
import { AlertCircle, Zap, Target, ShieldAlert } from "lucide-react";

interface RebellionZonesResultsProps {
  strengths?: string[];
  zones?: string[];
  longtermEffects?: string;
}

const RebellionZonesResults = ({
  strengths = ["Capable", "Assertive", "Strategic"],
  zones = [
    "Learning how to relinquish control in an intentional way and get your nervous system to comply",
    "Choosing peace instead of being “right” or having something done a specific way",
    "Considering longterm growth more than feeling safe in the moment",
    "Build trust and self-efficacy in people around you so they can do more on their own",
    "Repair previous conflict-prone dynamics through radical personal responsibility",
    "Adjusting your expectations for realism and audience"
  ],
  longtermEffects = "Sustained over-responsibility leading to burnout, relational distance and underlying tension, parenting approach yields either oppositional defiance or learned helplessness in children, in certain marital dynamics a possible lack of masculine and feminine polarity if woman is this pattern type."
}: RebellionZonesResultsProps) => {
  
  // Determine grid layout based on number of zones
  const isFewZones = zones.length <= 3;

  return (
    <div className="max-w-7xl mx-auto space-y-12">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
        {/* Longterm Effects - Flexible Column Span */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-8 bg-[#1A1A1A] rounded-[40px] p-10 flex flex-col space-y-8 border border-white/5 shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <div>
              <h4 className="text-2xl font-bold text-white tracking-tight">Longterm Effects</h4>
            </div>
          </div>
          
          <p className="text-xl text-white/80 leading-relaxed font-serif italic border-l-4 border-secondary-background/60 pl-8 py-2">
            {longtermEffects}
          </p>
        </motion.div>

        {/* Current Strengths - Flexible Column Span */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-4 bg-white rounded-[40px] p-10 flex flex-col space-y-8 shadow-sm border border-black/5"
        >
          <div className="flex items-center gap-4">
            <div>
              <h4 className="text-2xl font-bold text-black tracking-tight">Current Strengths</h4>
            </div>
          </div>

          <div className="space-y-4">
            {strengths.map((strength) => (
              <div key={strength} className="flex items-center gap-4 group">
                <div className="w-2 h-2 rounded-full bg-secondary-background group-hover:scale-150 transition-transform duration-300" />
                <span className="text-xl font-bold text-black tracking-tight">{strength}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* The Rebellion Zones - Flexible Masonry-style Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mx-4 bg-[#F2EDE4] rounded-[40px] p-12 relative overflow-hidden shadow-sm border border-black/5"
      >
        {/* <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <Target className="w-96 h-96 text-black" />
        </div> */}

        <div className="relative z-10 space-y-16">
          <div className="space-y-4">
            <h4 className="text-4xl font-black text-black tracking-tighter uppercase leading-none">Rebellion Zones</h4>
          </div>

          {/* Flexible Grid: Adjusts columns and sizing based on content count */}
          <div className={`grid gap-x-12 gap-y-12 ${
            isFewZones ? 'grid-cols-1 md:grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
          }`}>
            {zones.map((zone, i) => (
              <motion.div 
                key={i} 
                className="flex gap-8 group items-start"
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-secondary-background font-black text-sm group-hover:bg-secondary-background group-hover:text-white transition-all duration-500 border border-black/5">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="space-y-2 pt-2">
                  <p className={`font-bold text-black/90 leading-tight group-hover:text-black transition-colors ${
                    isFewZones ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
                  }`}>
                    {zone}
                  </p>
                  <div className="h-0.5 w-8 bg-secondary-background/20 group-hover:w-full transition-all duration-700" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RebellionZonesResults;
