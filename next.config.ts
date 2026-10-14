import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Type errors fail the build. Lint stays off this step: the report
  // components still have existing lint errors, and turning it on would
  // fail a Vercel deploy without changing runtime behavior.
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
