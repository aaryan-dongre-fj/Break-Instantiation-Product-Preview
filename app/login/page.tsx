import { redirect } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import MagicLinkForm from "@/components/preview/MagicLinkForm";
import { instance } from "@/utils/instance";
import { getStaffSession } from "@/utils/staffSession";

export const metadata = {
  title: `Sign in · ${instance.productName}`,
};

export default async function LoginPage() {
  if (await getStaffSession()) {
    redirect("/products");
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-primary-background lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-12">
            <BrandMark />
          </div>

          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-secondary-background">
            {instance.productName}
          </p>
          <h1 className="mb-3 text-3xl font-bold leading-tight tracking-tight text-primary-text sm:text-4xl">
            <span className="font-sans">Sign </span>
            <span className="font-serif italic">in</span>
          </h1>
          <p className="mb-10 text-base leading-relaxed text-primary-text/50">
            Use the link from your invitation email. If you already have access,
            we can send a fresh sign-in link to your inbox.
          </p>

          <MagicLinkForm />
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-[#0A0A0A] lg:flex lg:flex-col lg:justify-center lg:px-16 xl:px-24">
        <div className="pointer-events-none absolute -right-24 top-1/4 h-[420px] w-[420px] rounded-full bg-secondary-background/20 blur-[120px]" />
        <div className="relative max-w-md">
          <BrandMark light className="mb-8 block" />
          <p className="text-lg leading-relaxed text-white/70">
            Your invitation opens this page, signs you in, and takes you to
            your {instance.productName} products.
          </p>
        </div>
      </div>
    </div>
  );
}
