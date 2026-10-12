"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { InlineWidget } from "react-calendly";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendarLink: string;
}

const APP_ROOT_SELECTOR = "[data-bpm-app-root]";

export default function BookingModal({
  isOpen,
  onClose,
  calendarLink,
}: BookingModalProps) {
  const calendlyContainerRef = useRef<HTMLDivElement>(null);
  const [calendlyHeight, setCalendlyHeight] = useState(640);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock scroll + hide page behind modal.
  // iOS Safari can paint transformed page layers above iframes unless the page is hidden.
  useEffect(() => {
    if (!isOpen) return;

    const appRoot = document.querySelector(APP_ROOT_SELECTOR) as HTMLElement | null;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevRootVisibility = appRoot?.style.visibility ?? "";
    const prevRootPointerEvents = appRoot?.style.pointerEvents ?? "";

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    if (appRoot) {
      appRoot.style.visibility = "hidden";
      appRoot.style.pointerEvents = "none";
      appRoot.inert = true;
    }

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      if (appRoot) {
        appRoot.style.visibility = prevRootVisibility;
        appRoot.style.pointerEvents = prevRootPointerEvents;
        appRoot.inert = false;
      }
    };
  }, [isOpen]);

  // Calendly iframe needs an explicit pixel height on mobile Safari.
  useEffect(() => {
    if (!isOpen || !calendlyContainerRef.current) return;

    const node = calendlyContainerRef.current;
    const updateHeight = () => {
      const next = Math.max(node.getBoundingClientRect().height, 320);
      setCalendlyHeight(next);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);
    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          data-booking-modal
          className="fixed inset-0 z-[10050]"
          data-lenis-prevent
          role="presentation"
        >
          {/* Opaque backdrop — no blur on mobile (iOS compositing bugs) */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-0 bg-black sm:bg-black/70 sm:backdrop-blur-sm cursor-default"
            aria-label="Close booking modal"
          />

          {/* Full-screen panel on mobile */}
          <div className="absolute inset-0 z-10 flex items-stretch sm:items-center justify-center sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto relative flex w-full flex-col overflow-hidden bg-[#FFFEF8] sm:max-w-6xl sm:rounded-[40px] sm:border sm:border-white/20 sm:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] h-[100dvh] sm:h-[90vh] sm:max-h-[850px]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-modal-title"
            >
              {/* Header */}
              <div className="relative z-30 flex shrink-0 items-center justify-between border-b border-black/5 bg-[#FFFEF8] px-5 py-4 sm:px-10 sm:py-6">
                <h3
                  id="booking-modal-title"
                  className="text-lg font-bold tracking-tight text-primary-text sm:text-xl"
                >
                  Schedule{" "}
                  <span className="font-serif italic text-secondary-background">
                    Session
                  </span>
                </h3>

                <button
                  type="button"
                  onClick={onClose}
                  className="relative z-30 -mr-1 rounded-full p-2.5 text-black/60 transition-colors hover:bg-black/5 hover:text-black touch-manipulation"
                  aria-label="Close"
                >
                  <X className="h-6 w-6 pointer-events-none" />
                </button>
              </div>

              {/* Calendly */}
              <div
                ref={calendlyContainerRef}
                className="relative z-20 min-h-0 flex-1 overflow-hidden bg-[#FFFEF8] isolate"
                data-lenis-prevent
              >
                {calendarLink ? (
                  <InlineWidget
                    url={calendarLink}
                    styles={{
                      height: `${calendlyHeight}px`,
                      minHeight: `${calendlyHeight}px`,
                      width: "100%",
                    }}
                    pageSettings={{
                      backgroundColor: "FFFEF8",
                      hideEventTypeDetails: false,
                      hideLandingPageDetails: false,
                      primaryColor: "CCA077",
                      textColor: "070401",
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-8 text-center text-sm text-black/50">
                    Booking link unavailable. Please try again later.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
