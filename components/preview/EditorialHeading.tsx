import React from "react";

/**
 * House heading style: Inter for the phrase, Source Serif 4 italic on the last
 * word. Single-word headings go all-serif.
 */
export default function EditorialHeading({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const words = text.trim().split(/\s+/);

  if (words.length <= 1) {
    return <span className={`font-serif italic ${className}`}>{text}</span>;
  }

  return (
    <span className={className}>
      <span className="font-sans font-medium">{words.slice(0, -1).join(" ")} </span>
      <span className="font-serif italic">{words[words.length - 1]}</span>
    </span>
  );
}
