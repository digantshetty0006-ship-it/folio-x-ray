"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FundSearchResult } from "@/lib/api/schemas";
import { searchFundsClient, ClientApiError } from "@/lib/client/api";

export function FundSearch({
  onSelect,
  disabled = false,
}: {
  onSelect: (result: FundSearchResult) => void;
  disabled?: boolean;
}) {
  const inputId = useId();
  const listboxId = useId();
  const helpId = useId();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<FundSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 320);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debounced.length < 2) return;
    const controller = new AbortController();
    searchFundsClient(debounced, controller.signal)
      .then((data) => {
        setResults(data);
        setActiveIndex(0);
        setError(null);
        setOpen(true);
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setResults([]);
        setError(
          cause instanceof ClientApiError
            ? cause.message
            : "The fund search did not work. Try again.",
        );
        setOpen(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [debounced, retry]);

  function handleChange(value: string) {
    setQuery(value);
    setError(null);
    setOpen(value.trim().length >= 2);
    if (value.trim().length < 2) {
      setResults([]);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }

  function choose(result: FundSearchResult) {
    setQuery(result.name);
    setOpen(false);
    onSelect(result);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      if (results.length > 0) {
        setActiveIndex((index) => Math.min(index + 1, results.length - 1));
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (results.length > 0) {
        setActiveIndex((index) => Math.max(index - 1, 0));
      }
    } else if (event.key === "Enter") {
      if (open && results.length > 0) {
        event.preventDefault();
        choose(results[activeIndex] ?? results[0]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <label htmlFor={inputId} className="field-label">
        Search a mutual fund
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-describedby={helpId}
          aria-activedescendant={
            open && results[activeIndex]
              ? `${listboxId}-option-${results[activeIndex].code}`
              : undefined
          }
          autoComplete="off"
          spellCheck={false}
          className="field pr-24"
          placeholder="Try “Parag Parikh” or “HDFC”"
          value={query}
          disabled={disabled}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => {
            if (results.length > 0 || error) setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        <span className="label-sm absolute right-3 top-1/2 -translate-y-1/2 text-muted">
          {loading ? "Searching" : "Fund"}
        </span>
      </div>
      <p id={helpId} className="mt-1.5 text-[0.7rem] leading-relaxed text-muted">
        Type at least two characters. The search term is sent to our proxy;
        your holdings are not.
      </p>

      <div aria-live="polite" className="sr-only">
        {loading
          ? "Searching for funds"
          : error
            ? error
            : results.length > 0
              ? `${results.length} funds found`
              : ""}
      </div>

      {open ? (
        <div className="absolute z-40 mt-2 w-full border border-ink bg-paper shadow-[6px_6px_0_rgba(20,19,15,0.12)]">
          {loading ? (
            <div className="p-4">
              <div className="h-3 w-2/3 animate-pulse bg-rule" />
              <div className="mt-2 h-3 w-1/2 animate-pulse bg-rule" />
              <p className="label-sm mt-4 text-muted">Reading the fund list</p>
            </div>
          ) : error ? (
            <div className="p-4">
              <p className="text-sm leading-relaxed">{error}</p>
              <button
                type="button"
                className="btn btn-secondary mt-3 min-h-10 px-3"
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  setRetry((value) => value + 1);
                }}
              >
                Retry search
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4">
              <p className="text-sm">
                No funds found for “{query.trim()}”.
              </p>
              <p className="mt-1 text-xs text-muted">
                Try fewer words, a fund house name, or check the spelling.
              </p>
            </div>
          ) : (
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Matching mutual funds"
              className="max-h-[22rem] overflow-y-auto"
            >
              {results.map((result, index) => (
                <li
                  key={result.code}
                  id={`${listboxId}-option-${result.code}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`cursor-pointer border-b border-rule px-4 py-3 last:border-b-0 ${
                    index === activeIndex ? "bg-paper-deep" : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(result)}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-sm leading-snug">{result.name}</span>
                    <span className="label-sm mt-0.5 shrink-0 text-muted">
                      {result.planType === "direct" ? "Direct" : "Regular"}
                    </span>
                  </span>
                  <span className="mt-1 flex gap-2 text-[0.65rem] text-muted">
                    <span>Code {result.code}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{result.option}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
