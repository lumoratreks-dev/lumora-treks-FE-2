"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { useUIStore } from "@/store/useUIStore";
import { useAllDestinationsQuery } from "@/features/search/searchQueries";

/** Hero search field with a neon-green search button. Shared by the landing
 * hero and page heroes. It is a trigger for the site-wide `SearchModal`
 * (live results across packages, destinations and stories) rather than a
 * plain form, and cycles "Try …" hints from real destinations so it reads as
 * an active search. */
type SearchBarProps = {
  className?: string;
  /** Accessible name of the search field. */
  label?: string;
  /** Kept for CMS compatibility; the field now shows rotating hints. */
  placeholder?: string;
  /** Accessible name of the icon-only submit button. */
  buttonLabel?: string;
};

const FALLBACK_HINTS = [
  "Everest Base Camp",
  "Annapurna Region",
  "Pokhara",
  "Chitwan Safari",
  "Langtang Valley",
];

export default function SearchBar({
  className,
  label = "Search packages, destinations and stories",
  buttonLabel = "Search",
}: SearchBarProps) {
  const openSearch = useUIStore((s) => s.openSearch);
  const { data: destinations } = useAllDestinationsQuery();
  const hints = destinations?.length
    ? destinations.slice(0, 6).map((d) => d.title)
    : FALLBACK_HINTS;
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setHintIndex((i) => (i + 1) % hints.length),
      2600,
    );
    return () => window.clearInterval(id);
  }, [hints.length]);

  const hint = hints[hintIndex % hints.length];

  return (
    <div
      className={clsx(
        "flex flex-col gap-3 rounded-2xl border border-white/50 bg-background/90 p-3 shadow-[0_18px_60px_rgba(30,30,30,0.12)] backdrop-blur-sm sm:flex-row sm:items-center",
        className,
      )}
    >
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        onClick={() => openSearch()}
        className="group flex h-[56px] min-w-0 flex-1 items-center gap-3 rounded-xl border border-border bg-white px-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-colors hover:border-primary-active focus-visible:border-primary-active focus-visible:outline-none"
      >
        <Icon
          icon="proicons:location"
          className="size-5 shrink-0 text-foreground"
        />
        <span className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden font-body-alt text-lg font-medium tracking-[-0.04em] text-foreground/70">
          <span className="shrink-0">Try</span>
          <span className="relative block h-7 min-w-0 flex-1 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={hint}
                initial={{ y: 22, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -22, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 truncate leading-7 text-foreground"
              >
                “{hint}”
              </motion.span>
            </AnimatePresence>
          </span>
        </span>
        <kbd className="hidden shrink-0 rounded-md border border-border px-1.5 py-0.5 font-sans text-xs font-semibold text-text-muted lg:block">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        aria-label={buttonLabel}
        onClick={() => openSearch()}
        className="flex h-[56px] items-center justify-center rounded-xl bg-primary-accent px-5 text-foreground transition-transform hover:scale-[1.03] active:scale-95"
      >
        <Icon icon="mingcute:search-line" className="size-6" />
      </button>
    </div>
  );
}
