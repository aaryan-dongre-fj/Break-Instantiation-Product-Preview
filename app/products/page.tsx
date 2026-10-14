import type { Metadata } from "next";
import React from "react";
import { redirect } from "next/navigation";
import PreviewNavbar from "@/components/preview/PreviewNavbar";
import ProductPicker from "@/components/preview/ProductPicker";
import { getProducts } from "@/utils/flowTool";
import { loadLook } from "@/utils/look";
import { redirectIfConsentMissing } from "@/utils/requireConsent";
import { getStaffEmail, getStaffSession } from "@/utils/staffSession";
import { requestCompanyPath } from "@/utils/look";

export async function generateMetadata(): Promise<Metadata> {
  const look = await loadLook();
  return { title: `Products · ${look.name}` };
}

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const look = await loadLook();
  const staff = await getStaffSession();
  if (!staff) redirect(await requestCompanyPath("/login"));
  await redirectIfConsentMissing();

  const email = await getStaffEmail();
  const result = await getProducts(staff);

  if (!result.ok && result.status === 401) redirect(await requestCompanyPath("/login"));

  return (
    <div className="dossier-ambient min-h-screen bg-primary-background pt-[72px] text-primary-text">
      <PreviewNavbar email={email} />

      <main className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
        <header className="mb-8 max-w-2xl">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-secondary-background">
            Welcome
          </p>
          <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Choose a product
          </h1>
          <p className="text-[15px] font-medium leading-relaxed text-[var(--ej-text-soft)]">
            Pick a product to start its questionnaire. Your answers stay with
            this {look.name} account.
          </p>
        </header>

        {result.ok ? (
          result.data.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-neutral/60 p-10 text-center text-primary-text/50">
              No questionnaire products exist on this environment yet.
            </p>
          ) : (
            <ProductPicker products={result.data} />
          )
        ) : (
          <div className="dossier-card max-w-2xl rounded-card p-6">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-status-high">
              Couldn&apos;t load products
            </p>
            <p className="text-base font-medium leading-relaxed text-[var(--ej-text-soft)]">
              {result.error}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
