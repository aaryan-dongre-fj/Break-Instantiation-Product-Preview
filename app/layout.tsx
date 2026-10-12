import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { Inter, Source_Serif_4 } from "next/font/google";
import { instance } from "@/utils/instance";

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

export const metadata: Metadata = {
  title: instance.title,
  description: instance.description,
  icons: {
    icon: instance.favicon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
