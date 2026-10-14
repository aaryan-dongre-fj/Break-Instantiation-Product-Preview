import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ConsentForm from "@/components/preview/ConsentForm";
import PreviewNavbar from "@/components/preview/PreviewNavbar";
import { getConsentState, getConsentTemplate } from "@/utils/clientPortal";
import { loadLook } from "@/utils/look";
import { getStaffEmail, getStaffSession } from "@/utils/staffSession";
import { requestCompanyPath } from "@/utils/look";

export async function generateMetadata(): Promise<Metadata> {
  const look = await loadLook();
  return { title: `Consent · ${look.name}` };
}

export const dynamic = "force-dynamic";

export default async function ConsentPage() {
  const staff = await getStaffSession();
  if (!staff) redirect(await requestCompanyPath("/login"));

  const existing = await getConsentState(staff);
  if (existing.state === "granted") redirect(await requestCompanyPath("/products"));

  const email = await getStaffEmail();
  const template = existing.state === "error" ? null : await getConsentTemplate(staff);
  const error =
    existing.state === "error"
      ? existing.error
      : template && !template.ok
        ? template.error
        : null;

  return (
    <div className="dossier-ambient min-h-screen bg-primary-background pt-[72px] text-primary-text">
      <PreviewNavbar email={email} />
      <main className="flex flex-col justify-center px-6 py-10 lg:px-12">
        {template && template.ok ? (
          <ConsentForm text={template.data.text} />
        ) : (
          <div className="dossier-card mx-auto w-full max-w-xl rounded-card p-7">
            <h1 className="text-2xl font-bold tracking-tight">Consent is unavailable</h1>
            <p className="mt-3 text-base font-medium leading-relaxed text-[var(--ej-text-soft)]">
              {error}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
