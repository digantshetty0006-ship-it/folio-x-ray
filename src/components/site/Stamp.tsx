"use client";

import { useId } from "react";

export function Stamp({
  text = "FREE · PRIVATE · NO SIGNUP · ",
  className = "",
}: {
  text?: string;
  className?: string;
}) {
  const id = useId().replaceAll(":", "");
  const pathId = `stamp-${id}`;

  return (
    <div
      className={`relative inline-grid aspect-square w-32 place-items-center sm:w-36 ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 140 140" className="stamp-spin h-full w-full">
        <defs>
          <path
            id={pathId}
            d="M70,70 m-51,0 a51,51 0 1,1 102,0 a51,51 0 1,1 -102,0"
            fill="none"
          />
        </defs>
        <circle
          cx="70"
          cy="70"
          r="67"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
        />
        <circle
          cx="70"
          cy="70"
          r="36"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="1.5 3"
        />
        <text
          fill="currentColor"
          fontFamily="var(--font-ibm-plex-mono)"
          fontSize="8.1"
          letterSpacing="1.55"
        >
          <textPath href={`#${pathId}`}>{text.repeat(2)}</textPath>
        </text>
      </svg>
      <span className="absolute grid place-items-center text-center">
        <span className="serif text-2xl italic leading-none">X</span>
        <span className="label-sm mt-1 text-[0.45rem] tracking-[0.12em]">Ray</span>
      </span>
    </div>
  );
}
