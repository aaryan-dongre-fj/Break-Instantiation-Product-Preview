import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { Inter, Source_Serif_4 } from "next/font/google";
import { LookProvider } from "@/components/LookProvider";
import { CompanyProvider } from "@/components/CompanyProvider";
import { loadLook, requestCompany } from "@/utils/look";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-source-serif-4",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const look = await loadLook();
  return {
    title: look.title,
    description: look.description,
    icons: {
      icon: look.favicon,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const look = await loadLook();
  const company = await requestCompany();
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif.variable}`}
      style={
        {
          "--primary": look.colors.primary,
          "--primary-foreground": look.colors.primaryForeground,
          "--ej-amber": look.colors.primary,
          "--ej-border-active": `color-mix(in srgb, ${look.colors.primary} 45%, transparent)`,
          "--brand-hover": look.colors.primaryHover,
          "--ring": look.colors.primary,
        } as React.CSSProperties
      }
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="antialiased">
        <CompanyProvider company={company}>
          <LookProvider look={look}>{children}</LookProvider>
        </CompanyProvider>
        <Toaster />
      </body>
    </html>
  );
}
