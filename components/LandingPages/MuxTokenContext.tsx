"use client";

import { createContext, useContext } from "react";

export type MuxVideoUrls = {
  playback_url: string;
  thumbnail_gif_url: string;
};

type MuxTokenContextValue = {
  generalMuxUrls: Record<string, MuxVideoUrls>;
  onBeforePlay: () => Promise<void>;
  onTokenError: () => Promise<void>;
};

const MuxTokenContext = createContext<MuxTokenContextValue | null>(null);

export function MuxTokenProvider({
  value,
  children,
}: {
  value: MuxTokenContextValue;
  children: React.ReactNode;
}) {
  return (
    <MuxTokenContext.Provider value={value}>
      {children}
    </MuxTokenContext.Provider>
  );
}

export function useMuxTokens(): MuxTokenContextValue {
  const ctx = useContext(MuxTokenContext);
  if (!ctx) throw new Error("useMuxTokens must be used within MuxTokenProvider");
  return ctx;
}
