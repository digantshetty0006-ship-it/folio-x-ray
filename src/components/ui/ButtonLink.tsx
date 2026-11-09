import Link from "next/link";
import type { ReactNode } from "react";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "accent";
  className?: string;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link
      href={href}
      className={`btn btn-${variant} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}
