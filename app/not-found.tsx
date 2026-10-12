"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { motion } from "framer-motion";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-primary-background text-primary-text relative">
      {/* Navbar position for logo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-0 left-0 right-0 lg:right-auto z-10 flex justify-center lg:justify-start p-4 lg:p-8"
      >
        <Link href="/" className="flex items-center">
          <BrandMark />
        </Link>
      </motion.div>

      {/* Main content */}
      <div className="flex flex-col min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center space-y-8 max-w-2xl"
        >
          <h1 className="font-bold text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[1.1] tracking-tight text-secondary-background">
            404
          </h1>
          <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-primary-text mt-4">
            Page Not Found
          </h2>
          <p className="text-primary-text/80 font-sans text-lg md:text-xl leading-relaxed max-w-md mx-auto mt-6">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="pt-4"
          >
            <Button
              onClick={() => router.push("/")}
              className="bg-primary-text text-primary-background hover:bg-primary-text/90 hover:cursor-pointer font-medium text-base px-8 py-6 rounded-[50px] transition-colors"
            >
              Return to Home
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
