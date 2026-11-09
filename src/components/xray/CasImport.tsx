"use client";

import { useRef, useState } from "react";
import type { FundDetail } from "@/lib/api/schemas";
import { getFundClient, ClientApiError } from "@/lib/client/api";
import { extractSchemeCodes, normalisePdfText } from "@/lib/client/cas";
import { categoryLabels } from "@/lib/fund-mapping";
import { formatDisplayDate } from "@/lib/format";

type Candidate =
  | { code: number; status: "ok"; fund: FundDetail }
  | { code: number; status: "failed"; reason: string };

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_PAGES = 60;

function panIsValid(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
}

function dobPassword(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return "";
  return `${match[3]}${match[2]}${match[1]}`;
}

export function CasImport({
  onChooseFund,
  onManualEntry,
}: {
  onChooseFund: (fund: FundDetail) => void;
  onManualEntry: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pan, setPan] = useState("");
  const [dob, setDob] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  function resetFile() {
    setFile(null);
    setStatus(null);
    setError(null);
    setCandidates([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function parsePdf() {
    if (!file) return;

    const hasPan = pan.trim().length > 0;
    const hasDob = dob.length > 0;
    if (hasPan !== hasDob) {
      setError("Enter both PAN and date of birth, or leave both blank for an unprotected PDF.");
      return;
    }
    if (hasPan && !panIsValid(pan.trim())) {
      setError("PAN should look like ABCDE1234F.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("That PDF is over 10 MB. Try a smaller statement or add holdings manually.");
      return;
    }

    setBusy(true);
    setError(null);
    setStatus("Opening the PDF on this device. Nothing is being uploaded.");
    setCandidates([]);

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const bytes = new Uint8Array(await file.arrayBuffer());
      const password =
        hasPan && hasDob ? `${pan.trim().toUpperCase()}${dobPassword(dob)}` : undefined;

      const loadingTask = pdfjs.getDocument({
        data: bytes,
        password,
        useSystemFonts: true,
      });
      const pdf = await loadingTask.promise;
      const pageCount = Math.min(pdf.numPages, MAX_PAGES);
      const chunks: string[] = [];

      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        setStatus(`Reading page ${pageNumber} of ${pageCount} on this device.`);
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join("\n");
        chunks.push(pageText);
        page.cleanup();
      }
      await loadingTask.destroy();

      const codes = extractSchemeCodes(normalisePdfText(chunks.join("\n")));
      if (codes.length === 0) {
        setError(
          "The PDF opened, but we could not find six-digit AMFI scheme codes in it. Most CAS files identify funds by name and ISIN instead. We do not send fund names to our server, so please add holdings manually.",
        );
        setStatus(null);
        return;
      }

      setStatus("Loading the fund codes we found. This sends only those codes, not the PDF.");
      const loaded = await Promise.all(
        codes.map(async (code): Promise<Candidate> => {
          try {
            const fund = await getFundClient(code);
            return { code, status: "ok", fund };
          } catch (cause) {
            return {
              code,
              status: "failed",
              reason:
                cause instanceof ClientApiError
                  ? cause.message
                  : "This code could not be loaded.",
            };
          }
        }),
      );
      setCandidates(loaded);
      const okCount = loaded.filter((item) => item.status === "ok").length;
      setStatus(
        okCount > 0
          ? `Found ${okCount} usable fund${okCount === 1 ? "" : "s"}. Choose one to load it into the form, then add units and the purchase date.`
          : null,
      );
      if (okCount === 0) {
        setError(
          "We found codes but could not load their fund data. The public data service may be down. Add holdings manually, or retry in a moment.",
        );
      }

      setPan("");
      setDob("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (cause) {
      const name =
        typeof cause === "object" && cause !== null && "name" in cause
          ? String((cause as { name: unknown }).name)
          : "";
      if (name === "PasswordException") {
        setError(
          "That PAN and date of birth did not open the PDF. Most CAMS and KFintech CAS files use PAN + DOB in DDMMYYYY format. Check the values and try again.",
        );
      } else if (name === "InvalidPDFException") {
        setError("That file does not look like a readable PDF. Try the original CAS file or add holdings manually.");
      } else {
        setError(
          "We could not read this PDF. It may use an unsupported layout or password. Nothing was uploaded. Add holdings manually instead.",
        );
      }
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="mt-6 border border-rule bg-paper/40">
      <summary className="label flex min-h-12 cursor-pointer list-none items-center justify-between px-4 py-3 marker:hidden">
        <span>Import from a CAS PDF · optional</span>
        <span aria-hidden="true">+</span>
      </summary>
      <div className="border-t border-rule px-4 pb-5 pt-4">
        <p className="text-sm leading-relaxed text-muted">
          CAMS and KFintech consolidated statements are read on your device with
          PDF.js. The file is never uploaded. Import is best effort: we can only
          use six-digit AMFI scheme codes if they appear in the PDF. Otherwise
          you can add funds manually.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cas-file" className="field-label">
              CAS PDF
            </label>
            <input
              ref={fileInputRef}
              id="cas-file"
              type="file"
              accept=".pdf,application/pdf"
              className="block min-h-11 w-full border border-ink/25 bg-paper/70 px-3 py-2 text-xs file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-1.5 file:font-mono file:text-[0.65rem] file:uppercase file:tracking-wider file:text-paper"
              onChange={(event) => {
                const chosen = event.target.files?.[0] ?? null;
                setCandidates([]);
                setError(null);
                setStatus(null);
                if (chosen && !chosen.name.toLowerCase().endsWith(".pdf")) {
                  setFile(null);
                  setError("Choose a PDF file.");
                  return;
                }
                setFile(chosen);
              }}
              disabled={busy}
            />
            {file ? (
              <p className="mt-1 truncate text-[0.68rem] text-muted">
                {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            ) : null}
          </div>

          <fieldset>
            <legend className="field-label">PDF password (PAN + DOB)</legend>
            <div className="grid grid-cols-[1fr_1.1fr] gap-2">
              <div>
                <label htmlFor="cas-pan" className="sr-only">
                  PAN
                </label>
                <input
                  id="cas-pan"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={10}
                  className="field uppercase"
                  placeholder="ABCDE1234F"
                  value={pan}
                  onChange={(event) => setPan(event.target.value.toUpperCase())}
                  disabled={busy}
                />
              </div>
              <div>
                <label htmlFor="cas-dob" className="sr-only">
                  Date of birth
                </label>
                <input
                  id="cas-dob"
                  type="date"
                  className="field"
                  value={dob}
                  onChange={(event) => setDob(event.target.value)}
                  disabled={busy}
                />
              </div>
            </div>
            <p className="mt-1 text-[0.66rem] leading-relaxed text-muted">
              Used only in this tab. Leave blank if the PDF has no password.
            </p>
          </fieldset>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={parsePdf}
            disabled={!file || busy}
          >
            {busy ? "Reading on this device" : "Read PDF"}
          </button>
          {file ? (
            <button
              type="button"
              className="btn min-h-11 border-transparent px-3"
              onClick={resetFile}
              disabled={busy}
            >
              Remove file
            </button>
          ) : null}
        </div>

        <div aria-live="polite" className="mt-3 text-xs leading-relaxed">
          {status ? <p className="text-muted">{status}</p> : null}
          {error ? (
            <div className="border-l-2 border-accent pl-3">
              <p>{error}</p>
              <button
                type="button"
                className="label-sm mt-2 min-h-10 border-b border-ink/30 hover:text-accent-ink"
                onClick={onManualEntry}
              >
                Add holdings manually
              </button>
            </div>
          ) : null}
        </div>

        {candidates.length > 0 ? (
          <div className="mt-5">
            <p className="label-sm text-muted">Codes found in the PDF</p>
            <ul className="mt-2 divide-y divide-rule border-y border-rule">
              {candidates.map((candidate) => (
                <li key={candidate.code} className="py-3">
                  {candidate.status === "ok" ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-snug">
                          {candidate.fund.name}
                        </p>
                        <p className="mt-0.5 text-[0.68rem] text-muted">
                          Code {candidate.fund.code} ·{" "}
                          {categoryLabels[candidate.fund.category]} ·{" "}
                          {candidate.fund.planType === "direct"
                            ? "Direct"
                            : "Regular"}{" "}
                          · NAV {formatDisplayDate(candidate.fund.latestDate)}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary min-h-10 px-3"
                        onClick={() => onChooseFund(candidate.fund)}
                      >
                        Use this fund
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm">Code {candidate.code} could not be loaded.</p>
                      <p className="mt-0.5 text-[0.68rem] text-muted">
                        {candidate.reason}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[0.68rem] text-muted">
              Units and dates are not read automatically. They must be entered
              by you in the form. This avoids guessing at transaction history.
            </p>
          </div>
        ) : null}
      </div>
    </details>
  );
}
