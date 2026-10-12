// Shared design tokens for @react-pdf/renderer pages

export const C = {
  gold: "#CCA077",
  black: "#070401",
  white: "#FFFFFF",
  cream: "#F7F2EA",
  darkCard: "#141414",
  muted: "#888888",
  mutedLight: "#A39A91",
  divider: "#E1DAD0",
};

// A4 @ 72 dpi — @react-pdf/renderer default unit is pt
// Page size "A4" = 595.28 x 841.89 pt
export const PAGE = {
  width: 595.28,
  height: 841.89,
  paddingH: 48, // ~1.7cm left/right
  paddingV: 48, // ~1.7cm top/bottom
};

export const CONTENT_WIDTH = PAGE.width - PAGE.paddingH * 2; // ~499 pt

// Spectrum positions (same as the journey flow visual)
export const SPECTRUM_TICKS = [10, 20, 30, 70, 90];
export const SPECTRUM_LABELS = [
  { label: "A- CTRL OVERT", pos: 5 },
  { label: "A- CTRL SWITCH", pos: 15 },
  { label: "A- CTRL COVERT", pos: 25 },
  { label: "A- HIAT", pos: 40 },
  { label: "REJ- LOVE & SAFE", pos: 60 },
  { label: "REJ- LOVE", pos: 80 },
  { label: "CHAOS - REJ", pos: 95 },
];
export const LEFT_CARDS = [
  "SITUATIONAL AWARENESS INCREASES",
  "SELF-TRUST INCREASES",
  "INDEPENDENCE INCREASES",
  "WORK OR PURPOSE ORIENTATION INCREASES",
];
export const RIGHT_CARDS = [
  "SITUATIONAL AWARENESS DECREASES",
  "SELF-TRUST DECREASES",
  "INDEPENDENCE DECREASES",
  "WORK OR PURPOSE ORIENTATION DECREASES",
];
