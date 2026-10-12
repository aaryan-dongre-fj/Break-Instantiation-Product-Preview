"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setSent(null);

    try {
      const response = await fetch("/api/preview/magic-login/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? "Couldn't send a sign-in link.");
        return;
      }
      setSent(
        payload.detail ??
          "If an account exists, a sign-in link has been sent.",
      );
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
      <div className="grid gap-2">
        <Label htmlFor="email" className="font-sans font-medium text-primary-text">
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="h-12 rounded-md border-neutral bg-transparent text-primary-text placeholder:text-neutral focus-visible:border-secondary-background focus-visible:ring-1 focus-visible:ring-secondary-background"
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm leading-relaxed text-destructive"
        >
          {error}
        </p>
      ) : null}

      {sent ? (
        <p
          role="status"
          className="rounded-md border border-primary-text/10 bg-primary-text/5 px-4 py-3 text-sm leading-relaxed text-primary-text/80"
        >
          {sent}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={!email.trim() || isLoading}
        className="h-12 w-full cursor-pointer rounded-[50px] bg-primary-text text-base font-medium text-primary-background hover:bg-primary-text/90 hover:text-primary-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending link…
          </span>
        ) : (
          "Email me a sign-in link"
        )}
      </Button>
    </form>
  );
}
