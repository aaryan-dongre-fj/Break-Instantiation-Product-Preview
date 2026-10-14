import React from "react";
import PreviewNavbar from "@/components/preview/PreviewNavbar";
import QuestionnaireWalk from "@/components/preview/QuestionnaireWalk";
import { getVersions } from "@/utils/flowTool";
import { loadPreviewProduct } from "@/utils/loadPreviewProduct";
import { lineageForProduct } from "@/utils/productLine";
import { instance } from "@/utils/instance";
import { redirectIfConsentMissing } from "@/utils/requireConsent";
import { getStaffSession } from "@/utils/staffSession";

export const metadata = {
  title: `Questionnaire · ${instance.productName}`,
};

export const dynamic = "force-dynamic";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await redirectIfConsentMissing();
  const loaded = await loadPreviewProduct(slug);

  if (!loaded.ok) {
    return (
      <div className="min-h-screen bg-primary-background text-primary-text">
        <PreviewNavbar email={loaded.email} context="Questionnaire" />
        <main className="mx-auto max-w-2xl px-6 py-24">
          <h1 className="mb-3 text-2xl font-bold tracking-tight">
            Questionnaire unavailable
          </h1>
          <p className="text-lg leading-relaxed text-primary-text/60">
            {loaded.error}
          </p>
        </main>
      </div>
    );
  }

  const staff = await getStaffSession();
  const versions = staff ? await getVersions(staff) : null;
  const line = lineageForProduct(
    loaded.product,
    versions?.ok ? versions.data : []
  ).line;

  return (
    <div className="min-h-screen bg-primary-background text-primary-text">
      <PreviewNavbar
        email={loaded.email}
        context={loaded.product.name}
      />
      <QuestionnaireWalk
        versionId={loaded.versionId}
        productSlug={loaded.slug}
        productCode={loaded.product.code}
        rememberProgress={line !== "break"}
      />
    </div>
  );
}
