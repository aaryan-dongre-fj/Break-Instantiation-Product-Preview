"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import BrandMark from "@/components/BrandMark";

export default function RedeemLink({
  kind,
}: {
  kind: "invite" | "magic-login";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("This link is missing its token.");
      return;
    }

    let cancelled = false;
    const path =
      kind === "invite"
        ? "/api/preview/invite/redeem"
        : "/api/preview/magic-login/redeem";

    fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (!response.ok) {
          setError(payload.error ?? "This link is invalid or has expired.");
          return;
        }
        router.replace(typeof payload.next === "string" ? payload.next : "/products");
        router.refresh();
      })
      .catch(() => {
        if (!cancelled) {
          setError("Couldn't reach the server. Check your connection and try again.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [kind, router, token]);

  return (
    <main className="dossier-ambient flex min-h-screen flex-col items-center justify-center px-5 py-12 text-primary-text">
      <div className="dossier-rise mb-9">
        <BrandMark />
      </div>
      <div className="dossier-card w-full max-w-[26rem] rounded-card p-7 text-center sm:p-8">
        {error ? (
          <>
            <h1 className="mb-3 text-[1.6rem] font-bold tracking-tight">
              This link didn&apos;t work
            </h1>
            <p className="mb-6 text-[14px] font-medium leading-relaxed text-[var(--ej-text-soft)]">
              {error}
            </p>
            <Link
              href="/login"
              className="text-[13.5px] font-bold text-secondary-background hover:underline"
            >
              Request a new sign-in link
            </Link>
          </>
        ) : (
          <p className="flex items-center justify-center gap-2 text-[14px] font-medium text-[var(--ej-text-soft)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing you in…
          </p>
        )}
      </div>
    </main>
  );
}
