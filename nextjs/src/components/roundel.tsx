import React from "react";

type Props = {
  size?: number;
  className?: string;
};

/**
 * Simplified TfL roundel: a red ring crossed by a horizontal blue bar.
 * Rendered inline so it inherits the dark theme without a separate asset.
 */
export default function Roundel({ size = 28, className }: Props) {
  const height = Math.round(size * 0.82);
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 100 82"
      role="img"
      aria-label="TfL roundel"
      className={className}
    >
      <circle
        cx="50"
        cy="41"
        r="28"
        fill="none"
        stroke="var(--color-tfl-red, #dc241f)"
        strokeWidth="11"
      />
      <rect
        x="6"
        y="33"
        width="88"
        height="16"
        fill="var(--color-tfl-blue, #1c3f94)"
      />
    </svg>
  );
}
