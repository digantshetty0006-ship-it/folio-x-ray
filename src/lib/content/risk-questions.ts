export type RiskQuestionId = "horizon" | "tolerance" | "share";

export type RiskAnswerValue = "short" | "medium" | "long" | "low" | "high";

export type RiskQuestion = {
  id: RiskQuestionId;
  prompt: string;
  help: string;
  options: Array<{ label: string; value: RiskAnswerValue }>;
};

export const riskQuestions: RiskQuestion[] = [
  {
    id: "horizon",
    prompt: "When do you expect to need this money?",
    help: "Use the date you expect to spend it, not the date you plan to review the portfolio.",
    options: [
      { label: "Within three years", value: "short" },
      { label: "Three to seven years", value: "medium" },
      { label: "More than seven years", value: "long" },
    ],
  },
  {
    id: "tolerance",
    prompt: "What is the largest temporary fall you could hold through without selling?",
    help: "Temporary means the portfolio later recovers. Think of the largest fall you have actually sat through, not the one you imagine.",
    options: [
      { label: "A fall of up to 10%", value: "low" },
      { label: "A fall of up to 25%", value: "medium" },
      { label: "A fall of 40% or more", value: "high" },
    ],
  },
  {
    id: "share",
    prompt: "How much of your investable savings is in this portfolio?",
    help: "Count financial investments. Leave out the home you live in and any emergency fund you would not invest.",
    options: [
      { label: "Less than 25%", value: "low" },
      { label: "25% to 75%", value: "medium" },
      { label: "More than 75%", value: "high" },
    ],
  },
];
