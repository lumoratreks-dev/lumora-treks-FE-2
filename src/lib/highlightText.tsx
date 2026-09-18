import type { ReactNode } from "react";

/**
 * Several CMS blocks pair a heading/description field with a companion
 * `*_highlight` field naming a phrase inside it to accent (see
 * `apps/cms/blocks/sections.py` — `IntroStatsBlock.highlight`,
 * `*.description_highlight`, etc.). Wraps the first occurrence of
 * `highlight` inside `text` in `className`; falls back to plain text if
 * `highlight` is empty or isn't actually a substring, so a CMS edit can
 * never silently drop content.
 */
export function withHighlight(
  text: string,
  highlight: string | undefined | null,
  className: string,
): ReactNode {
  if (!highlight) return text;
  const index = text.indexOf(highlight);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <span className={className}>{highlight}</span>
      {text.slice(index + highlight.length)}
    </>
  );
}
