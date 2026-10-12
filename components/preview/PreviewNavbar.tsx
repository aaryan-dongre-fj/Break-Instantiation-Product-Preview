"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoIosArrowDown } from "react-icons/io";
import { motion } from "framer-motion";
import BrandMark from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { instance } from "@/utils/instance";

export default function PreviewNavbar({
  email,
  context,
}: {
  email: string | null;
  context?: string;
}) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = async () => {
    setIsSigningOut(true);
    await fetch("/api/preview/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  return (
    <nav className="absolute top-0 left-0 right-0 bg-transparent z-50 h-[88px]">
      <div
        className="absolute inset-0 backdrop-blur-[2px] pointer-events-none"
        style={{
          maskImage:
            "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
        }}
      ></div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex items-center justify-between px-6 lg:px-12 xl:px-16 2xl:px-20 h-full z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-4 z-10 min-w-0"
        >
          <Link href="/products" className="shrink-0">
            <BrandMark />
          </Link>
          {context ? (
            <span className="hidden sm:block truncate text-sm text-primary-text/50">
              <span className="mr-2 text-primary-text/25">/</span>
              {context}
            </span>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <Button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-transparent hover:bg-transparent hover:cursor-pointer p-2 touch-manipulation shadow-none"
          >
            <div className="flex items-center gap-2 border border-primary-text/20 rounded-full px-3 py-1.5">
              <div className="flex items-center justify-center bg-secondary-background rounded-full w-8 h-8">
                <span className="text-primary-text text-sm font-medium uppercase">
                  {email?.[0] ?? "S"}
                </span>
              </div>
              <div className="hidden sm:flex sm:flex-col sm:items-start">
                <span className="text-primary-text text-sm">{instance.productName}</span>
                <span className="text-primary-text/60 text-xs">
                  {email ?? "Signed in"}
                </span>
              </div>
              <div className="text-primary-text">
                <IoIosArrowDown />
              </div>
            </div>
          </Button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-4 mr-4 w-[300px] rounded-md shadow-lg bg-primary-background ring-1 ring-black ring-opacity-5 border border-primary-text/10">
              <div className="py-1">
                <Link
                  href="/products"
                  className="cursor-pointer block w-[300px] px-4 py-2 text-sm text-primary-text hover:bg-secondary-background/20 text-left border-b border-primary-text/10"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  All products
                </Link>
                <button
                  onClick={signOut}
                  disabled={isSigningOut}
                  className="cursor-pointer block w-[300px] px-4 py-2 text-sm text-primary-text hover:bg-secondary-background/20 text-left disabled:opacity-50"
                >
                  {isSigningOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </nav>
  );
}
