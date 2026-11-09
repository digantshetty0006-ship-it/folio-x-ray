"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { FundDetail, FundSearchResult } from "@/lib/api/schemas";
import { ClientApiError, getFundClient } from "@/lib/client/api";
import { sampleHoldings, sampleNote } from "@/lib/content/sample-portfolio";
import { evaluatePortfolio } from "@/lib/engine/portfolio";
import { categoryLabels } from "@/lib/fund-mapping";
import { formatDisplayDate, formatINR, formatNumber } from "@/lib/format";
import {
  clearStoredPortfolio,
  readRememberPreference,
  readStoredPortfolio,
  writeStoredPortfolio,
} from "@/lib/portfolio/storage";
import {
  fromStoredHolding,
  newHoldingId,
  toEngineHolding,
  toStoredHolding,
  type ToolHolding,
} from "@/lib/portfolio/tool-holding";
import { CasImport } from "./CasImport";
import { FundSearch } from "./FundSearch";
import { HoldingForm, type HoldingDraft } from "./HoldingForm";
import { XRayReport } from "./XRayReport";

type SampleState = "idle" | "loading" | "loaded";

function friendlyError(cause: unknown): string {
  if (cause instanceof ClientApiError) return cause.message;
  return "The fund data did not load. Check your connection and try again.";
}

function subscribeToStorage(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function holdingModeLabel(holding: ToolHolding): string {
  if (holding.mode === "units") {
    return `${formatNumber(holding.units ?? 0, 4)} units bought ${formatDisplayDate(
      holding.purchaseDate ?? "",
    )}`;
  }
  return `SIP ${formatINR(holding.sipAmount ?? 0)} / ${
    holding.sipFrequency === "weekly"
      ? "week"
      : holding.sipFrequency === "quarterly"
        ? "quarter"
        : "month"
  } from ${formatDisplayDate(holding.sipStartDate ?? "")}`;
}

export function XRayTool({ autoSample = false }: { autoSample?: boolean }) {
  const [holdings, setHoldings] = useState<ToolHolding[]>([]);
  const [selectedFund, setSelectedFund] = useState<FundDetail | null>(null);
  const [selectedResult, setSelectedResult] = useState<FundSearchResult | null>(
    null,
  );
  const [fundLoading, setFundLoading] = useState(false);
  const [fundError, setFundError] = useState<string | null>(null);
  const [rememberOverride, setRememberOverride] = useState<boolean | null>(
    null,
  );
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const [sampleState, setSampleState] = useState<SampleState>("idle");
  const [sampleError, setSampleError] = useState<string | null>(null);
  const [isSample, setIsSample] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);

  const storedRemember = useSyncExternalStore(
    subscribeToStorage,
    readRememberPreference,
    () => false,
  );
  const remember = rememberOverride ?? storedRemember;

  const lookupControllerRef = useRef<AbortController | null>(null);
  const sampleControllerRef = useRef<AbortController | null>(null);
  const restoreControllerRef = useRef<AbortController | null>(null);

  const portfolio = useMemo(
    () => evaluatePortfolio(holdings.map(toEngineHolding)),
    [holdings],
  );

  useEffect(() => {
    if (!announcement) return;
    const timer = window.setTimeout(() => setAnnouncement(null), 7000);
    return () => window.clearTimeout(timer);
  }, [announcement]);

  const persist = useCallback((next: ToolHolding[]) => {
    if (readRememberPreference()) {
      writeStoredPortfolio(next.map(toStoredHolding));
    }
  }, []);

  const loadSamplePortfolio = useCallback(async (externalSignal?: AbortSignal) => {
    if (externalSignal?.aborted) return;

    sampleControllerRef.current?.abort();
    const controller = new AbortController();
    sampleControllerRef.current = controller;

    const abortFromOutside = () => controller.abort();
    externalSignal?.addEventListener("abort", abortFromOutside);

    setSampleState("loading");
    setSampleError(null);
    setAnnouncement(null);

    try {
      const loaded = await Promise.all(
        sampleHoldings.map(async (sample) => ({
          sample,
          fund: await getFundClient(sample.fundCode, controller.signal),
        })),
      );
      if (controller.signal.aborted) return;

      const next: ToolHolding[] = loaded.map(({ sample, fund }) => ({
        id: newHoldingId(),
        fund,
        mode: sample.mode,
        units: sample.units,
        purchaseDate: sample.purchaseDate,
        sipAmount: sample.sipAmount,
        sipStartDate: sample.sipStartDate,
        sipFrequency: sample.sipFrequency,
      }));

      setHoldings(next);
      setIsSample(true);
      setSampleState("loaded");
      setAnnouncement(
        "Sample portfolio loaded in this browser. It was not saved to storage.",
      );
    } catch (cause) {
      if (controller.signal.aborted) return;
      setSampleState("idle");
      setSampleError(friendlyError(cause));
    } finally {
      externalSignal?.removeEventListener("abort", abortFromOutside);
    }
  }, []);

  useEffect(() => {
    const preference = readRememberPreference();
    const stored = preference ? readStoredPortfolio() : [];
    const controller = new AbortController();
    restoreControllerRef.current = controller;

    if (stored.length > 0) {
      const timer = window.setTimeout(() => {
        void (async () => {
          setRestoring(true);
          setRestoreError(null);
          try {
            const byCode = new Map<number, FundDetail>();
            const codes = [...new Set(stored.map((item) => item.fundCode))];
            const loaded = await Promise.all(
              codes.map(async (code) => ({
                code,
                fund: await getFundClient(code, controller.signal),
              })),
            );
            if (controller.signal.aborted) return;

            for (const item of loaded) byCode.set(item.code, item.fund);

            const restored = stored
              .map((item) => {
                const fund = byCode.get(item.fundCode);
                return fund ? fromStoredHolding(item, fund) : null;
              })
              .filter((item): item is ToolHolding => item !== null);

            setHoldings(restored);
            setIsSample(false);
            setAnnouncement(
              autoSample
                ? "Restored your saved folio from this browser. The sample was not loaded so your saved data stayed intact."
                : restored.length === stored.length
                  ? `Restored ${restored.length} saved holding${restored.length === 1 ? "" : "s"} from this browser.`
                  : `Restored ${restored.length} of ${stored.length} saved holdings. The rest could not be rebuilt.`,
            );
          } catch (cause) {
            if (controller.signal.aborted) return;
            setRestoreError(friendlyError(cause));
          } finally {
            if (!controller.signal.aborted) setRestoring(false);
          }
        })();
      }, 0);

      return () => {
        window.clearTimeout(timer);
        controller.abort();
      };
    }

    if (autoSample) {
      const timer = window.setTimeout(() => {
        void loadSamplePortfolio(controller.signal);
      }, 0);

      return () => {
        window.clearTimeout(timer);
        controller.abort();
      };
    }

    return undefined;
  }, [autoSample, restoreAttempt, loadSamplePortfolio]);

  useEffect(
    () => () => {
      lookupControllerRef.current?.abort();
      sampleControllerRef.current?.abort();
    },
    [],
  );

  function clearSelection() {
    lookupControllerRef.current?.abort();
    setSelectedFund(null);
    setSelectedResult(null);
    setFundLoading(false);
    setFundError(null);
  }

  async function loadFund(result: FundSearchResult) {
    lookupControllerRef.current?.abort();
    const controller = new AbortController();
    lookupControllerRef.current = controller;

    setSelectedResult(result);
    setSelectedFund(null);
    setFundError(null);
    setFundLoading(true);

    try {
      const fund = await getFundClient(result.code, controller.signal);
      if (!controller.signal.aborted) setSelectedFund(fund);
    } catch (cause) {
      if (controller.signal.aborted) return;
      setFundError(friendlyError(cause));
    } finally {
      if (!controller.signal.aborted) setFundLoading(false);
    }
  }

  function chooseCasFund(fund: FundDetail) {
    lookupControllerRef.current?.abort();
    setSelectedResult(null);
    setFundError(null);
    setFundLoading(false);
    setSelectedFund(fund);
    setAnnouncement(`${fund.name} is ready. Enter the units and purchase date.`);
    window.requestAnimationFrame(() => {
      document
        .getElementById("holding-entry")
        ?.scrollIntoView({ block: "start" });
    });
  }

  function addHolding(draft: HoldingDraft) {
    if (!selectedFund) return;

    const holding: ToolHolding = {
      id: newHoldingId(),
      fund: selectedFund,
      mode: draft.mode,
      units: draft.mode === "units" ? draft.units : undefined,
      purchaseDate: draft.mode === "units" ? draft.purchaseDate : undefined,
      sipAmount: draft.mode === "sip" ? draft.sipAmount : undefined,
      sipStartDate: draft.mode === "sip" ? draft.sipStartDate : undefined,
      sipFrequency: draft.mode === "sip" ? draft.sipFrequency : undefined,
    };

    const replacedSample = isSample;
    const next = replacedSample ? [holding] : [...holdings, holding];
    setHoldings(next);
    setIsSample(false);
    persist(next);
    clearSelection();
    setAnnouncement(
      replacedSample
        ? "The sample was cleared. Your holding was added and the report is ready."
        : "Holding added. The report has been updated.",
    );
    window.requestAnimationFrame(() => {
      document
        .getElementById("holdings-list")
        ?.scrollIntoView({ block: "start" });
    });
  }

  function removeHolding(id: string) {
    const next = holdings.filter((holding) => holding.id !== id);
    setHoldings(next);
    if (next.length === 0) setIsSample(false);
    if (!isSample) persist(next);
    setAnnouncement("Holding removed. The report has been updated.");
  }

  function toggleRemember(checked: boolean) {
    if (isSample) return;
    setRememberOverride(checked);
    if (checked) {
      writeStoredPortfolio(holdings.map(toStoredHolding));
      setAnnouncement(
        "This folio will be remembered in this browser. You can clear it at any time.",
      );
    } else {
      clearStoredPortfolio();
      setAnnouncement("Saved data cleared from this browser.");
    }
  }

  function clearEverything() {
    sampleControllerRef.current?.abort();
    restoreControllerRef.current?.abort();
    setHoldings([]);
    setIsSample(false);
    setSampleState("idle");
    setSampleError(null);
    setRestoring(false);
    setRestoreError(null);
    setConfirmClear(false);
    clearSelection();
    setRememberOverride(false);
    clearStoredPortfolio();
    setAnnouncement(
      "All holdings and saved data were cleared from this browser.",
    );
  }

  const busy = sampleState === "loading" || restoring;

  return (
    <div>
      <section
        className="scroll-mt-24 border-t border-ink pt-5"
        aria-labelledby="build-folio"
      >
        <div className="no-print flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label text-accent-ink">Step 1 / Build the folio</p>
            <h2 id="build-folio" className="display-lg mt-3">
              Start with one fund.
            </h2>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-muted">
            Search terms and fund codes reach our data proxy. Units, amounts and
            dates never leave this browser.
          </p>
        </div>

        <div id="holding-entry" className="no-print mt-8 scroll-mt-24">
          <FundSearch onSelect={loadFund} disabled={busy} />

          {fundLoading || fundError || selectedFund ? (
            <HoldingForm
              fund={selectedFund}
              loading={fundLoading}
              error={fundError}
              onRetry={() => {
                if (selectedResult) void loadFund(selectedResult);
              }}
              onAdd={addHolding}
              onCancel={clearSelection}
            />
          ) : null}
        </div>

        <div className="no-print">
          <CasImport onChooseFund={chooseCasFund} onManualEntry={() => {
            document
              .getElementById("holding-entry")
              ?.scrollIntoView({ block: "start" });
          }} />
        </div>

        <div aria-live="polite" className="no-print mt-5 space-y-3">
          {restoring ? (
            <div className="border border-rule bg-paper/60 p-4">
              <p className="label-sm text-muted">Restoring saved folio</p>
              <p className="mt-1 text-sm leading-relaxed">
                Reading the holdings saved in this browser and loading public
                NAV history. Nothing is being uploaded.
              </p>
            </div>
          ) : null}

          {restoreError ? (
            <div className="border border-accent-ink bg-accent/5 p-4">
              <p className="label-sm text-accent-ink">
                Saved folio could not be restored
              </p>
              <p className="mt-1 text-sm leading-relaxed">{restoreError}</p>
              <button
                type="button"
                className="btn btn-secondary mt-3 min-h-10 px-3"
                onClick={() => setRestoreAttempt((value) => value + 1)}
              >
                Retry restore
              </button>
            </div>
          ) : null}

          {sampleState === "loading" ? (
            <div className="border border-rule bg-paper/60 p-4">
              <p className="label-sm text-muted">Loading the sample</p>
              <div className="mt-3 h-4 w-2/3 animate-pulse bg-rule" />
              <div className="mt-2 h-4 w-1/2 animate-pulse bg-rule" />
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Four real funds with invented holdings. Their public NAV history
                is being loaded.
              </p>
            </div>
          ) : null}

          {sampleError ? (
            <div className="border border-accent-ink bg-accent/5 p-4">
              <p className="label-sm text-accent-ink">
                The sample did not load
              </p>
              <p className="mt-1 text-sm leading-relaxed">{sampleError}</p>
              <button
                type="button"
                className="btn btn-secondary mt-3 min-h-10 px-3"
                onClick={() => void loadSamplePortfolio()}
              >
                Retry sample
              </button>
            </div>
          ) : null}
        </div>

        {holdings.length === 0 && !busy && !fundLoading && !selectedFund ? (
          <div className="no-print mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-rule py-5">
            <div>
              <p className="text-sm font-medium">Nothing to read yet.</p>
              <p className="mt-1 max-w-lg text-xs leading-relaxed text-muted">
                Add a fund above, or load four real funds with invented holdings
                to see the full report first.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => void loadSamplePortfolio()}
            >
              Load the sample
            </button>
          </div>
        ) : null}

        {holdings.length > 0 ? (
          <div id="holdings-list" className="mt-10 scroll-mt-24 print:mt-0">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink pb-3">
              <div>
                <p className="label-sm text-muted">
                  In this folio · {holdings.length}
                </p>
                <h3 className="display-md mt-1">
                  {isSample ? "The sample folio." : "Your holdings."}
                </h3>
              </div>
              <p className="no-print text-xs text-muted">
                {isSample
                  ? "Invented holdings, real funds. Not a suggested portfolio."
                  : "Everything here stays in this browser."}
              </p>
            </div>

            {isSample ? (
              <p className="mt-3 border-l-2 border-accent pl-3 text-xs leading-relaxed text-muted">
                {sampleNote}
              </p>
            ) : null}

            <ul className="mt-4 divide-y divide-rule border-b border-rule">
              {holdings.map((holding) => (
                <li
                  key={holding.id}
                  className="flex flex-wrap items-start justify-between gap-3 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">
                      {holding.fund.name}
                    </p>
                    <p className="mt-1 text-[0.7rem] leading-relaxed text-muted">
                      {categoryLabels[holding.fund.category]} ·{" "}
                      {holding.fund.planType === "direct"
                        ? "Direct plan"
                        : "Regular plan"}{" "}
                      · {holdingModeLabel(holding)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="tabular text-right text-xs">
                      {formatINR(
                        portfolio.holdings.find(
                          (evaluation) => evaluation.id === holding.id,
                        )?.value ?? 0,
                      )}
                    </span>
                    <button
                      type="button"
                      className="no-print label-sm min-h-10 border-b border-ink/30 px-1 hover:text-accent-ink"
                      onClick={() => removeHolding(holding.id)}
                      aria-label={`Remove ${holding.fund.name}`}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="no-print mt-8 grid gap-4 border border-rule bg-paper/50 p-4 sm:grid-cols-12 sm:items-center">
          <div className="sm:col-span-8">
            {isSample ? (
              <p className="text-sm leading-relaxed">
                This sample is temporary and is never saved.
                <span className="mt-1 block text-xs leading-relaxed text-muted">
                  Add your own holding to enable the remember option. You can
                  clear the sample at any time.
                </span>
              </p>
            ) : (
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 size-4 shrink-0 accent-[var(--accent)]"
                  checked={remember}
                  onChange={(event) => toggleRemember(event.target.checked)}
                />
                <span>
                  Remember this folio on this device
                  <span className="mt-1 block text-xs leading-relaxed text-muted">
                    Off by default. When on, holdings are saved in this
                    browser&apos;s localStorage, never on our server. Turning it
                    off clears the saved copy.
                  </span>
                </span>
              </label>
            )}
          </div>
          <div className="sm:col-span-4 sm:text-right">
            {confirmClear ? (
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span className="text-xs text-muted">Clear everything?</span>
                <button
                  type="button"
                  className="btn min-h-10 border-accent-ink bg-accent-ink px-3 text-paper"
                  onClick={clearEverything}
                >
                  Yes, clear
                </button>
                <button
                  type="button"
                  className="btn btn-secondary min-h-10 px-3"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-secondary min-h-10 px-3"
                onClick={() => setConfirmClear(true)}
              >
                Clear all my data
              </button>
            )}
          </div>
        </div>

        <p className="sr-only" role="status">
          {announcement ?? ""}
        </p>
        {announcement ? (
          <p
            aria-hidden="true"
            className="no-print mt-4 border-l-2 border-ink/30 pl-3 text-xs leading-relaxed text-muted"
          >
            {announcement}
          </p>
        ) : null}
      </section>

      {holdings.length > 0 ? (
        <div className="mt-16">
          <XRayReport holdings={holdings} portfolio={portfolio} />
        </div>
      ) : null}
    </div>
  );
}
