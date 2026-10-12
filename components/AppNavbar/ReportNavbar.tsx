"use client";

import { motion } from "framer-motion";
import BrandMark from "@/components/BrandMark";
import ProfileMenu from "./ProfileMenu";

type ReportNavbarProps = {
  variant?: "overlay" | "sticky";
  /** Override sticky navbar background — e.g. match dashboard body `#F7F2EA` */
  backgroundClassName?: string;
};

export default function ReportNavbar({
  variant = "overlay",
  backgroundClassName,
}: ReportNavbarProps) {
  const stickyBackground =
    backgroundClassName ?? "bg-primary-background/95 backdrop-blur-md";

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={
        variant === "sticky"
          ? `sticky top-0 z-50 w-full ${stickyBackground}`
          : "absolute top-0 left-0 right-0 z-50 w-full"
      }
    >
      {variant === "overlay" && (
        <div
          className="absolute inset-0 backdrop-blur-[2px] pointer-events-none"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
          }}
        />
      )}
      <div className="relative flex justify-between items-center gap-4 w-full px-6 lg:px-12 xl:px-16 h-[72px] lg:h-[88px]">
        <a href="#" className="flex shrink-0 items-center">
          <BrandMark />
        </a>
        <ProfileMenu />
      </div>
    </motion.nav>
  );
}
