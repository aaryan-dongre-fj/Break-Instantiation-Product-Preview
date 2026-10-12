import type { PreviewAnswer } from "@/utils/flowTool";
import type { Draft } from "@/components/preview/QuestionField";

/**
 * In-progress walk for one product's current published version.
 * localStorage so a later visit, including a new tab, resumes here.
 * Cleared when scoring succeeds or the user starts over.
 */
const keyFor = (productSlug: string, versionId: string) =>
  `bvi-preview-walk:${productSlug}:${versionId}`;

export type WalkSectionBreak = {
  name: string;
  description: string;
  number: number;
};

export type WalkProgress = {
  answers: PreviewAnswer[];
  history: PreviewAnswer[][];
  seenSectionIds: string[];
  drafts: Record<string, Draft>;
  breakSection: WalkSectionBreak | null;
};

/** Break question and option ids arrive as integers. Store and reload them as strings. */
function toAnswer(value: unknown): PreviewAnswer | null {
  if (!value || typeof value !== "object") return null;
  const row = value as { question_id?: unknown; option_ids?: unknown };
  if (
    (typeof row.question_id !== "string" && typeof row.question_id !== "number") ||
    !Array.isArray(row.option_ids)
  ) {
    return null;
  }
  return {
    question_id: String(row.question_id),
    option_ids: row.option_ids.map((id) => String(id)),
  };
}

function toDraft(value: unknown): Draft | null {
  if (!value || typeof value !== "object") return null;
  const row = value as { optionIds?: unknown; text?: unknown };
  if (!Array.isArray(row.optionIds) || typeof row.text !== "string") return null;
  return { optionIds: row.optionIds.map((id) => String(id)), text: row.text };
}

export function readWalkProgress(
  productSlug: string,
  versionId: string
): WalkProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(keyFor(productSlug, versionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WalkProgress>;
    const answers = Array.isArray(parsed?.answers)
      ? parsed.answers.map(toAnswer)
      : null;
    if (!answers || answers.some((answer) => answer == null)) return null;
    const history = Array.isArray(parsed.history)
      ? parsed.history.flatMap((step) => {
          if (!Array.isArray(step)) return [];
          const answersInStep = step.map(toAnswer);
          if (answersInStep.some((answer) => answer == null)) return [];
          return [answersInStep as PreviewAnswer[]];
        })
      : [];
    const drafts: Record<string, Draft> = {};
    if (parsed.drafts && typeof parsed.drafts === "object") {
      for (const [id, draft] of Object.entries(parsed.drafts)) {
        const next = toDraft(draft);
        if (next) drafts[String(id)] = next;
      }
    }
    const breakSection = parsed.breakSection;
    const section =
      breakSection &&
      typeof breakSection.name === "string" &&
      typeof breakSection.description === "string" &&
      typeof breakSection.number === "number"
        ? breakSection
        : null;
    return {
      answers: answers as PreviewAnswer[],
      history,
      seenSectionIds: Array.isArray(parsed.seenSectionIds)
        ? parsed.seenSectionIds
            .filter((id) => typeof id === "string" || typeof id === "number")
            .map((id) => String(id))
        : [],
      drafts,
      breakSection: section,
    };
  } catch {
    return null;
  }
}

export function writeWalkProgress(
  productSlug: string,
  versionId: string,
  progress: WalkProgress
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      keyFor(productSlug, versionId),
      JSON.stringify(progress)
    );
  } catch {
    /* private mode or a full disk — the walk still runs */
  }
}

export function clearWalkProgress(productSlug: string, versionId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(keyFor(productSlug, versionId));
  } catch {
    /* ignore */
  }
}
