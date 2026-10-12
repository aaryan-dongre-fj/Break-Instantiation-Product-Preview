export type PdfInsightSection = {
  title: string;
  subtitle?: string;
  points: string[];
};

export function splitCommaList(value: unknown): string[] {
  // New API format: field is an object with a .text property
  if (value !== null && typeof value === "object" && !Array.isArray(value) && "text" in value) {
    return splitCommaList((value as { text: unknown }).text);
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value !== "string") return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizePoint(value: unknown): string {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatEmotionTitle(emotion: unknown): string {
  const text = String(emotion ?? "").trim();
  if (!text) return "Unset";

  return text
    .split(/[- ]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("-");
}

export function getJourneyProfileSections(behaviorProfileData: any): PdfInsightSection[] {
  return [
    {
      title: "Self Deception Themes",
      points: splitCommaList(behaviorProfileData?.self_deception_themes),
    },
    {
      title: "Underlying Motivations",
      points: splitCommaList(behaviorProfileData?.underlying_motivations),
    },
    {
      title: "Common Conflicts",
      points: splitCommaList(behaviorProfileData?.common_conflicts),
    },
    {
      title: "What You Want Most",
      subtitle: "(But Often Struggle to Attain)",
      points: splitCommaList(behaviorProfileData?.what_you_want_most),
    },
  ];
}

/** Get Results `corrected_report[0]` or timeline API `report[0]` (same shape). */
export function getCorrectedReportRow(behaviorProfileData: any, timelineProfileData?: any) {
  return (
    behaviorProfileData?.corrected_report?.[0] || timelineProfileData?.report?.[0] || undefined
  );
}

export function getJourneyEmotionalSections(
  behaviorProfileData: any,
  timelineProfileData: any
): PdfInsightSection[] {
  const correctedReport = getCorrectedReportRow(behaviorProfileData, timelineProfileData);
  const tp = timelineProfileData?.timeline_profile;
  const originEmotion =
    correctedReport?.eac_origin || behaviorProfileData?.eac_origin || "";
  const protectEmotion =
    correctedReport?.eac_protect || behaviorProfileData?.eac_protect || "";
  const escalatingEmotion =
    correctedReport?.eac_esc || behaviorProfileData?.eac_esc || "";

  return [
    {
      title: formatEmotionTitle(originEmotion),
      subtitle: "ORIGIN EMOTION",
      points: [
        ...splitCommaList(tp?.primary?.profile?.text),
        ...splitCommaList(tp?.secondary?.profile?.text),
      ],
    },
    {
      title: formatEmotionTitle(protectEmotion),
      subtitle: "PROTECTIVE EMOTION",
      points: [
        ...splitCommaList(tp?.secondary?.profile?.text),
        ...splitCommaList(tp?.tertiary_1?.profile?.text),
      ],
    },
    {
      title: formatEmotionTitle(escalatingEmotion),
      subtitle: "ESCALATING EMOTION",
      points: [
        ...splitCommaList(tp?.tertiary_1?.profile?.text),
        ...splitCommaList(tp?.tertiary_2?.profile?.text),
      ],
    },
    {
      title: "Protection Strategy",
      points: splitCommaList(behaviorProfileData?.protection_strategy),
    },
  ];
}

export function getJourneyTimelineSections(
  modelResponseData: any,
  timelineProfileData: any,
  behaviorProfileData?: any
): PdfInsightSection[] {
  const timeline = modelResponseData?.data?.timeline || {};
  const cr = getCorrectedReportRow(behaviorProfileData, timelineProfileData);
  const tp = timelineProfileData?.timeline_profile;

  return [
    {
      title: tp?.primary?.timeline_number || cr?.primary || timeline.Primary || "",
      subtitle: "PRIMARY",
      points: splitCommaList(tp?.primary?.profile?.text),
    },
    {
      title: tp?.secondary?.timeline_number || cr?.secondary || timeline.Secondary || "",
      subtitle: "SECONDARY",
      points: splitCommaList(tp?.secondary?.profile?.text),
    },
    {
      title: tp?.tertiary_1?.timeline_number || cr?.tertiary_1 || timeline["Tertiary 1"] || "",
      subtitle: "TERTIARY 1",
      points: splitCommaList(tp?.tertiary_1?.profile?.text),
    },
    {
      title: tp?.tertiary_2?.timeline_number || cr?.tertiary_2 || timeline["Tertiary 2"] || "",
      subtitle: "TERTIARY 2",
      points: splitCommaList(tp?.tertiary_2?.profile?.text),
    },
  ].filter((section) => section.title || section.points.length > 0);
}
