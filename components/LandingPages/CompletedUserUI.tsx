"use client";
import React, { useRef, useState, useEffect } from "react";
import BackgroundImage from "@/public/background/predmind-thread-bg.png";
import ParallaxSection from "./ParallaxSection";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import ScrollThread from "./ScrollThread";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CardsSectionV2 from "./CardsSectionV2";
import BookingModal from "./BookingModal";
import DashboardV1 from "./DashboardDemos/DashboardV1";
import ReportPreviewModal from "./Report/ReportPreviewModal";
import ReportNavbar from "../AppNavbar/ReportNavbar";

gsap.registerPlugin(ScrollTrigger);

type CompletedUserUIProps = {
  isBookUser: boolean;
  isMiscCampaignUser: boolean;
  isBookQrUser: boolean;
  isCorporateFunnelUser: boolean;
  showCalendly: boolean;
  calendarLink: string;
  isBsVIPUser: boolean;
  modelResponseData: any;
  behaviorProfileData: any;
  timelineProfileData: any;
  hasPattern: boolean;
  userName?: string;
};

export default function CompletedUserUI({
  isBookUser,
  isMiscCampaignUser,
  isBookQrUser,
  isCorporateFunnelUser,
  showCalendly,
  calendarLink,
  isBsVIPUser,
  modelResponseData,
  behaviorProfileData,
  timelineProfileData,
  hasPattern,
  userName = "User",
}: CompletedUserUIProps) {
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isToggled, setIsToggled] = useState(false);
  // Once the scroll into the cards section finishes, the toggle section is
  // unmounted. The hero above it stays.
  const [toggleRemoved, setToggleRemoved] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  const [dashboardVersion, setDashboardVersion] = useState<number>(0); // 0: Normal, 1: Dashboard
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const journeyCompleted = localStorage.getItem("bpm_journey_completed") === "true";
    if (journeyCompleted) {
      setDashboardVersion(1);
    } else {
      try {
        const saved = localStorage.getItem("bpm_progress");
        if (saved) {
          const { completed } = JSON.parse(saved);
          if (completed && completed.length >= 4) {
            setDashboardVersion(1);
          }
        }
      } catch {}
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Add Lenis update to GSAP ticker
    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Cleanup
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const reset = () => {
      window.scrollTo(0, 0);
      lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    };
    reset();
    // Run again on the next frame, after the new view has laid out.
    const id = requestAnimationFrame(reset);
    return () => cancelAnimationFrame(id);
  }, [dashboardVersion]);

  // Handle auto-scroll when toggled
  useEffect(() => {
    if (isToggled) {
      // Brief delay so cards mount before smooth scroll
      const timer = setTimeout(() => {
        if (cardsRef.current && lenisRef.current) {
          // Force Lenis to recalculate dimensions to ensure it knows the page has grown
          lenisRef.current.resize();
          // ScrollTrigger.refresh();

          lenisRef.current.scrollTo(cardsRef.current, {
            offset: 0,
            duration: 1.5, // Slightly longer for a more luxurious feel
            easing: (t) => {
              // Custom cubic bezier approximation for "Slow Start -> Fast Middle -> Slow End"
              // Roughly equivalent to cubic-bezier(0.65, 0, 0.35, 1)
              return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            },
            lock: true,
            // force: true,
            onComplete: () => setToggleRemoved(true),
          });
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isToggled]);

  // Removing the toggle section shortens the page above the cards. The scroll
  // ended with the cards at the top of the viewport, so re-pin to the cards'
  // new offset rather than adjusting by a delta.
  useEffect(() => {
    if (!toggleRemoved) return;
    // Run after the DOM has committed the removal and laid out.
    const id = requestAnimationFrame(() => {
      const target = cardsRef.current?.offsetTop ?? 0;
      window.scrollTo(0, target);
      lenisRef.current?.resize();
      lenisRef.current?.scrollTo(target, { immediate: true, force: true });
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [toggleRemoved]);

  // Pause Lenis while overlays are open so background page doesn't scroll.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (isCalendlyOpen || isReportModalOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [isCalendlyOpen, isReportModalOpen]);

  // Calculate Heading and Description Content
  let headingContent;
  let descriptionContent;

  if (isBookUser) {
    headingContent = (
      <div className="w-full lg:max-w-3xl overflow-visible py-1">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.08] tracking-tight text-left font-bold text-primary-text">
          Thank you for completing{" "}
          <span className="text-secondary-background font-bold">
            your assessment
          </span>
        </h1>
      </div>
    );
    descriptionContent = (
      <div className="w-full flex justify-start lg:justify-end">
        <div className="text-primary-text/80 text-base md:text-xl leading-relaxed max-w-xl text-left lg:text-right">
          Our advisors have received your results and are currently
          reviewing the results. Please be on the lookout for an email with your
          report in the next 24 hours.
        </div>
      </div>
    );
  } else {
    headingContent = (
      <div className="w-full lg:max-w-4xl overflow-visible py-1">
        <h1 className="text-primary-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.08] tracking-tight text-left">
          Your{" "}
          <span className="text-secondary-background font-bold">
            report
          </span>{" "}
          is ready
        </h1>
      </div>
    );

    let descText;
    if (isMiscCampaignUser) {
      descText = (
        <p>
          Thank you! We will follow up with an email to bring to your YTT
          training shortly.
        </p>
      );
    } else if (isBookQrUser) {
      descText = (
        <p>
          Thank you for completing your assessment! Use the "Book a
          Session" button to book your follow-up session where an advisor
          will review your personalized report with you
          and guide you through understanding your results.
        </p>
      );
    } else if (isCorporateFunnelUser) {
      descText = (
        <p>
          Thank you for completing your corporate assessment! Use the "Book a
          Session" button to schedule your corporate consultation where our
          team will review your organization&apos;s report and discuss
          implementation strategies for your team.
        </p>
      );
    } else if (showCalendly) {
      descText = (
        <p>
          Use the "Book a Session" button to book your session to review your
          report. On this session, an advisor will deliver
          your report and teach you how to understand it.
        </p>
      );
    } else {
      descText = (
        <p>
          Thank you for submitting your responses to the assessment
          questionnaire. Your advisor will review your results and
          your report with you in your next session.
        </p>
      );
    }

    descriptionContent = (
      <div className="w-full flex justify-start lg:justify-end mt-8 lg:mt-12">
        <div className="text-primary-text/80 text-base md:text-xl leading-relaxed max-w-xl text-left lg:text-right">
          {descText}
        </div>
      </div>
    );
  }

  // Hold rendering until we've read localStorage so the correct view
  // is shown on the very first paint — no flash between journey and dashboard.
  if (!isInitialized) {
    return <div className="min-h-screen bg-primary-background" />;
  }

  if (dashboardVersion === 1) {
    return (
      <div
        data-bpm-app-root
        className="min-h-screen w-full m-0 overflow-x-hidden bg-[#F7F2EA] text-primary-text relative"
      >
        <ReportNavbar variant="sticky" backgroundClassName="bg-[#F7F2EA]" />
        <DashboardV1
          modelResponseData={modelResponseData}
          behaviorProfileData={behaviorProfileData}
          onRevisitJourney={() => { setDashboardVersion(0); setToggleRemoved(false); setIsToggled(true); }}
          onBookCall={showCalendly ? () => setIsCalendlyOpen(true) : undefined}
          onDownloadReport={() => setIsReportModalOpen(true)}
        />

        {!isCalendlyOpen && !isReportModalOpen && (
        <button
          onClick={() => setDashboardVersion(0)}
          className="fixed bottom-4 left-4 z-[9999] bg-black/40 hover:bg-black/60 text-white/70 hover:text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-all duration-200"
        >
          View report
        </button>
        )}

        <BookingModal
          isOpen={isCalendlyOpen}
          onClose={() => setIsCalendlyOpen(false)}
          calendarLink={calendarLink}
        />

        <ReportPreviewModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          modelResponseData={modelResponseData}
          behaviorProfileData={behaviorProfileData}
          timelineProfileData={timelineProfileData}
          userName={userName}
        />
      </div>
    );
  }

  return (
    <div
      id="top"
      data-bpm-app-root
      className="min-h-screen w-full m-0 overflow-x-hidden bg-primary-background text-primary-text relative"
    >
      <div ref={heroRef} className="relative bg-primary-background">
        <ScrollThread
          containerRef={heroRef as React.RefObject<HTMLDivElement>}
        />

        {/* Navbar overlays hero — same background, no divider */}
        <ReportNavbar />

        {/* Hero */}
        <ParallaxSection
          id="hero"
          title={headingContent}
          description={descriptionContent}
          imageUrl={BackgroundImage.src}
        />
        {/* 3. Toggle Section — unmounts once the scroll into the cards settles */}
        {!toggleRemoved && (
        <div className="h-screen flex items-center justify-center bg-[#F7F2EA]">
          <motion.div
            className="text-center px-6 flex flex-col items-center gap-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setIsToggled(!isToggled)}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black ${
                  isToggled ? "bg-secondary-background" : "bg-neutral"
                }`}
                aria-label="Toggle switch"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-primary-text transition-transform duration-300 ${
                    isToggled ? "translate-x-9" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="max-w-2xl space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">
                Your pattern has been fully verified by our team.
              </h2>
              <p className="text-black/50 text-base md:text-lg font-medium leading-normal tracking-tight">
                In the flip of a switch, you&apos;re about to see the system
                that drives your perception, emotion, and behavior.
              </p>
            </div>
          </motion.div>
        </div>
        )}
      </div>
      {/* 4. Cards Section (Pre-mounted for instant scroll) */}
      <div 
        ref={cardsRef} 
        className={`transition-opacity duration-500 ${
          isToggled ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"
        }`}
      >
        <CardsSectionV2
          modelResponseData={modelResponseData}
          behaviorProfileData={behaviorProfileData}
          timelineProfileData={timelineProfileData}
          hasPattern={hasPattern}
          onBookCall={showCalendly ? () => setIsCalendlyOpen(true) : undefined}
          onDownloadReport={() => setIsReportModalOpen(true)}
        />
      </div>

      {/* Modern Booking Modal */}
      <BookingModal 
        isOpen={isCalendlyOpen}
        onClose={() => setIsCalendlyOpen(false)}
        calendarLink={calendarLink}
      />

      {/* Report Modal */}
      <ReportPreviewModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        modelResponseData={modelResponseData}
        behaviorProfileData={behaviorProfileData}
        timelineProfileData={timelineProfileData}
        userName={userName}
      />

      {!isCalendlyOpen && !isReportModalOpen && (
      <button
        onClick={() => setDashboardVersion(1)}
        className="fixed bottom-4 left-4 z-[9999] bg-black/40 hover:bg-black/60 text-white/70 hover:text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-all duration-200"
      >
        Open dashboard
      </button>
      )}
    </div>
  );
}
