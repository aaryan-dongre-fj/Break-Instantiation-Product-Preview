import React from "react";
import { redirect } from "next/navigation";
import PreviewNavbar from "@/components/preview/PreviewNavbar";
import ProductPicker from "@/components/preview/ProductPicker";
import { getProducts } from "@/utils/flowTool";
import { instance } from "@/utils/instance";
import { getStaffEmail, getStaffSession } from "@/utils/staffSession";

export const metadata = {
  title: `Products · ${instance.productName}`,
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const staff = await getStaffSession();
  if (!staff) redirect("/login");

  const email = await getStaffEmail();
  const result = await getProducts(staff);

  if (!result.ok && result.status === 401) redirect("/login");

  return (
    <div className="min-h-screen pt-[88px] bg-primary-background text-primary-text">
      <PreviewNavbar email={email} />

      <main className="mx-auto max-w-6xl px-6 py-12 lg:px-10 lg:py-16">
        <header className="mb-12 max-w-2xl">
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-secondary-background">
            Welcome
          </p>
          <h1 className="mb-4 text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            <span className="font-sans font-medium">Choose a </span>
            <span className="font-serif italic">product</span>
          </h1>
          <p className="text-lg leading-relaxed text-primary-text/50">
            Pick a product to start its questionnaire. Your answers stay with
            this {instance.productName} account.
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
          <div className="max-w-2xl rounded-2xl border border-destructive/25 bg-destructive/5 p-6">
            <p className="mb-1 text-sm font-black uppercase tracking-[0.18em] text-destructive">
              Couldn&apos;t load products
            </p>
            <p className="text-base leading-relaxed text-primary-text/70">
              {result.error}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
