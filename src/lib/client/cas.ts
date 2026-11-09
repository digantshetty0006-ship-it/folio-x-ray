const SCHEME_CODE_PATTERNS = [
  /(?:amfi|scheme)\s*(?:code)?\s*[:\-]?\s*(\d{6})\b/gi,
  /^\s*(\d{6})\s+[A-Za-z]/gm,
];

/**
 * CAS PDFs usually identify funds by name and ISIN, not by AMFI scheme code.
 * We only look for six-digit codes in the extracted text, because sending fund
 * names to a server would break the privacy model. If none are present, the UI
 * falls back to manual entry.
 */
export function extractSchemeCodes(text: string): number[] {
  const found = new Set<number>();
  for (const pattern of SCHEME_CODE_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      const code = Number(match[1]);
      if (Number.isInteger(code) && code > 0) found.add(code);
    }
  }
  return [...found].slice(0, 12);
}

export function normalisePdfText(text: string): string {
  return text
    .replace(/\u00a0/g, " ")
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .trim();
}
