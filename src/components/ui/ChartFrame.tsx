import type { ReactNode } from "react";
import { Label } from "./Label";
import { Disclaimer } from "./Disclaimer";

export function ChartFrame({
  label,
  title,
  note,
  summary,
  children,
  disclaimer,
  className = "",
}: {
  label: string;
  title: string;
  note?: string;
  summary: string;
  children: ReactNode;
  disclaimer?: ReactNode;
  className?: string;
}) {
  return (
    <figure className={`border border-rule bg-paper/60 p-4 print:p-2 sm:p-6 ${className}`}>
      <figcaption className="mb-6 print:mb-2">
        <Label className="text-muted">{label}</Label>
        <h3 className="display-md mt-2">{title}</h3>
        {note ? <p className="mt-2 text-sm text-muted">{note}</p> : null}
      </figcaption>
      <div role="img" aria-label={summary}>
        {children}
      </div>
      <p className="sr-only">{summary}</p>
      <Disclaimer className="mt-5 border-t border-rule pt-3 print:mt-2 print:pt-2">
        {disclaimer}
      </Disclaimer>
    </figure>
  );
}
