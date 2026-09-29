"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/** Collapses long editorial text (descriptions without a CMS length limit) to
 * `collapsedHeight` px with a fade and a "Show more" toggle. The clamp applies
 * from the first render, so there is no layout jump on hydration; the toggle
 * only appears when the content is actually taller. The full text stays in the
 * DOM for search engines and screen readers. */
export default function ShowMore({
  children,
  collapsedHeight = 208,
  className,
}: {
  children: ReactNode;
  collapsedHeight?: number;
  className?: string;
}) {
  const id = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const measure = () => setOverflows(content.scrollHeight > collapsedHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [collapsedHeight]);

  return (
    <div className={className}>
      <div
        id={id}
        className="relative overflow-hidden"
        style={expanded ? undefined : { maxHeight: collapsedHeight }}
      >
        <div ref={contentRef}>{children}</div>
        {overflows && !expanded && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent"
          />
        )}
      </div>
      {overflows && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((open) => !open)}
          className="mt-3 font-body-alt text-base font-semibold text-primary-active underline underline-offset-4"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
