import React from "react";
import { redirect } from "next/navigation";
import ReportExperience from "@/components/preview/ReportExperience";
import { loadPreviewProduct } from "@/utils/loadPreviewProduct";
import { instance } from "@/utils/instance";

export const metadata = {
  title: `Results · ${instance.productName}`,
};

export const dynamic = "force-dynamic";

function resultsSuffix(search: {
  answered?: string | string[];
  total?: string | string[];
}): string {
  const params = new URLSearchParams();
  const answered = Array.isArray(search.answered)
    ? search.answered[0]
    : search.answered;
  const total = Array.isArray(search.total) ? search.total[0] : search.total;
  if (answered) params.set("answered", answered);
  if (total) params.set("total", total);
  const query = params.toString();
  return query ? `/results?${query}` : "/results";
}

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ answered?: string | string[]; total?: string | string[] }>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const loaded = await loadPreviewProduct(slug, resultsSuffix(search));

  if (!loaded.ok) redirect("/products");

  return (
    <ReportExperience email={loaded.email} versionId={loaded.versionId} />
  );
}
