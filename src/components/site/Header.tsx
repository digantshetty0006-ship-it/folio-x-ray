"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { site } from "@/lib/config";

const navigation = [
  { href: "/", label: "Index" },
  { href: "/xray", label: "X-Ray" },
  { href: "/guides", label: "Guides" },
  { href: "/method", label: "Method" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="no-print sticky top-0 z-50 border-b border-rule bg-paper/95 backdrop-blur-[2px]">
      <div className="page-shell flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">
        <div className="flex min-w-0 items-baseline gap-3 sm:gap-5">
          <Link
            href="/"
            className="serif truncate text-[1.45rem] leading-none tracking-[-0.02em]"
            aria-label="Folio X-Ray, home"
          >
            Folio X-Ray
          </Link>
          <span className="label-sm hidden text-muted sm:inline">
            {site.location}
          </span>
        </div>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-6">
            {navigation.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`label-sm relative py-2 transition-colors hover:text-accent-ink ${
                      active ? "text-ink" : "text-muted"
                    }`}
                  >
                    {item.label}
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-accent"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          className="label flex min-h-11 items-center gap-2 border border-ink/30 px-3 md:hidden"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
          <span aria-hidden="true" className="text-base leading-none">
            {open ? "×" : "≡"}
          </span>
        </button>
      </div>

      {open ? (
        <nav
          id={panelId}
          aria-label="Mobile"
          className="border-t border-rule bg-paper px-5 py-3 md:hidden"
        >
          <ul className="grid grid-cols-2 gap-x-4">
            {navigation.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`label flex min-h-12 items-center border-b border-rule ${
                      active ? "text-accent-ink" : "text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="label-sm mt-4 text-muted">{site.location}</p>
        </nav>
      ) : null}
    </header>
  );
}
