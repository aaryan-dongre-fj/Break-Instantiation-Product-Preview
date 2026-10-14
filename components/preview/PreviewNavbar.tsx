"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { useCompanyHref } from "@/components/CompanyProvider";

export default function PreviewNavbar({
  email,
  context,
}: {
  email: string | null;
  context?: string;
}) {
  const router = useRouter();
  const companyHref = useCompanyHref();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = async () => {
    setIsSigningOut(true);
    await fetch(companyHref("/api/preview/logout"), { method: "POST" });
    router.replace(companyHref("/login"));
    router.refresh();
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 h-[72px] border-b border-[var(--ej-border)] bg-primary-background/95">
      <div className="flex h-full items-center justify-between gap-4 px-6 lg:px-12">
        <div className="flex min-w-0 items-center gap-4">
          <Link href={companyHref("/products")} className="shrink-0">
            <BrandMark />
          </Link>
          {context ? (
            <span className="hidden truncate text-sm font-medium text-[var(--ej-text-muted)] sm:block">
              <span className="mr-2 text-[var(--ej-text-ghost)]">/</span>
              {context}
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {email ? (
            <span className="hidden max-w-[16rem] truncate text-sm font-medium text-[var(--ej-text-muted)] sm:block">
              {email}
            </span>
          ) : null}
          <button
            type="button"
            onClick={signOut}
            disabled={isSigningOut}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border-2 border-[var(--ej-border-strong)] bg-surface px-5 text-[13.5px] font-bold text-[var(--ej-text-soft)] transition-colors hover:border-secondary-background hover:text-secondary-background disabled:opacity-60"
          >
            <LogOut aria-hidden className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            {isSigningOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </nav>
  );
}
