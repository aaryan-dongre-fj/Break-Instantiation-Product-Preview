import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import MagicLinkForm from "@/components/preview/MagicLinkForm";
import { loadLook } from "@/utils/look";
import { getStaffSession } from "@/utils/staffSession";
import { requestCompanyPath } from "@/utils/look";

export async function generateMetadata(): Promise<Metadata> {
  const look = await loadLook();
  return { title: `Sign in · ${look.name}` };
}

export default async function LoginPage() {
  if (await getStaffSession()) {
    redirect(await requestCompanyPath("/products"));
  }

  return (
    <main className="dossier-ambient flex min-h-screen flex-col items-center justify-center px-5 py-12 sm:px-6">
      <div className="w-full max-w-[26rem]">
        <div className="dossier-rise mb-9 flex justify-center">
          <BrandMark />
        </div>
        <div className="dossier-rise dossier-rise-delay-1">
          <MagicLinkForm />
        </div>
      </div>
    </main>
  );
}
