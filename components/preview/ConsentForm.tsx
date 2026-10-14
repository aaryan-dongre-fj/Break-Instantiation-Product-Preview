"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { withCompany } from "@/utils/company";

function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function ConsentForm({ text }: { text: string }) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    if (!agreed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(withCompany("/api/preview/consent"), { method: "POST" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? "We couldn't record your consent. Please try again.");
        return;
      }
      router.replace(withCompany("/products"));
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary-background">
          Before you begin
        </p>
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-primary-text sm:text-3xl md:text-4xl">
          Your consent to take this questionnaire
        </h1>
        <div className="space-y-4 text-base font-medium leading-relaxed text-primary-text/75 md:text-lg">
          {paragraphs(text).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--ej-border-strong)] bg-surface p-4 transition-colors hover:border-[var(--ej-border-active)] sm:p-5">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
          className="mt-0.5 size-5 shrink-0 accent-[var(--ej-amber)]"
        />
        <span className="text-sm text-primary-text sm:text-base">
          I understand the above and consent to taking this questionnaire.
        </span>
      </label>

      {error ? (
        <p role="alert" className="text-sm font-semibold text-status-high">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={accept}
        disabled={!agreed || submitting}
        className="inline-flex h-12 items-center justify-center gap-3 rounded-[50px] bg-primary-text px-8 text-base font-medium text-primary-background transition-colors hover:bg-primary-text/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Starting..." : "Agree and continue"}
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
      </button>
    </div>
  );
}
