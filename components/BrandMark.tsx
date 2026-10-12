import { instance } from "@/utils/instance";

export default function BrandMark({
  className = "",
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  if (instance.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={instance.logo}
        alt={instance.productName}
        className={`h-8 w-auto ${className}`}
      />
    );
  }

  return (
    <span
      className={`font-sans text-2xl font-semibold tracking-tight ${
        light ? "text-white" : "text-primary-text"
      } ${className}`}
    >
      {instance.productName}
    </span>
  );
}
