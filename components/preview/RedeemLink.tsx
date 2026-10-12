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
        router.replace("/products");
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-background px-6 text-primary-text">
      <BrandMark className="mb-10" />
      {error ? (
        <div className="w-full max-w-md text-center">
          <h1 className="mb-3 text-3xl font-medium tracking-tight">
            This link didn&apos;t work
          </h1>
          <p className="mb-8 text-base leading-relaxed text-primary-text/60">{error}</p>
          <Link
            href="/login"
            className="text-sm font-medium underline underline-offset-4"
          >
            Request a new sign-in link
          </Link>
        </div>
      ) : (
        <p className="flex items-center gap-2 text-base text-primary-text/60">
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing you in…
        </p>
      )}
    </div>
  );
}
