"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ArrowButton from "@/public/button-arrow/button-arrow.svg";
import { Button } from "@/components/ui/button";
import QuestionField, {
  emptyDraft,
  instructionFor,
  isAnswered,
  type Draft,
} from "./QuestionField";
import SectionBreak from "./SectionBreak";
import { Loader2 } from "lucide-react";
import type { PreviewAnswer, PreviewQuestion, PreviewState } from "@/utils/flowTool";
import type { ClientAnswerRecord } from "@/utils/clientApi";
import {
  cachedResultMatches,
  hashAnswers,
  loadPreviewBundle,
  writePreviewResultCache,
} from "@/utils/previewResultCache";
import {
  clearWalkProgress,
  readWalkProgress,
  writeWalkProgress,
  type WalkProgress,
} from "@/utils/walkProgress";

const ORDINAL_WORDS = [
  "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
  "Eighteen", "Nineteen", "Twenty",
];

/** Authored section name when present, else the production-style ordinal. */
function sectionHeading(name: string, number: number): string {
  const trimmed = name.trim();
  if (!trimmed) return `Section ${ORDINAL_WORDS[number - 1] ?? number}`;
  return trimmed;
}

/**
 * Section numbering for the break-screen video (production plays
 * /{number}.webm). Authored display_order follows the 10/20/30 convention, so
 * a clean tenth maps straight to the section number — keeping video parity
 * even when branching skips whole sections; anything else falls back to the
 * order sections were entered in this walk.
 */
function sectionNumber(displayOrder: number | undefined, ordinal: number): number {
  if (displayOrder && displayOrder % 10 === 0 && displayOrder >= 10) {
    return displayOrder / 10;
  }
  return ordinal;
}

function asId(value: unknown): string {
  return value == null ? "" : String(value);
}

/** Break's live graph uses integer ids. The walk and the saved progress both use strings. */
function normalizePreviewState(payload: unknown): PreviewState {
  const raw = (payload ?? {}) as PreviewState;
  const questions = Array.isArray(raw.next_questions) ? raw.next_questions : [];
  return {
    ...raw,
    is_complete: Boolean(raw.is_complete),
    is_new_section: Boolean(raw.is_new_section),
    answered_count: Number(raw.answered_count) || 0,
    total_count: Number(raw.total_count) || 0,
    next_questions: questions.map((question) => {
      const section = question.section as PreviewQuestion["section"] | string | undefined;
      const normalizedSection =
        typeof section === "string"
          ? section
          : section
            ? { ...section, id: asId(section.id) }
            : section;
      return {
        ...question,
        id: asId(question.id),
        section: normalizedSection as PreviewQuestion["section"],
        options: (question.options ?? []).map((option) => ({
          ...option,
          id: asId(option.id),
        })),
      };
    }),
  };
}

const SHELL =
  "min-h-screen pt-[88px] w-full m-0 bg-primary-background text-primary-text flex flex-col relative overflow-y-auto";
const INNER =
  "flex-1 flex flex-col justify-center py-8 px-6 lg:px-12 xl:px-16 2xl:px-20";

export default function QuestionnaireWalk({
  versionId,
  productSlug,
  productCode,
  rememberProgress,
}: {
  versionId: string;
  productSlug: string;
  productCode: string;
  rememberProgress: boolean;
}) {
  void productCode;
  const router = useRouter();

  const [state, setState] = useState<PreviewState | null>(null);
  const [answers, setAnswers] = useState<PreviewAnswer[]>([]);
  const [history, setHistory] = useState<PreviewAnswer[][]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isScoring, setIsScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Section break interstitial, like production's SectionUi screen. Sections
  // already entered are remembered by id, so walking Back doesn't replay
  // interstitials; Start over clears them.
  const [breakSection, setBreakSection] = useState<{
    name: string;
    description: string;
    number: number;
  } | null>(null);
  const seenSections = useRef<string[]>([]);
  const historyRef = useRef<PreviewAnswer[][]>([]);
  const started = useRef(false);
  const allowPersist = useRef(false);
  const resumeRef = useRef<WalkProgress | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clientRecords = useRef<Map<string, ClientAnswerRecord>>(new Map());
  const pendingScore = useRef<{
    answers: PreviewAnswer[];
    answered: number;
    total: number;
  } | null>(null);

  const rememberClientRecord = (question: PreviewQuestion, draft: Draft) => {
    const section =
      typeof question.section === "string"
        ? { code: question.section, display_order: 0 }
        : question.section;
    const optionCodes: Record<string, string> = {};
    const optionLabels: Record<string, string> = {};
    for (const option of question.options) {
      if (!draft.optionIds.includes(option.id)) continue;
      optionCodes[option.id] = option.code;
      optionLabels[option.id] = option.label;
    }
    clientRecords.current.set(question.id, {
      question_id: question.id,
      question_code: question.code,
      prompt: question.prompt,
      answer_type: question.answer_type,
      option_ids: draft.optionIds,
      option_codes: optionCodes,
      option_labels: optionLabels,
      text: draft.text,
      section_code: section.code ?? "",
      section_order: section.display_order ?? 0,
    });
  };

  const scoreAndOpenResults = useCallback(
    async (nextAnswers: PreviewAnswer[], answered: number, total: number) => {
      setIsScoring(true);
      setError(null);
      const cached = cachedResultMatches(versionId, nextAnswers);
      if (!cached?.bundle) {
        const scored = await loadPreviewBundle(
          versionId,
          nextAnswers,
          Array.from(clientRecords.current.values())
        );
        if (scored.status === 401) {
          router.replace("/login");
          return;
        }
        if (!scored.ok) {
          setIsScoring(false);
          setError(scored.error);
          return;
        }
        writePreviewResultCache(versionId, {
          answers: nextAnswers,
          answersHash: hashAnswers(nextAnswers),
          bundle: scored.bundle,
        });
      }

      allowPersist.current = false;
      clearWalkProgress(productSlug, versionId);

      setAnswers(nextAnswers);
      router.push(
        `/preview/${productSlug}/results?answered=${answered}&total=${total}`
      );
    },
    [productSlug, router, versionId]
  );

  /**
   * The walk is stateless upstream: every call replays the whole answer list
   * from the entry point, so this posts `nextAnswers` in full each time.
   */
  const advance = useCallback(
    async (nextAnswers: PreviewAnswer[]) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/preview/versions/${versionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: nextAnswers }),
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          resumeRef.current = null;
          setError(payload.error ?? "The questionnaire API returned an error.");
          return;
        }

        const next = normalizePreviewState(payload);

        // The upstream can return an exhausted walk (next_questions: []) with
        // is_complete still false on some answer paths — either way there is
        // nothing left to show, so both count as the end.
        if (next.is_complete || next.next_questions.length === 0) {
          if (nextAnswers.length < 1) {
            setError("This walk ended with no answers, so there is nothing to score.");
            return;
          }

          pendingScore.current = {
            answers: nextAnswers,
            answered: next.answered_count,
            total: next.total_count,
          };
          if (rememberProgress) {
            writeWalkProgress(productSlug, versionId, {
              answers: nextAnswers,
              history: historyRef.current,
              seenSectionIds: seenSections.current,
              drafts: {},
              breakSection: null,
            });
          }
          await scoreAndOpenResults(
            nextAnswers,
            next.answered_count,
            next.total_count
          );
          return;
        }

        setAnswers(nextAnswers);
        setState(next);

        const resume = resumeRef.current;
        resumeRef.current = null;
        if (resume) {
          setDrafts(resume.drafts);
          setBreakSection(resume.breakSection);
        } else {
          setDrafts({});

          // `section` is an object ({id, code, name, description, display_order});
          // tolerate a bare id string in case an older API build serves it.
          const rawSection = next.next_questions[0]?.section;
          const nextSection =
            typeof rawSection === "string"
              ? { id: rawSection, name: "", description: "", display_order: 0 }
              : rawSection;
          if (
            next.is_new_section &&
            nextSection?.id &&
            !seenSections.current.includes(nextSection.id)
          ) {
            seenSections.current = [...seenSections.current, nextSection.id];
            setBreakSection({
              name: nextSection.name ?? "",
              description: nextSection.description ?? "",
              number: sectionNumber(
                nextSection.display_order,
                seenSections.current.length
              ),
            });
          } else {
            setBreakSection(null);
          }
        }

        allowPersist.current = true;

        window.scrollTo(0, 0);
        if (containerRef.current) containerRef.current.scrollTop = 0;
      } catch {
        resumeRef.current = null;
        setError("Couldn't reach the server. Check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [productSlug, rememberProgress, scoreAndOpenResults, router, versionId]
  );

  useEffect(() => {
    if (!rememberProgress || !allowPersist.current) return;
    writeWalkProgress(productSlug, versionId, {
      answers,
      history,
      seenSectionIds: seenSections.current,
      drafts,
      breakSection,
    });
  }, [answers, breakSection, drafts, history, productSlug, rememberProgress, versionId]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!rememberProgress) {
      clearWalkProgress(productSlug, versionId);
      void advance([]);
      return;
    }
    const saved = readWalkProgress(productSlug, versionId);
    if (saved) {
      resumeRef.current = saved;
      historyRef.current = saved.history;
      setHistory(saved.history);
      seenSections.current = saved.seenSectionIds;
      void advance(saved.answers);
      return;
    }
    void advance([]);
  }, [advance, productSlug, rememberProgress, versionId]);

  const questions = state?.next_questions ?? [];
  const draftFor = (question: PreviewQuestion) => drafts[question.id] ?? emptyDraft;

  const canSubmit =
    questions.length > 0 &&
    questions.every(
      (question) => !question.is_required || isAnswered(question, draftFor(question))
    );

  const handleNextQuestion = () => {
    if (!canSubmit || isLoading) return;

    // One `answers` entry per question on screen, appended in a single call —
    // a batched section submits all of its questions at once.
    const batch: PreviewAnswer[] = questions.map((question) => {
      const draft = draftFor(question);
      rememberClientRecord(question, draft);
      return {
        question_id: question.id,
        option_ids: draft.optionIds,
      };
    });

    const nextHistory = [...historyRef.current, answers];
    historyRef.current = nextHistory;
    setHistory(nextHistory);
    void advance([...answers, ...batch]);
  };

  const handleBack = () => {
    if (history.length === 0 || isLoading) return;
    const previous = history[history.length - 1];
    const nextHistory = historyRef.current.slice(0, -1);
    historyRef.current = nextHistory;
    setHistory(nextHistory);
    void advance(previous);
  };

  const handleRestart = () => {
    if (isLoading) return;
    allowPersist.current = false;
    resumeRef.current = null;
    clearWalkProgress(productSlug, versionId);
    setIsScoring(false);
    pendingScore.current = null;
    historyRef.current = [];
    setHistory([]);
    seenSections.current = [];
    clientRecords.current.clear();
    void advance([]);
  };

  const progress =
    state && state.total_count > 0
      ? Math.min(100, Math.round((state.answered_count / state.total_count) * 100))
      : 0;

  const progressBar = (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-primary-text/5">
      <motion.div
        className="h-full bg-secondary-background"
        initial={false}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );

  if (isScoring) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary-background gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-secondary-background" />
        <p className="text-primary-text font-medium text-lg">Generating your report…</p>
        <p className="text-primary-text/50 text-sm">This may take a moment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={SHELL}>
        <div className={INNER}>
          <div className="w-full max-w-4xl mx-auto space-y-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-primary-text">
              Questionnaire stopped
            </h1>
            <p className="text-primary-text/50 font-sans font-medium text-lg md:text-xl leading-normal tracking-tight">
              {error}
            </p>
            <div className="pt-4 flex flex-wrap justify-center lg:justify-start gap-3">
              {pendingScore.current ? (
                <Button
                  onClick={() => {
                    const pending = pendingScore.current;
                    if (!pending) return;
                    void scoreAndOpenResults(
                      pending.answers,
                      pending.answered,
                      pending.total
                    );
                  }}
                  className="bg-primary-text text-primary-background h-12 px-8 py-6 rounded-[50px] font-medium text-base cursor-pointer hover:bg-primary-text/90 hover:text-primary-background transition-colors"
                >
                  RETRY SCORING
                </Button>
              ) : null}
              <Button
                onClick={handleRestart}
                className={
                  pendingScore.current
                    ? "inline-flex h-12 items-center rounded-[50px] border border-primary-text/15 bg-transparent px-8 text-base font-medium text-primary-text shadow-none hover:bg-primary-text/5"
                    : "bg-primary-text text-primary-background h-12 px-8 py-6 rounded-[50px] font-medium text-base cursor-pointer hover:bg-primary-text/90 hover:text-primary-background transition-colors"
                }
              >
                START OVER
              </Button>
              <Link
                href="/products"
                className="inline-flex h-12 items-center rounded-[50px] border border-primary-text/15 px-6 text-base font-medium text-primary-text transition-colors hover:bg-primary-text/5"
              >
                Back to products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className={SHELL}>
        <div className={INNER}>
          <p className="text-primary-text text-xl text-center">Loading…</p>
        </div>
      </div>
    );
  }

  if (breakSection) {
    return (
      <>
        {progressBar}
        <SectionBreak
          heading={sectionHeading(breakSection.name, breakSection.number)}
          description={breakSection.description}
          number={breakSection.number}
          onProceed={() => {
            setBreakSection(null);
            window.scrollTo(0, 0);
          }}
          disabled={isLoading}
        />
      </>
    );
  }

  return (
    <div ref={containerRef} className={SHELL}>
      {progressBar}

      <div className={INNER}>
        <motion.div
          key={questions.map((question) => question.id).join("-")}
          layout
          className="w-full max-w-4xl mx-auto space-y-6"
        >
          {questions.map((question) => {
            const instruction = instructionFor(question);
            return (
              <React.Fragment key={question.id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-4"
                >
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-primary-text">
                    {question.prompt}
                  </h1>
                  {question.subtext ? (
                    <p className="text-primary-text/50 font-sans font-medium text-lg md:text-xl leading-normal tracking-tight">
                      {question.subtext}
                    </p>
                  ) : null}
                  {instruction ? (
                    <p className={instruction.className}>{instruction.text}</p>
                  ) : null}
                </motion.div>

                <QuestionField
                  question={question}
                  draft={draftFor(question)}
                  disabled={isLoading}
                  onChange={(draft) =>
                    setDrafts((current) => ({ ...current, [question.id]: draft }))
                  }
                />
              </React.Fragment>
            );
          })}

          <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <Button
              onClick={handleNextQuestion}
              disabled={!canSubmit || isLoading}
              className="bg-primary-text text-primary-background h-12 px-8 py-6 rounded-[50px] font-medium text-base cursor-pointer hover:bg-primary-text/90 hover:text-primary-background inline-flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Saving..." : "NEXT QUESTION"}
              <Image
                src={ArrowButton}
                alt="ArrowButton"
                width={28}
                height={28}
                className="w-[28px] h-[28px]"
                priority
              />
            </Button>

            <Button
              onClick={handleBack}
              disabled={history.length === 0 || isLoading}
              className="h-12 px-5 rounded-[50px] bg-transparent shadow-none text-base font-medium text-primary-text/50 cursor-pointer hover:bg-transparent hover:text-primary-text disabled:opacity-30 transition-colors"
            >
              Back
            </Button>
            <Button
              onClick={handleRestart}
              disabled={isLoading || answers.length === 0}
              className="h-12 px-5 rounded-[50px] bg-transparent shadow-none text-base font-medium text-primary-text/50 cursor-pointer hover:bg-transparent hover:text-primary-text disabled:opacity-30 transition-colors"
            >
              Start over
            </Button>

            <span className="text-sm text-primary-text/40 tabular-nums">
              {state.answered_count} / {state.total_count}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
