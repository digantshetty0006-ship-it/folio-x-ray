"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-shell flex min-h-[62vh] flex-col justify-center py-20 sm:py-28">
      <p className="label-sm text-accent-ink">Error · Something broke</p>
      <h1 className="display-xl mt-5 max-w-3xl">
        The page hit
        <br />
        <span className="italic text-accent-ink">a snag.</span>
      </h1>
      <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-muted">
        The report is calculated in your browser, so a reload may be enough. If
        the error repeats, the index and the guides are still available.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-secondary">
          Back to the index
        </Link>
        <Link href="/guides" className="btn btn-secondary">
          Read the guides
        </Link>
      </div>
      {error.digest ? (
        <p className="mt-8 text-xs text-muted">
          Error reference: <span className="tabular">{error.digest}</span>
        </p>
      ) : null}
    </div>
  );
}
