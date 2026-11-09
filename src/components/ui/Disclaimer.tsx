import type { ReactNode } from "react";

export function Disclaimer({
  children,
  className = "",
  print = false,
}: {
  children?: ReactNode;
  className?: string;
  print?: boolean;
}) {
  return (
    <p
      className={`text-[0.69rem] leading-relaxed text-muted ${print ? "print-disclaimer" : ""} ${className}`}
    >
      {children ??
        "Educational illustration only. Not investment advice. Figures are estimates based on public NAV data and the assumptions shown, not a promise of future returns."}
    </p>
  );
}
