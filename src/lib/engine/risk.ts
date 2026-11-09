import { riskMirror } from "@/lib/config";
import type {
  AllocationSlice,
  RiskAllocation,
  RiskMirrorResult,
} from "./types";
import type {
  RiskAnswerValue,
  RiskQuestionId,
} from "@/lib/content/risk-questions";

const allowedAnswers: Record<RiskQuestionId, readonly RiskAnswerValue[]> = {
  horizon: ["short", "medium", "long"],
  tolerance: ["low", "medium", "high"],
  share: ["low", "medium", "high"],
};

const questionIds: RiskQuestionId[] = ["horizon", "tolerance", "share"];

function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function readRiskMirror(
  answers: Partial<Record<RiskQuestionId, RiskAnswerValue>>,
  byCategory: AllocationSlice[],
): RiskMirrorResult {
  for (const id of questionIds) {
    const answer = answers[id];
    if (!answer || !allowedAnswers[id].includes(answer)) {
      return {
        ok: false,
        reason: "Answer all three questions to see the mirror.",
      };
    }
  }

  const horizon = answers.horizon as RiskAnswerValue;
  const tolerance = answers.tolerance as RiskAnswerValue;
  const share = answers.share as RiskAnswerValue;

  const current: RiskAllocation = { equity: 0, debt: 0, other: 0 };
  for (const slice of byCategory) {
    if (slice.key === "equity") current.equity += slice.pct;
    else if (slice.key === "debt") current.debt += slice.pct;
    else current.other += slice.pct;
  }

  const equityIsMeaningful =
    current.equity > riskMirror.equityMeaningfulAbovePct;
  const equityIsHeavy = current.equity >= riskMirror.equityHeavyAtPct;
  const shortHorizon = horizon === "short";
  const longHorizon = horizon === "long";
  const lowTolerance = tolerance === "low";
  const highTolerance = tolerance === "high";
  const highShare = share === "high";
  const lowShare = share === "low";

  let headline: string;
  const notes: string[] = [];
  const used = new Set<string>();

  function addNote(key: string, text: string) {
    if (used.has(key) || notes.length >= 3) return;
    used.add(key);
    notes.push(text);
  }

  if (shortHorizon && equityIsMeaningful) {
    headline = "Your horizon is shorter than your equity exposure.";
    addNote(
      "horizon",
      `You expect to use this money within three years, and ${formatPct(current.equity)} of the portfolio is in equity. A short horizon leaves less time for a fall to recover before the money is needed.`,
    );
  } else if (lowTolerance && equityIsMeaningful) {
    headline = "The fall you described is smaller than the equity share can produce.";
    addNote(
      "tolerance",
      `You said you could hold through a temporary fall of up to 10%, and ${formatPct(current.equity)} of the portfolio is in equity. Equity falls can be deeper and can last longer than a year.`,
    );
  } else if (equityIsHeavy && highShare) {
    headline = "Most of your investable savings are in this portfolio.";
    addNote(
      "share",
      `${formatPct(current.equity)} of the portfolio is in equity, and you said this portfolio is more than 75% of your investable savings. A deep equity fall would reach most of what you have invested.`,
    );
  } else if (longHorizon && highTolerance && !equityIsMeaningful) {
    headline = "Your answers allow more movement than your mix currently takes.";
    addNote(
      "long-tolerance",
      `You described a horizon of more than seven years and a tolerance for falls of 40% or more, while ${formatPct(current.equity)} of the portfolio is in equity. That may be deliberate. If it is not, the gap is worth examining.`,
    );
  } else if (!equityIsMeaningful && (shortHorizon || lowTolerance)) {
    headline = "Your answers and your mix point in the same cautious direction.";
    addNote(
      "cautious",
      `${formatPct(current.equity)} of the portfolio is in equity, and your answers describe a shorter horizon or a smaller tolerable fall. The mirror shows little tension on those two measures.`,
    );
    used.add("horizon");
    used.add("tolerance");
  } else {
    headline = "Your answers and your mix do not show a single obvious tension.";
    addNote(
      "mix",
      `Your portfolio is ${formatPct(current.equity)} equity, ${formatPct(current.debt)} debt and ${formatPct(current.other)} other. The three answers do not point to one clear mismatch, which does not make the mix suitable; it means the mirror has nothing sharp to reflect.`,
    );
  }

  if (highShare) {
    addNote(
      "share",
      "You said this portfolio is more than 75% of your investable savings. A fall here would reach most of what you have invested, not a small satellite.",
    );
  }
  if (shortHorizon) {
    addNote(
      "horizon",
      "You expect to use the money within three years. A short horizon leaves less time for a fall to recover, whatever the current mix.",
    );
  }
  if (lowTolerance) {
    addNote(
      "tolerance",
      "You said you could hold through a temporary fall of up to 10%. That is a useful constraint to test against the equity share you hold.",
    );
  }
  if (longHorizon && highTolerance && equityIsMeaningful) {
    addNote(
      "long-tolerance",
      "Your answers describe a long horizon and a high tolerance for falls. The equity share is the part of the mix that would test that tolerance in a real market.",
    );
  }
  if (lowShare) {
    addNote(
      "low-share",
      "This portfolio is less than 25% of your investable savings. Other savings can change how much a fall here matters, and the mirror cannot see them.",
    );
  }

  return { ok: true, current, headline, notes };
}
