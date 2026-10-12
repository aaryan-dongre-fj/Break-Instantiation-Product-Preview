"use client";

import { Lock, ArrowUp } from "lucide-react";

interface LockedChapterCardProps {
  currentChapterTitle: string;
  previousChapterTitle: string;
  previousChapterId: string;
}

export default function LockedChapterCard({
  currentChapterTitle,
  previousChapterTitle,
  previousChapterId,
}: LockedChapterCardProps) {
  const scrollToPrevious = () => {
    const element = document.getElementById(previousChapterId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex items-center justify-center bg-[#F7F2EA]/95 z-50 px-6">
      <div className="max-w-xl w-full bg-white rounded-[3rem] p-10 md:p-14 shadow-xl text-center">
        <div className="w-20 h-20 rounded-full bg-secondary-background/10 text-secondary-background flex items-center justify-center mb-8 mx-auto">
          <Lock className="w-8 h-8" strokeWidth={2.5} />
        </div>
        
        <h3 className="text-3xl font-bold text-primary-text mb-4">
          Chapter Locked
        </h3>
        
        <p className="text-lg text-primary-text/60 leading-relaxed mb-10">
          You must complete <span className="font-bold text-primary-text">{previousChapterTitle}</span> to get access to <span className="font-bold text-primary-text">{currentChapterTitle}</span>.
        </p>

        <button 
          onClick={scrollToPrevious}
          className="inline-flex items-center gap-2 px-8 py-4 bg-secondary-background text-white rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
        >
          <span>Go to Previous Chapter</span>
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

