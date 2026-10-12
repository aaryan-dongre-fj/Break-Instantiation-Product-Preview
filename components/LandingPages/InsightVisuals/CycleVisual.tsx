"use client";

import { motion } from "framer-motion";

interface CycleVisualProps {
  origin?: { label: string; items: string[] };
  protective?: { label: string; items: string[] };
  escalating?: { label: string; items: string[] };
}

export default function CycleVisual({
  origin = { label: "Fear", items: ["1-", "5+"] },
  protective = { label: "Covert Anger", items: ["5-", "4+"] },
  escalating = { label: "Anxiety-Apathy", items: ["4+", "6+/-"] },
}: CycleVisualProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full py-16 px-8 bg-[#F2EDE4] rounded-[40px] relative overflow-hidden">

      <h2 className="text-4xl md:text-6xl font-bold text-black mb-16 tracking-tight">
        Emotional Addiction Cycle
      </h2>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {/* Origin */}
        <motion.div
          variants={item}
          className="bg-white rounded-3xl p-8 border-2 border-transparent hover:border-secondary-background transition-colors min-h-[400px]"
        >
          <span className="text-[10px] text-primary-text/40 font-bold uppercase tracking-widest block mb-2">
            Origin
          </span>
          <h3 className="text-3xl font-bold text-black mb-8">{origin.label}</h3>
          <div className="space-y-12">
            {origin.items.map((val, i) => (
              <div
                key={i}
                className="text-2xl font-bold text-primary-text/30 border-t border-primary-text/10 pt-4"
              >
                {val}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Protective */}
        <motion.div
          variants={item}
          className="bg-white rounded-3xl p-8 border-2 border-transparent hover:border-secondary-background transition-colors min-h-[400px]"
        >
          <span className="text-[10px] text-primary-text/40 font-bold uppercase tracking-widest block mb-2">
            Protective
          </span>
          <h3 className="text-3xl font-bold text-black mb-8">
            {protective.label}
          </h3>
          <div className="space-y-12">
            {protective.items.map((val, i) => (
              <div
                key={i}
                className="text-2xl font-bold text-primary-text/30 border-t border-primary-text/10 pt-4"
              >
                {val}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Escalating */}
        <motion.div
          variants={item}
          className="bg-white rounded-3xl p-8 border-2 border-transparent hover:border-secondary-background transition-colors min-h-[400px]"
        >
          <span className="text-[10px] text-primary-text/40 font-bold uppercase tracking-widest block mb-2">
            Escalating
          </span>
          <h3 className="text-3xl font-bold text-black mb-8">
            {escalating.label}
          </h3>
          <div className="space-y-12">
            {escalating.items.map((val, i) => (
              <div
                key={i}
                className="text-2xl font-bold text-primary-text/30 border-t border-primary-text/10 pt-4"
              >
                {val}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          variants={item}
          className="bg-white rounded-3xl p-8 min-h-[400px] flex flex-col justify-center"
        >
          <h3 className="text-2xl font-bold text-black mb-6">Summary</h3>
          <p className="text-sm text-primary-text/60 leading-relaxed mb-4">
            Performance comparison across social, search, and display channels.
            Performance comparison across social, search, and display channels.
          </p>
          <p className="text-sm text-primary-text/60 leading-relaxed">
            Performance comparison across social, search, and display channels.
            Performance comparison across social, search, and display channels.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
