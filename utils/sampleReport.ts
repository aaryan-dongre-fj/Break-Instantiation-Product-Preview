import type { MuxVideoUrls } from "@/components/LandingPages/MuxTokenContext";

/**
 * Sample data for the report experience preview.
 *
 * Dummy payloads served by the preview `/api/getModelResponse`,
 * `/api/get_results`, `/api/get_timeline_profile`, `/api/get_general_mux_urls`
 * and `/api/reportPage` routes. Same shapes as production. Video slots point
 * at looping clips in /public instead of signed Mux streams. Swap these
 * constants for the ML pipeline later — client fetch in CompletedUser stays.
 */

const posters = {
  eye: "/eye-closeup-poster.jpg",
  eyeStatic: "/eye-static-poster.jpg",
  fingerprints: "/fingerprints-poster.jpg",
};

const clip = (playback_url: string, thumbnail_gif_url: string) => ({
  playback_url,
  thumbnail_gif_url,
});

export const SAMPLE_GENERAL_MUX_URLS: Record<string, MuxVideoUrls> = {
  overall_break_down_of_bpm_and_9_markers: clip("/eye-static.mp4", posters.eyeStatic),
  current_strengths: clip("/6.mp4", posters.eye),
  source_belief_intro: clip("/1.mp4", posters.fingerprints),
  eac_origin_intro: clip("/3.mp4", posters.eye),
  eac_protective_intro: clip("/4.mp4", posters.eye),
  eac_escalating_intro: clip("/7.mp4", posters.eye),
  eac_origin_body: clip("/8.mp4", posters.fingerprints),
  eac_protective_body: clip("/9.mp4", posters.fingerprints),
  eac_escalating_body: clip("/11.mp4", posters.fingerprints),
  timeline_intro: clip("/12.mp4", posters.eye),
  timeline_summary_video: clip("/9.mp4", posters.fingerprints),
  rebellion_zones_intro: clip("/13.mp4", posters.eye),
  how_to_rewire_section: clip("/two-eyes.mp4", posters.eyeStatic),
};

const timelineRow = {
  eac_origin: "shame",
  eac_protect: "anger",
  eac_esc: "rage",
  primary: "1+C",
  secondary: "5+/-",
  tertiary_1: "4-/+",
  tertiary_2: "6+/-",
};

export const SAMPLE_BEHAVIOR_PROFILE = {
  osb: "Abandoned",
  asb: "Rejection (Love & Safety)",
  modifier: "Control – Switch",
  interaction_style: "Overt Controller",
  self_trust: "Low – Moderate",
  chart_range: 15,
  protection_strategy: {
    text: "Control of environment and people, Perfectionism, Preemptive withdrawal, Over-explaining to avoid being misunderstood",
    playback_urls: clip("/two-eyes.mp4", posters.eye),
  },
  eac_origin: timelineRow.eac_origin,
  eac_protect: timelineRow.eac_protect,
  eac_esc: timelineRow.eac_esc,
  corrected_report: [timelineRow],
  current_strengths: {
    text: ["Strategic", "Perceptive", "Loyal", "Decisive"],
  },
  self_deception_themes: {
    text: "I'm only helping when I take over, I don't need anyone, If I relax control everything falls apart",
    playback_urls: clip("/6.mp4", posters.eye),
  },
  underlying_motivations: {
    text: [
      "Staying indispensable so people can't leave",
      "Predicting problems before they happen",
      "Earning safety through competence",
    ],
    playback_urls: clip("/7.mp4", posters.eye),
  },
  common_conflicts: {
    text: "Micromanaging loved ones, Resenting partners who don't reciprocate effort, Escalating small disagreements into loyalty tests",
    playback_urls: clip("/8.mp4", posters.fingerprints),
  },
  what_you_want_most: {
    text: "To feel securely chosen without having to earn it",
    playback_urls: clip("/9.mp4", posters.fingerprints),
  },
  longterm_effects: {
    text: "Chronic exhaustion from over-functioning, Relationships that feel one-sided, Difficulty delegating or resting, Growing resentment masked as competence",
    playback_urls: clip("/11.mp4", posters.eye),
  },
  rebellion_zones: {
    text: [
      "Being told what to do",
      "Feeling unappreciated after over-giving",
      "Watching someone else do it 'wrong'",
    ],
    playback_urls: clip("/13.mp4", posters.eye),
  },
};

export const SAMPLE_TIMELINE_PROFILE = {
  report: [timelineRow],
  timeline_profile: {
    primary: {
      timeline_number: "1+C",
      profile: {
        text: [
          "Steps in and takes charge the moment uncertainty appears",
          "Reads the room quickly and positions to control outcomes",
        ],
      },
      video: clip("/1.mp4", posters.fingerprints),
    },
    secondary: {
      timeline_number: "5+/-",
      profile: {
        text: [
          "Over-explains decisions to preempt criticism",
          "Swings between over-giving and abrupt withdrawal",
        ],
      },
      video: clip("/12.mp4", posters.eye),
    },
    tertiary_1: {
      timeline_number: "4-/+",
      profile: {
        text: [
          "Shuts down when effort goes unacknowledged",
          "Keeps score silently, then erupts over something small",
        ],
      },
      video: clip("/4.mp4", posters.eye),
    },
    tertiary_2: {
      timeline_number: "6+/-",
      profile: {
        text: [
          "Escalates to ultimatums when control slips",
          "Frames leaving first as safety, not avoidance",
        ],
      },
      video: clip("/3.mp4", posters.eye),
    },
  },
};

export const SAMPLE_MODEL_RESPONSE = {
  data: {
    timeline: {
      Primary: timelineRow.primary,
      Secondary: timelineRow.secondary,
      "Tertiary 1": timelineRow.tertiary_1,
      "Tertiary 2": timelineRow.tertiary_2,
    },
  },
};

/** Dummy `/api/reportPage` payload. `campaign: "general"` → paid + Calendly path. */
export const SAMPLE_REPORT_PAGE = {
  origin_owner_name: "Alex",
  origin_owner_role: "Advisor",
  origin_owner_email: "advisor@companyx.example",
  campaign: "general",
  calendly: "https://calendly.com/company-x/intro",
  status: "success",
};
