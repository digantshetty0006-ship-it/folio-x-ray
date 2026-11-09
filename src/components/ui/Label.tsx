import type { ReactNode } from "react";

export function Label({
  children,
  className = "",
  as: Tag = "span",
}: {
  children: ReactNode;
  className?: string;
  as?: "span" | "p" | "div" | "dt";
}) {
  return <Tag className={`label ${className}`}>{children}</Tag>;
}
