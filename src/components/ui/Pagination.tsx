"use client";

import { Icon } from "@iconify/react";
import clsx from "clsx";

/** Pagination — `‹ 1 2 3 ›`. Controlled: parent owns `page`. Figma 84:1254. */
type PaginationProps = {
  page: number;
  pages: number;
  onChange: (page: number) => void;
  className?: string;
};

export default function Pagination({
  page,
  pages,
  onChange,
  className,
}: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <div className={clsx("flex items-center justify-center gap-4", className)}>
      <button
        type="button"
        aria-label="Previous page"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="text-foreground transition-opacity disabled:opacity-40"
      >
        <Icon icon="iconoir:nav-arrow-left" className="size-6" />
      </button>

      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={page === n ? "page" : undefined}
          className={clsx(
            "flex size-10 items-center justify-center rounded-lg border text-lg transition-colors",
            page === n
              ? "border-foreground bg-background font-semibold text-foreground"
              : "border-border font-medium text-text-secondary hover:border-foreground/40",
          )}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        aria-label="Next page"
        onClick={() => onChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        className="text-foreground transition-opacity disabled:opacity-40"
      >
        <Icon icon="iconoir:nav-arrow-right" className="size-6" />
      </button>
    </div>
  );
}
