"use client";

import React, { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { withCompany } from "@/utils/company";

export default function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(withCompany("/api/preview/magic-login/request"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(
          response.status === 429
            ? "Too many sign-in links requested. Wait a while before trying again."
            : (payload.error ?? "Couldn't send that email. Check your connection and try again."),
        );
        return;
      }
      setSent(true);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="dossier-card overflow-hidden rounded-card">
        <div className="px-7 pb-7 pt-8 text-center sm:px-8 sm:pb-8">
          <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-[1.15rem] bg-primary-text text-primary-background">
            <MailCheck aria-hidden className="h-6 w-6" strokeWidth={2.25} />
          </span>
          <h1 className="text-[1.6rem] font-bold leading-tight tracking-[-0.015em] text-primary-text">
            Check your email
          </h1>
          <p className="mt-2.5 text-[14px] font-medium leading-relaxed text-[var(--ej-text-soft)]">
            If an account exists, a sign-in link is on its way to
          </p>
          <p className="mx-auto mt-3 w-fit max-w-full truncate rounded-[0.8rem] border border-[var(--ej-border-strong)] bg-black/[0.03] px-3.5 py-2 text-[14px] font-bold text-primary-text">
            {email.trim()}
          </p>
          <p className="mt-4 text-[13px] font-medium leading-relaxed text-[var(--ej-text-muted)]">
            The link expires shortly, so use it soon. If it doesn&apos;t arrive within a
            minute or two, check your spam folder.
          </p>
        </div>
        <div className="border-t border-[var(--ej-border)] bg-black/[0.02] px-7 py-4 text-center sm:px-8">
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-[13.5px] font-bold text-primary-text/70 transition-colors hover:text-primary-text"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dossier-card rounded-card p-7 sm:p-8">
      <div className="mb-7 text-center">
        <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-primary-text">
          Sign in
        </h1>
        <p className="mt-2.5 text-[14px] font-medium leading-relaxed text-[var(--ej-text-soft)]">
          We&apos;ll email you a link. There&apos;s no password to remember.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="mb-5 rounded-[0.9rem] border border-status-high/30 bg-status-high/10 px-4 py-3 text-[13.5px] font-semibold leading-relaxed text-status-high"
        >
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-[14px] font-bold text-primary-text">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={isLoading}
            autoFocus
            className="h-12 w-full rounded-control border border-[var(--ej-border-strong)] bg-surface px-4 text-[15px] font-semibold text-primary-text placeholder:font-medium placeholder:text-[var(--ej-text-ghost)] disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={!email.trim() || isLoading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-button bg-primary-text text-base font-medium text-primary-background shadow-[0_10px_20px_-12px_rgba(26,22,19,0.5)] transition-colors hover:bg-primary-text/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isLoading ? "Sending" : "Email me a link"}
        </button>
      </form>
    </div>
  );
}
