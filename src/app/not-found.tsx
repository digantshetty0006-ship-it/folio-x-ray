import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";

export default function NotFound() {
  return (
    <div className="page-shell flex min-h-[62vh] flex-col justify-center py-20 sm:py-28">
      <p className="label-sm text-accent-ink">404 · Not found</p>
      <h1 className="display-xl mt-5 max-w-3xl">
        This page is not
        <br />
        <span className="italic text-accent-ink">in the folio.</span>
      </h1>
      <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-muted">
        The link may be old, mistyped or never existed. The X-Ray, the guides and
        the method page are still here.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/">Back to the index</ButtonLink>
        <ButtonLink href="/xray" variant="secondary">
          Open the X-Ray
        </ButtonLink>
        <ButtonLink href="/guides" variant="secondary">
          Read the guides
        </ButtonLink>
      </div>
      <p className="mt-10 text-xs text-muted">
        Looking for something specific?{" "}
        <Link href="/about" className="ink-link">
          The about page
        </Link>{" "}
        has the contact address.
      </p>
    </div>
  );
}
