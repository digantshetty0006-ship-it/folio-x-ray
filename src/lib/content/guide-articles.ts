export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string };

export type GuideArticle = {
  keyPoints: string[];
  blocks: GuideBlock[];
};

/**
 * Long-form guide copy. Links use a small, trusted inline syntax:
 * [label](/path). The renderer turns them into Next.js links.
 */
export const guideArticles: Record<string, GuideArticle> = {
  "what-xirr-actually-tells-you": {
    keyPoints: [
      "XIRR is an annualised rate that accounts for the date of every cash flow.",
      "It is not the same as absolute gain, and it is not a forecast.",
      "It describes the NAV path you held; taxes, exit loads and advice costs sit outside it.",
    ],
    blocks: [
      {
        type: "p",
        text: "A fund statement usually gives you two numbers: what you put in and what it is worth now. The difference is easy to read. It is also easy to misread. A gain of ₹50,000 on ₹2,00,000 sounds like a 25% return, but that sentence hides a question: when did the money go in? XIRR exists to answer that question.",
      },
      { type: "h2", text: "The question XIRR answers" },
      {
        type: "p",
        text: "XIRR stands for extended internal rate of return. It finds one annual rate that makes a series of dated cash flows balance out. Money you put into the fund is treated as a negative flow. The current value is treated as a positive flow. The calculation then searches for the rate at which the present value of all the flows is zero. In notation, it solves: the sum of each flow divided by (1 + rate) raised to the power of the number of days since the first flow divided by 365, equals zero.",
      },
      {
        type: "p",
        text: "The dates are the point. Money invested for two years is exposed to the fund for longer than money invested last month, so it carries more weight in the result. A simple percentage gain treats every rupee as if it arrived on the same day. XIRR does not.",
      },
      { type: "h2", text: "Why a simple return misleads" },
      {
        type: "p",
        text: "Take a hypothetical example. You invest ₹1,00,000 on 1 January 2023 and another ₹1,00,000 on 1 January 2024. On 1 January 2025 the holding is worth ₹2,50,000. The absolute gain is ₹50,000 on ₹2,00,000, or 25%. But the first ₹1,00,000 had two years to grow, while the second had one. The annualised rate that fits those dates is about 15.8%, not 25%. The 25% is a cumulative figure; XIRR spreads it over the time each rupee was actually invested.",
      },
      {
        type: "p",
        text: "This is not a trick of arithmetic. It is the difference between describing a total and describing a pace. Both can be useful. They answer different questions, and mixing them up makes comparisons unreliable.",
      },
      { type: "h2", text: "What the number includes" },
      {
        type: "p",
        text: "For a growth option, XIRR uses the NAV on each purchase date and the latest NAV for the current value. Because NAV is published after fund expenses are deducted, the result reflects the fund's expense ratio. It does not include an exit load, stamp duty, capital gains tax, advisory fees or platform charges unless those are entered as separate cash flows. A SIP entered without the exact dates of each instalment is an approximation, not a precise record.",
      },
      {
        type: "p",
        text: "XIRR also says nothing about risk, inflation or the benchmark. A 12% XIRR earned with large drawdowns is not the same experience as 12% earned with small ones. A 12% XIRR during a period when inflation was 7% is not the same real return as 12% when inflation was 3%. The number is a starting point for a conversation, not the whole conversation.",
      },
      { type: "h2", text: "Where XIRR stops being useful" },
      {
        type: "p",
        text: "Short periods are the first trap. A 5% gain in one month annualises to roughly 80% if you apply the same pace for a year. The arithmetic is correct; the conclusion is not. Annualising a few weeks of market noise produces a number that looks precise and means very little.",
      },
      {
        type: "p",
        text: "The second trap is comparison. Two funds can have the same NAV return over five years and different XIRRs for you, because your purchase dates and amounts differ. A large contribution made just before a rally can flatter one holding; an old contribution in a fund that has gone sideways can drag another. XIRR is a property of your cash flows, not a pure property of the fund.",
      },
      {
        type: "p",
        text: "Unusual cash-flow patterns can also produce more than one mathematical solution. Our solver returns a stable rate when it finds one and a plain-language reason when it does not. That honesty is more useful than a number produced by force.",
      },
      { type: "h2", text: "How Folio X-Ray calculates it" },
      {
        type: "p",
        text: "The tool uses each purchase or SIP instalment's actual NAV date and amount, then adds the current value at the latest available NAV. It tries Newton-Raphson first and falls back to bisection if the first method does not settle. If no consistent annual rate exists for the cash flows, it shows the reason instead of a misleading figure. Fund-level XIRR and portfolio-level XIRR are calculated separately, because combining cash flows changes the question being answered.",
      },
      {
        type: "p",
        text: "The full formula, tolerances and fallback behaviour are documented on [the method page](/method). The short version is that the tool does not smooth over missing dates or invent a result.",
      },
      { type: "h2", text: "A better reading" },
      {
        type: "p",
        text: "Read XIRR next to the absolute gain, the holding period, the benchmark and the size of the worst fall. Ask what the number includes and what it leaves out. A high XIRR on a small, recent holding is not the same achievement as a high XIRR on a large, long-held one.",
      },
      {
        type: "quote",
        text: "XIRR describes a path already travelled. It is not a map of the road ahead.",
      },
    ],
  },

  "regular-vs-direct-plans": {
    keyPoints: [
      "Direct and Regular plans usually own the same portfolio; the difference is the expense ratio and distribution.",
      "Fund expenses are deducted inside NAV, so a small annual gap compounds quietly.",
      "Switching plans can be a taxable event, and the right choice depends on service, cost and circumstances.",
    ],
    blocks: [
      {
        type: "p",
        text: "Two plans of the same mutual fund can hold exactly the same stocks and bonds. The portfolio manager makes the same calls. The statement looks almost identical. Yet the returns can differ, because one plan carries a distribution commission inside its annual expenses and the other does not.",
      },
      { type: "h2", text: "Same portfolio, different bill" },
      {
        type: "p",
        text: "A Direct plan is sold without a distributor commission. A Regular plan includes the distributor's commission, usually paid as a trail fee, inside the total expense ratio. Both plans pay the fund house for managing the scheme, and both pay for custody, audit, registrar and other operating costs. The difference is the distribution layer, not the investing layer.",
      },
      {
        type: "p",
        text: "The expense ratio is deducted from the scheme's assets before NAV is published. You do not receive a separate bill. That is why the cost is easy to miss: the NAV simply grows a little more slowly. The gap is disclosed, but it rarely appears in a headline return.",
      },
      { type: "h2", text: "How the gap compounds" },
      {
        type: "p",
        text: "Suppose a hypothetical holding is worth ₹10,00,000 today, the assumed gross return is 11% a year, and the annual expense gap is one percentage point. After ten years, the difference between 11% and 10% compounding on that base is about ₹2.46 lakh. After twenty years, it is about ₹13.35 lakh. These are arithmetic illustrations, not predictions. The actual gap can be smaller or larger, and the gross return is an assumption you choose.",
      },
      {
        type: "p",
        text: "The reason the later number is so much larger is that the expense is charged against a bigger corpus. A one-point difference sounds modest in year one. By year twenty, it has been applied to a balance that has had two decades to grow. The [cost-gap tool](/xray) lets you change both the return assumption and the gap so the arithmetic is visible rather than implied.",
      },
      { type: "h2", text: "What a Regular plan can include" },
      {
        type: "p",
        text: "A distributor may provide help with paperwork, fund selection, portfolio reviews and hand-holding during a fall. Some investors value that service; others prefer to pay a fee-only adviser separately, or to manage without one. A Regular plan is not automatically a bad deal, and a Direct plan is not automatically a good one. Direct plans still have fund expenses, platform charges and the cost of your own time.",
      },
      {
        type: "p",
        text: "The useful question is not which label sounds better. It is what the service is worth to the person paying for it, and whether the same service could be bought more transparently another way. That is a personal judgement, not a rule.",
      },
      { type: "h2", text: "The switch question" },
      {
        type: "p",
        text: "Moving from a Regular plan to a Direct plan usually means redeeming the Regular units and buying Direct units. In a taxable account, that redemption is a sale for capital gains purposes. Exit load may also apply if the units are recent. The break-even period depends on the size of the expense gap, the tax rate, the exit load and how long the money stays invested. A simple comparison that ignores those costs can overstate the benefit.",
      },
      {
        type: "p",
        text: "The mechanics also differ by platform and AMC. Some allow a switch instruction; others require a redemption and a fresh purchase. Tax rules change, and individual circumstances vary. A tool can show the arithmetic of a cost gap. It cannot decide whether a switch is appropriate for a particular person.",
      },
      { type: "h2", text: "How to see your own gap" },
      {
        type: "p",
        text: "Start with the plan name on the statement. It usually contains the word Direct or Regular. Then look at the total expense ratio in the factsheet or the AMC's disclosure. Compare like with like: the same scheme, the same option and the same date. A Regular plan's expense ratio is not directly comparable to a different fund's Direct plan.",
      },
      {
        type: "p",
        text: "Folio X-Ray reads the plan type from the scheme name and applies the cost illustration only to holdings marked Regular. It does not fetch your actual expense ratio or claim that the gap is one percentage point. You set the gap. That design choice is deliberate: the tool illustrates a range of outcomes, not a billed fact. The [method page](/method) explains the formula.",
      },
      { type: "h2", text: "The honest summary" },
      {
        type: "p",
        text: "Direct plans usually cost less. Regular plans may bundle a service. Neither guarantees a better investment result, because the portfolio is the same and the market does not care which plan you bought. Cost is one variable among several, and it deserves to be seen clearly rather than argued about in slogans.",
      },
    ],
  },

  "four-large-cap-funds": {
    keyPoints: [
      "The number of funds is not the same as the number of independent bets.",
      "Large-cap funds often own the same large companies and follow similar benchmarks.",
      "Overlap can leave a portfolio with one dominant style and several expense ratios.",
    ],
    blocks: [
      {
        type: "p",
        text: "A statement with four large-cap funds looks diversified. Four names, four fund houses, four factsheets. But look through the labels to the holdings and a different picture can appear: the same handful of large companies, the same sector weights, the same benchmark. The portfolio may behave like one large-cap fund with extra paperwork.",
      },
      { type: "h2", text: "The illusion of four" },
      {
        type: "p",
        text: "Suppose four funds each hold 8% of their assets in the same large company. If you hold equal amounts in all four, that company is about 8% of your portfolio, not 32%. The overlap does not multiply your exposure to the stock. What it does multiply is the number of places where the same bet appears, and the number of expense ratios you pay to make it.",
      },
      {
        type: "p",
        text: "The more important loss is variety. If all four funds own the same top ten companies and carry similar sector weights, your portfolio has fewer independent bets than the fund count suggests. A shock to large-cap financials or to a handful of index heavyweights reaches all four at once.",
      },
      { type: "h2", text: "Why large-cap funds converge" },
      {
        type: "p",
        text: "The large-cap universe is deliberately narrow. Category rules require large-cap funds to keep most of their assets in the largest listed companies. The benchmark is usually a broad large-cap index. Within that sandbox, managers can differ on timing, position sizes and minor names, but the menu is limited. Many funds end up owning the same market leaders because those companies dominate the index.",
      },
      {
        type: "p",
        text: "This is not a scandal. It is a structural feature of the category. A fund that looks very different from its peers may be taking style risk outside the label, which is its own kind of concentration. The point is to know which bet you own, not to assume that a different cover changes the contents.",
      },
      { type: "h2", text: "What overlap does and does not do" },
      {
        type: "p",
        text: "Overlap reduces the number of distinct bets. It can make returns cluster, add complexity, and create the feeling of diversification without the substance. It does not automatically increase stock-level concentration, because weights still matter. It does not automatically produce bad returns. And it does not mean every multi-fund portfolio is wrong; some investors hold several funds for manager or process diversification, even when the holdings look similar.",
      },
      {
        type: "p",
        text: "It helps to separate two ideas. Fund overlap is the share of assets that two funds hold in common. Portfolio concentration is the weight of a single stock, sector or category in your total money. A portfolio can have high overlap and modest single-stock concentration, or low overlap and a large bet in one theme. Both are worth inspecting.",
      },
      { type: "h2", text: "How to inspect overlap" },
      {
        type: "p",
        text: "The factsheet is the practical starting point. Look at the top ten holdings, the sector weights and the market-cap split. Then compare the same pages for the other funds you own. A simple table of common names and weights will tell you more than a fund's star rating. Monthly portfolio disclosures and the scheme information document add detail.",
      },
      {
        type: "p",
        text: "Ask what the second, third and fourth funds add. If the answer is a slightly different weight in the same ten companies, the portfolio has one large-cap bet. If the answer is a different market-cap segment, sector or style, the funds may be doing different work. Neither answer is a verdict. The purpose is to name the exposure.",
      },
      { type: "h2", text: "What the X-Ray flags" },
      {
        type: "p",
        text: "Folio X-Ray cannot see the stocks inside a fund, because the public data source provides NAV history rather than portfolio holdings. What it can see is category duplication. When three or more holdings share a category, it adds a note. When one category is at least 80% of the portfolio, or one fund is at least 35%, it raises a concentration flag. These thresholds are described on [the method page](/method).",
      },
      {
        type: "p",
        text: "Those flags are observations, not instructions. They say where the portfolio is concentrated by label. They cannot say whether two funds own the same companies. For that, the factsheet is still the source. The tool is a prompt to look, not a substitute for looking.",
      },
      { type: "h2", text: "A better question" },
      {
        type: "p",
        text: "Instead of asking how many funds you own, ask what different exposures you own. If four funds all own the same large companies, the portfolio has one large-cap bet. That may be exactly what was intended. The risk is holding it by accident and calling it diversification.",
      },
      {
        type: "quote",
        text: "Four names on a statement are not four ideas. The holdings decide how many ideas you actually own.",
      },
    ],
  },

  "sip-vs-lump-sum": {
    keyPoints: [
      "A SIP is a schedule; a lump sum is a single deployment. The price path decides which looks better.",
      "Rising markets tend to reward earlier investment; falling-then-recovering markets can reward staggered buying.",
      "Cash flow, horizon and the ability to stay invested matter more than a universal rule.",
    ],
    blocks: [
      {
        type: "p",
        text: "The SIP versus lump-sum argument is usually conducted with confidence and very little context. One side points to a backtest where investing early wins. The other points to a crash that would have been easier to survive with monthly purchases. Both can be right, because the answer depends on the path prices take and on the person doing the investing.",
      },
      { type: "h2", text: "The arithmetic" },
      {
        type: "p",
        text: "A lump sum buys units once. A SIP buys units at intervals, so the average purchase price is a blend of the prices along the way. If prices rise steadily, the lump sum owns more units bought at the lowest price. If prices fall and then recover, the SIP buys more units during the cheap period.",
      },
      {
        type: "p",
        text: "A hypothetical example makes the trade-off visible. You have ₹1,20,000 and two price paths. In the first, the NAV rises from 100 to 111 over twelve months. Investing all at the start produces about ₹1,33,200; investing ₹10,000 a month produces about ₹1,26,391. In the second path, the NAV falls from 100 to 50 and recovers to 110. The lump sum ends at about ₹1,32,000; the monthly plan ends at about ₹1,74,040. Costs and taxes are ignored. The results are arithmetic, not a recommendation.",
      },
      {
        type: "p",
        text: "The example shows why the argument has no permanent winner. The same method can look clever or foolish depending on the order of returns. Real markets are neither of these clean paths, and no one knows the next one in advance.",
      },
      { type: "h2", text: "What a SIP does well" },
      {
        type: "p",
        text: "A SIP matches a regular salary. It turns investing into a routine, reduces the number of timing decisions, and keeps money moving into the market when prices are uncomfortable. For many people, that behavioural advantage is the main benefit. It is also the part that is hardest to measure in a backtest.",
      },
      {
        type: "p",
        text: "A SIP does not remove risk. A monthly purchase into a falling fund can still lose money. It can also stop at the worst moment if the payments are paused during a job loss or a market fall. The method spreads entry prices; it does not guarantee a profit or protect against a bad choice of fund.",
      },
      { type: "h2", text: "What a lump sum does well" },
      {
        type: "p",
        text: "A lump sum puts the money to work immediately. It is simpler, involves fewer transactions, and avoids holding cash that is waiting to be invested. If the money is already available and the horizon is long, investing early has historically captured more market days. That is an observation about markets in general, not a promise about the next period.",
      },
      {
        type: "p",
        text: "The cost is immediate exposure. A large fall soon after a lump sum can be difficult to sit through, and the regret is vivid. A lump sum also assumes the money is genuinely available and not needed for an emergency, a debt repayment or a near-term goal. Those questions come before the timing debate.",
      },
      { type: "h2", text: "The cash-flow question" },
      {
        type: "p",
        text: "Most people do not have a large lump sum to deploy. They have a monthly salary, which makes a SIP the natural shape of the decision. The real choice appears when a bonus, inheritance or business sale produces a lump sum. Even then, the options are not limited to all-at-once or twelve equal instalments. A staged approach is a compromise: it reduces the regret of investing just before a fall, but it can reduce the return if prices rise while the cash waits.",
      },
      {
        type: "p",
        text: "The more useful questions are about cash flow and staying power. Is there an emergency fund? Is high-interest debt being carried? When is the money needed? A market investment with a three-month horizon is not made safer by choosing a SIP. The schedule cannot fix a mismatch between the goal and the asset.",
      },
      { type: "h2", text: "What backtests can and cannot say" },
      {
        type: "p",
        text: "Backtests are sensitive to their start and end dates, the market studied, the costs and taxes assumed, and whether the lump sum was actually available on day one. A period that flatters one method can be reversed by moving the window a few years. Survivorship and data mining make the problem worse. A backtest can illustrate a mechanism; it cannot tell you which method will win from here.",
      },
      {
        type: "p",
        text: "The practical question is not which method wins in a spreadsheet. It is which method a person can follow through a full cycle without abandoning the plan at the bottom. That is a question about behaviour as much as arithmetic.",
      },
      { type: "h2", text: "How the X-Ray treats it" },
      {
        type: "p",
        text: "The tool accepts either shape. Enter units and a purchase date for a lump sum, or a SIP amount, start date and frequency for a schedule. XIRR then accounts for the timing of each cash flow. The Monte Carlo panel projects a monthly SIP with an optional annual step-up and reports a range of outcomes, not a single promised number. The assumptions are visible on [the method page](/method).",
      },
      {
        type: "quote",
        text: "SIP or lump sum is a question about cash flow and temperament before it is a question about market timing.",
      },
    ],
  },

  "read-your-risk-profile": {
    keyPoints: [
      "Risk tolerance is willingness to endure losses; risk capacity is the ability to absorb them.",
      "A questionnaire is a mirror, not a label or a recommendation.",
      "The useful test is how you would behave in a real drawdown, not the score alone.",
    ],
    blocks: [
      {
        type: "p",
        text: "Risk questionnaires are everywhere: before a fund purchase, inside an app, at the start of a financial plan. They usually end with a label such as conservative, moderate or aggressive. The label feels official. It is not. It is a summary of answers given on one day, and it can hide more than it reveals.",
      },
      { type: "h2", text: "Three different things" },
      {
        type: "p",
        text: "Risk tolerance is the willingness to endure losses without abandoning a plan. Risk capacity is the financial ability to absorb those losses. They are not the same. A young investor with a stable income and a long horizon may have high capacity but low tolerance. An older investor with a large portfolio and a short horizon may have high tolerance but limited capacity.",
      },
      {
        type: "p",
        text: "There is also the need to take risk: the return required to meet a goal after inflation and taxes. Sometimes the need is higher than the capacity. That is a planning problem, not a licence to take more risk. A questionnaire that only measures willingness can miss the constraint that matters most.",
      },
      { type: "h2", text: "Why a score can mislead" },
      {
        type: "p",
        text: "Imagine two people who both answer aggressively. The first has a twenty-year horizon, a stable job, an emergency fund and no dependants. The second is freelance, has a goal three years away and is investing most of their savings. The score is the same; the capacity is not. A label that ignores the difference is a poor guide to anything.",
      },
      {
        type: "p",
        text: "Answers can also be aspirational. People often say they would hold through a fall because that is the admirable answer, not because they have tested it. A score taken in a calm market is a statement of intent. A real drawdown is the test.",
      },
      { type: "h2", text: "The questions worth asking" },
      {
        type: "p",
        text: "Start with behaviour. If the portfolio fell 30% and stayed down for two years, what would you actually do: sell, hold, or add? What would you regret most? If the answer is that you would sell to stop the pain, the portfolio may be too aggressive for your temperament, whatever the questionnaire says.",
      },
      {
        type: "p",
        text: "Then look at the money. When is it needed? What else could cover that goal? How much of your savings is in this portfolio? Is there an emergency fund, insurance or high-interest debt? These questions are less exciting than a risk score, but they describe the floor beneath the plan.",
      },
      {
        type: "p",
        text: "Finally, check the return assumption. A goal that requires 15% a year is making a demand on the market, not a plan. The gap between the required return and a reasonable long-term assumption is a planning gap. Taking more risk may widen the range of outcomes without improving the odds of the specific goal.",
      },
      { type: "h2", text: "Behavioural traps" },
      {
        type: "p",
        text: "Loss aversion makes a loss hurt more than an equivalent gain feels good. Recency makes the last two years feel like the permanent weather. Overconfidence makes timing feel easier than it is. Herding makes the crowd's latest favourite look safer than it is. Anchoring keeps attention on the purchase price rather than the current facts.",
      },
      {
        type: "p",
        text: "A questionnaire cannot remove these tendencies. A written plan can help: decide in advance what you will do in a fall, how often you will review, and what evidence would change your mind. The plan is more useful than the label because it is specific enough to follow when the screen is red.",
      },
      { type: "h2", text: "How to use the X-Ray risk mirror" },
      {
        type: "p",
        text: "The X-Ray asks three questions: when you expect to need the money, the largest temporary fall you could hold through without selling, and how much of your investable savings the portfolio represents. It does not score you or put you in a band. It compares your answers with the portfolio's current equity, debt and other shares.",
      },
      {
        type: "p",
        text: "Where the answers and the mix may be in tension, the tool says so in plain language. A short horizon and a meaningful equity share is one example. A low tolerance and a meaningful equity share is another. The mirror does not recommend an allocation, and a quiet result does not make the mix suitable. It only means those three answers did not produce a sharp mismatch. The thresholds are on [the method page](/method).",
      },
      { type: "h2", text: "Revisit the answer" },
      {
        type: "p",
        text: "Risk profiles change. A new job, a dependent, a home loan, a health event or a few years of experience can all shift the balance between willingness and capacity. Revisiting the questionnaire once a year, or after a large life change, is more useful than treating an old label as a permanent identity.",
      },
      {
        type: "quote",
        text: "The best risk profile is the one you can live with when the screen is red.",
      },
    ],
  },

  "mutual-fund-factsheet": {
    keyPoints: [
      "A factsheet is a dated snapshot with a marketing layer; read it in a fixed order.",
      "Expense ratio, holdings, turnover and benchmark explain more than a trailing return.",
      "A high return can hide concentration, trading or a flattering comparison period.",
    ],
    blocks: [
      {
        type: "p",
        text: "A mutual fund factsheet is designed to be read quickly. It has a large return number, a colourful chart and a short commentary. The details that matter most are often smaller: the expense ratio, the top holdings, the turnover ratio and the benchmark. Reading in a fixed order makes those details harder to skip.",
      },
      { type: "h2", text: "Start with identity, not returns" },
      {
        type: "p",
        text: "Before the performance chart, check what the document is describing. The scheme name usually includes the plan and option: Direct or Regular, Growth or IDCW. The benchmark, launch date, fund manager tenure and assets under management are on the same page. A fund with a new manager and a short record is a different proposition from one with a long, stable team, even if both carry the same category label.",
      },
      {
        type: "p",
        text: "A very small fund can face viability questions; a very large fund can find some strategies harder to run. Neither size is automatically good or bad. The riskometer gives a headline risk level, but the scheme information document contains the actual mandate and the limits the manager works within.",
      },
      { type: "h2", text: "The expense ratio" },
      {
        type: "p",
        text: "The total expense ratio is deducted from the scheme's assets before NAV is published. It is not a separate line on your statement. Compare the Direct and Regular versions of the same scheme, and compare similar funds on the same date. A difference of a few tenths of a percentage point compounds over long periods, especially on a large corpus.",
      },
      {
        type: "p",
        text: "Also look for the exit load, particularly if the holding is recent, and for stamp duty on purchases. A lower expense ratio is not a guarantee of a better net return, because the fund's gross performance and trading costs also matter. But a high expense ratio needs a clearer explanation than a low one.",
      },
      { type: "h2", text: "The holdings page" },
      {
        type: "p",
        text: "The top ten holdings and sector weights tell you what the fund actually owns. A fund with 60% in its top ten is making larger single-stock bets than one with 30%. A fund with half its assets in one sector is making a sector bet, whether or not the label says so. The number of stocks, the cash level and the market-cap split add context.",
      },
      {
        type: "p",
        text: "Holdings are disclosed periodically, not every day. The factsheet may be a month or more old, and the manager may have changed positions since. That lag is normal. It still makes the holdings page more informative than a star rating, which is a summary of past returns.",
      },
      { type: "h2", text: "Turnover" },
      {
        type: "p",
        text: "The portfolio turnover ratio shows how much the manager trades relative to the fund's size. High turnover can mean higher transaction costs and, in some structures, more realised gains passed to investors. It can also be part of a deliberate strategy. Low turnover is not automatically better; a passive or buy-and-hold mandate should have low turnover, while an active strategy may legitimately trade more.",
      },
      {
        type: "p",
        text: "The useful question is whether the turnover fits the stated process. A fund that describes itself as long-term but replaces most of its portfolio every year is telling two different stories.",
      },
      { type: "h2", text: "Performance, read carefully" },
      {
        type: "p",
        text: "Trailing returns for one, three, five and ten years are date-dependent. A fund can look excellent because of its start date, a lucky sector bet or a benchmark that changed. Compare the fund with its stated benchmark over the same period, and check whether the benchmark itself is a fair comparison.",
      },
      {
        type: "p",
        text: "Risk-adjusted measures add context. Standard deviation describes how much the return bounced around; the Sharpe ratio compares excess return with that volatility; maximum drawdown shows the worst peak-to-trough fall in the period. A higher return with a much larger drawdown may not be a better experience. Since-inception figures can be flattered by a small early asset base or a favourable starting point.",
      },
      {
        type: "p",
        text: "Past performance is not a forecast. The factsheet cannot show how the fund will behave in the next crisis, and it cannot know your purchase price, holding period or tax situation.",
      },
      { type: "h2", text: "What the factsheet leaves out" },
      {
        type: "p",
        text: "It does not show your actual XIRR, your exit load or your capital gains. It does not show how the fund overlaps with the other funds you own, unless you compare the holdings pages yourself. It is a calm-weather report: useful, but not a stress test.",
      },
      {
        type: "p",
        text: "A hypothetical comparison shows why the return alone is not enough. Two funds both report 12% over five years. One holds 25 stocks with 40% in its top ten and turns over 80% of the portfolio each year. The other holds 60 stocks with 25% in its top ten and turns over 20%. The headline is identical; the bets, costs and tax consequences are not.",
      },
      { type: "h2", text: "A reading order" },
      {
        type: "ol",
        items: [
          "Identity: plan, option, category, benchmark, manager tenure and AUM.",
          "Cost: expense ratio, exit load and any other charges.",
          "Holdings: top ten, sector weights, number of stocks and cash level.",
          "Turnover: does the trading match the stated process?",
          "Performance: trailing and risk-adjusted returns against the right benchmark.",
          "Mandate: riskometer and scheme information document.",
          "Your portfolio: overlap, concentration and the cost you actually pay.",
        ],
      },
      {
        type: "p",
        text: "The factsheet is a starting point, not a verdict. It is most useful when read next to your own statement and the [X-Ray report](/xray), where the fund's behaviour becomes part of a portfolio rather than a standalone story.",
      },
      {
        type: "quote",
        text: "The useful parts of a factsheet are often the least colourful. Read them first.",
      },
    ],
  },
};

export function getGuideArticle(slug: string): GuideArticle | undefined {
  return guideArticles[slug];
}
