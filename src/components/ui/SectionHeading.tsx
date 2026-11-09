import type { ReactNode } from "react";

export function SectionHeading({
  label,
  title,
  intro,
  action,
  id,
}: {
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-12 md:items-end">
      <div className="md:col-span-8">
        <p className="eyebrow mb-5">{label}</p>
        <h2 id={id} className="display-lg max-w-4xl">
          {title}
        </h2>
        {intro ? (
          <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-muted">
            {intro}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="md:col-span-4 md:justify-self-end">{action}</div>
      ) : null}
    </div>
  );
}
