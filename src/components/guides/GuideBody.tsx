import Link from "next/link";
import type { ReactNode } from "react";
import type { GuideBlock } from "@/lib/content/guide-articles";

const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = new RegExp(linkPattern.source, "g");
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(
      <Link key={`${match.index}-${match[2]}`} href={match[2]}>
        {match[1]}
      </Link>,
    );
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function getGuideHeadings(
  blocks: GuideBlock[],
): Array<{ id: string; text: string }> {
  return blocks
    .filter((block): block is Extract<GuideBlock, { type: "h2" }> => block.type === "h2")
    .map((block) => ({ id: headingId(block.text), text: block.text }));
}

export function GuideBody({ blocks }: { blocks: GuideBlock[] }) {
  return (
    <div className="prose-editorial">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "p":
            return <p key={index}>{renderInline(block.text)}</p>;
          case "h2":
            return (
              <h2 key={index} id={headingId(block.text)} className="scroll-mt-28">
                {renderInline(block.text)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={index} id={headingId(block.text)} className="scroll-mt-28">
                {renderInline(block.text)}
              </h3>
            );
          case "ul":
            return (
              <ul key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          case "quote":
            return <blockquote key={index}>{renderInline(block.text)}</blockquote>;
        }
      })}
    </div>
  );
}
