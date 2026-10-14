"use client";

import { useLook } from "@/components/LookProvider";

export default function BrandMark({
  className = "",
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  const { logo, name } = useLook();
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logo} alt={name} className={`h-8 w-auto ${className}`} />
    );
  }

  return (
    <span
      className={`font-sans text-2xl font-semibold tracking-tight ${
        light ? "text-white" : "text-primary-text"
      } ${className}`}
    >
      {name}
    </span>
  );
}
