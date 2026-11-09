import type { ReactNode } from "react";

export function EditorialPage({
  label,
  meta,
  title,
  intro,
  aside,
  children,
}: {
  label: string;
  meta: string;
  title: ReactNode;
  intro: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="page-shell pb-24 pt-6 sm:pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
        <p className="label-sm text-muted">{label}</p>
        <p className="label-sm text-muted">{meta}</p>
      </div>

      <header className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <h1 className="display-xl">{title}</h1>
        </div>
        <div className="lg:col-span-4">
          <p className="max-w-md text-[1.02rem] leading-relaxed text-muted">
            {intro}
          </p>
        </div>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 lg:col-span-8">{children}</div>
        {aside ? (
          <aside className="min-w-0 lg:col-span-4">{aside}</aside>
        ) : null}
      </div>
    </div>
  );
}
