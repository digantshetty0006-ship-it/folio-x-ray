export type GuideMeta = {
  slug: string;
  number: string;
  title: string;
  dek: string;
  description: string;
  topic: string;
  reviewed: string;
  readMinutes: number;
};

export const guideMeta: GuideMeta[] = [
  {
    slug: "what-xirr-actually-tells-you",
    number: "01",
    title: "What XIRR actually tells you",
    dek: "A single number can be useful. It can also hide a messy story. Here is what the number includes, and what it cannot know.",
    description:
      "A plain-language guide to XIRR for mutual fund investors: what the calculation does, why timing matters and where it stops being useful.",
    topic: "Returns",
    reviewed: "2026-11-07",
    readMinutes: 6,
  },
  {
    slug: "regular-vs-direct-plans",
    number: "02",
    title: "Regular and Direct are not the same fund",
    dek: "The portfolio inside can be identical. The annual bill usually is not. A careful look at the gap, without the sales pitch.",
    description:
      "Understand the difference between Regular and Direct mutual fund plans, how commissions and expense ratios work, and how to read the cost gap.",
    topic: "Costs",
    reviewed: "2026-11-07",
    readMinutes: 7,
  },
  {
    slug: "four-large-cap-funds",
    number: "03",
    title: "Four large-cap funds are basically one fund",
    dek: "Different names on the statement do not always mean different bets. How overlap quietly concentrates a portfolio.",
    description:
      "Why holding several large-cap mutual funds can concentrate rather than diversify a portfolio, and how to inspect overlap.",
    topic: "Portfolio",
    reviewed: "2026-11-07",
    readMinutes: 6,
  },
  {
    slug: "sip-vs-lump-sum",
    number: "04",
    title: "SIP vs lump sum, without the hype",
    dek: "Neither method wins every time. The honest answer depends on cash flow, behaviour and the price path you happen to get.",
    description:
      "A factual comparison of SIP and lump-sum investing in Indian mutual funds, including timing risk, cash-flow reality and what the data can show.",
    topic: "Investing",
    reviewed: "2026-11-07",
    readMinutes: 7,
  },
  {
    slug: "read-your-risk-profile",
    number: "05",
    title: "How to read your own risk profile",
    dek: "A questionnaire is a mirror, not a label. Use it to notice how you think about losses, time and uncertainty.",
    description:
      "How to think about risk tolerance, capacity and behaviour, and how to read a mutual fund risk questionnaire without outsourcing the decision.",
    topic: "Risk",
    reviewed: "2026-11-07",
    readMinutes: 6,
  },
  {
    slug: "mutual-fund-factsheet",
    number: "06",
    title: "What a mutual fund factsheet hides in plain sight",
    dek: "The useful parts are often the least colourful. A reading order for expense ratios, holdings, turnover and benchmark choices.",
    description:
      "A practical guide to reading a mutual fund factsheet: expense ratio, portfolio holdings, turnover, benchmark and other details that matter.",
    topic: "Research",
    reviewed: "2026-11-07",
    readMinutes: 8,
  },
];

export function getGuideMeta(slug: string): GuideMeta | undefined {
  return guideMeta.find((guide) => guide.slug === slug);
}
