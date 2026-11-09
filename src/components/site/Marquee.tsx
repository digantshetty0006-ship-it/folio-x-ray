import Link from "next/link";

export function Marquee({
  href = "/xray",
  text = "See what you actually own",
}: {
  href?: string;
  text?: string;
}) {
  const group = (
    <span className="flex shrink-0 items-center">
      {Array.from({ length: 4 }).map((_, index) => (
        <span key={index} className="flex items-center">
          <span className="serif whitespace-nowrap px-6 text-[clamp(2rem,5vw,4.2rem)] italic leading-none">
            {text}
          </span>
          <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
        </span>
      ))}
    </span>
  );

  return (
    <Link
      href={href}
      className="marquee group block overflow-hidden border-y border-ink bg-ink py-5 text-paper sm:py-7"
    >
      <span className="marquee-track" aria-hidden="true">
        {group}
        {group}
      </span>
      <span className="sr-only">{text}. Open the X-Ray.</span>
    </Link>
  );
}
