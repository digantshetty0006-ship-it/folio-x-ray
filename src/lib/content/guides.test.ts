import { describe, expect, it } from "vitest";
import { guideMeta } from "./guides";
import { guideArticles } from "./guide-articles";

function blockText(block: (typeof guideArticles)[string]["blocks"][number]): string {
  if ("items" in block) return block.items.join(" ");
  return block.text;
}

function articleText(slug: string): string {
  const article = guideArticles[slug];
  if (!article) return "";
  return [article.keyPoints.join(" "), ...article.blocks.map(blockText)]
    .join(" ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

describe("guide articles", () => {
  it("has an article for every guide in the index", () => {
    for (const guide of guideMeta) {
      expect(guideArticles[guide.slug], guide.slug).toBeDefined();
    }
  });

  it("keeps every guide between 700 and 1,100 words", () => {
    for (const guide of guideMeta) {
      const count = wordCount(articleText(guide.slug));
      expect(count, `${guide.slug}: ${count} words`).toBeGreaterThanOrEqual(700);
      expect(count, `${guide.slug}: ${count} words`).toBeLessThanOrEqual(1_100);
    }
  });

  it("does not use banned marketing or advice language", () => {
    const banned = [
      "guaranteed",
      "risk-free",
      "multibagger",
      "seamless",
      "game-changer",
      "skyrocket",
      "effortless",
      "revolutionary",
      "no-brainer",
      "sure thing",
      "double your money",
      "financial freedom",
      "you should buy",
      "you should sell",
      "we recommend",
      "best fund",
    ];

    for (const guide of guideMeta) {
      const text = articleText(guide.slug).toLowerCase();
      for (const phrase of banned) {
        expect(text, `${guide.slug} contains "${phrase}"`).not.toContain(phrase);
      }
    }
  });

  it("uses the guide's own title and dek without duplicating them in the body", () => {
    for (const guide of guideMeta) {
      const text = articleText(guide.slug).toLowerCase();
      expect(text).not.toContain(guide.title.toLowerCase());
      expect(text).not.toContain(guide.dek.toLowerCase());
    }
  });
});
