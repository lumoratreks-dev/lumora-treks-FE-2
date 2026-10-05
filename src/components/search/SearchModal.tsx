"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { useUIStore } from "@/store/useUIStore";
import { usePopularPackagesQuery } from "@/features/packages/packageQueries";
import {
  useAllDestinationsQuery,
  useSearchQuery,
} from "@/features/search/searchQueries";
import {
  clearRecentSearches,
  highlightMatches,
  readRecentSearches,
  saveRecentSearch,
} from "./searchUtils";

/**
 * SearchModal — the site-wide "universal" search (command-palette style).
 * Opened from the navbar search button, any hero `SearchBar`, or ⌘K / Ctrl+K
 * / "/". Empty: recent searches, trending trips and popular destinations.
 * Typing: live, debounced results grouped as Destinations / Packages /
 * Stories, with matched words highlighted, plus "See all results" →
 * `/search?q=`. Fully keyboard-driven (↑ ↓ ↵ esc). Mounted once in the root
 * layout; open state lives in `useUIStore`.
 */

type Item = {
  key: string;
  label: string;
  subtitle?: string;
  meta?: string;
  image?: string;
  icon: string;
  /** Navigate here on select… */
  href?: string;
  /** …or fill the input with this query instead. */
  query?: string;
};

type Section = {
  id: string;
  title: string;
  icon: string;
  layout: "chips" | "rows";
  items: Item[];
  action?: { label: string; onClick: () => void };
};

const INPUT_ID = "universal-search-input";

const searchHref = (q: string) => `/search?q=${encodeURIComponent(q.trim())}`;

export default function SearchModal() {
  const isOpen = useUIStore((s) => s.isSearchOpen);
  const openSearch = useUIStore((s) => s.openSearch);

  // ⌘K / Ctrl+K anywhere, or "/" when not already typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch]);

  return <AnimatePresence>{isOpen ? <SearchDialog /> : null}</AnimatePresence>;
}

function SearchDialog() {
  const router = useRouter();
  const seed = useUIStore((s) => s.searchSeed);
  const closeSearch = useUIStore((s) => s.closeSearch);

  const [query, setQuery] = useState(seed);
  const [debounced, setDebounced] = useState(seed.trim());
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>(() => readRecentSearches());
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 180);
    return () => window.clearTimeout(id);
  }, [query]);

  // Lock page scroll behind the dialog.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const { data: popular } = usePopularPackagesQuery();
  const { data: destinations } = useAllDestinationsQuery();
  const { data: results, isFetching } = useSearchQuery(debounced, 6);

  const hasQuery = query.trim().length > 0;
  // Results for the exact text typed (vs. stale ones kept while refetching).
  const settled =
    hasQuery && results?.query.toLowerCase() === debounced.toLowerCase();
  const hasResults = hasQuery && !!results?.query;
  const loading = hasQuery && (isFetching || query.trim() !== debounced);
  const resultQuery = results?.query ?? "";

  const sections = useMemo<Section[]>(() => {
    if (!hasQuery) {
      const out: Section[] = [];
      if (recent.length) {
        out.push({
          id: "recent",
          title: "Recent",
          icon: "iconoir:clock-rotate-right",
          layout: "chips",
          items: recent.map((q) => ({
            key: `recent-${q}`,
            label: q,
            icon: "iconoir:clock-rotate-right",
            query: q,
          })),
          action: {
            label: "Clear",
            onClick: () => {
              clearRecentSearches();
              setRecent([]);
              setActiveIndex(-1);
            },
          },
        });
      }
      if (popular?.length) {
        out.push({
          id: "trending",
          title: "Trending trips",
          icon: "iconoir:fire-flame",
          layout: "chips",
          items: popular.slice(0, 6).map((p) => ({
            key: `trending-${p.id}`,
            label: p.title,
            icon: "iconoir:fire-flame",
            href: p.href,
            query: p.href ? undefined : p.title,
          })),
        });
      }
      if (destinations?.length) {
        out.push({
          id: "popular-destinations",
          title: "Popular destinations",
          icon: "iconoir:map-pin",
          layout: "rows",
          items: destinations.slice(0, 5).map((d) => ({
            key: `pd-${d.id}`,
            label: d.title,
            subtitle: [d.region, d.subtitle].filter(Boolean).join(" · "),
            meta: d.price ? `From ${d.price}` : undefined,
            image: d.image,
            icon: "proicons:location",
            href: d.href,
          })),
        });
      }
      return out;
    }

    if (!results || !results.query) return [];
    const out: Section[] = [];
    if (results.destinations.length) {
      out.push({
        id: "destinations",
        title: "Destinations",
        icon: "iconoir:map-pin",
        layout: "rows",
        items: results.destinations.slice(0, 3).map((d) => ({
          key: `d-${d.id}`,
          label: d.title,
          subtitle: [d.region, d.subtitle].filter(Boolean).join(" · "),
          meta: d.price ? `From ${d.price}` : undefined,
          image: d.image,
          icon: "proicons:location",
          href: d.href,
        })),
      });
    }
    if (results.packages.length) {
      out.push({
        id: "packages",
        title: "Packages",
        icon: "iconoir:hiking",
        layout: "rows",
        items: results.packages.slice(0, 5).map((p) => ({
          key: `p-${p.id}`,
          label: p.title,
          subtitle: [p.duration, p.category].filter(Boolean).join(" · "),
          meta: p.price || undefined,
          image: p.image,
          icon: "iconoir:hiking",
          href: p.href,
        })),
      });
    }
    if (results.posts.length) {
      out.push({
        id: "posts",
        title: "Stories & guides",
        icon: "iconoir:journal-page",
        layout: "rows",
        items: results.posts.slice(0, 3).map((post) => ({
          key: `b-${post.id}`,
          label: post.title,
          subtitle: [post.category, post.readTime].filter(Boolean).join(" · "),
          image: post.image,
          icon: "iconoir:journal-page",
          href: `/blog/${post.slug}`,
        })),
      });
    }
    if (out.length) {
      out.push({
        id: "all",
        title: "",
        icon: "",
        layout: "rows",
        items: [
          {
            key: "all",
            label: `See all results for “${results.query}”`,
            icon: "mingcute:search-line",
            href: searchHref(results.query),
          },
        ],
      });
    }
    return out;
  }, [hasQuery, recent, popular, destinations, results]);

  const flat = useMemo(() => sections.flatMap((s) => s.items), [sections]);
  // Index of each section's first item within `flat` (for keyboard focus).
  const offsets = useMemo(() => {
    let n = 0;
    return sections.map((s) => {
      const start = n;
      n += s.items.length;
      return start;
    });
  }, [sections]);
  const noResults = settled && !isFetching && flat.length === 0;

  // Keep the highlighted option visible while arrowing through a long list.
  useEffect(() => {
    if (activeIndex < 0) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const go = (href: string) => {
    if (query.trim()) saveRecentSearch(query);
    closeSearch();
    router.push(href);
  };

  const choose = (item: Item) => {
    if (item.href) {
      go(item.href);
    } else if (item.query) {
      setQuery(item.query);
      setActiveIndex(-1);
      // Chip clicks move focus to the chip; hand it back to the field.
      document.getElementById(INPUT_ID)?.focus();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (flat.length) setActiveIndex((i) => (i + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (flat.length) setActiveIndex((i) => (i <= 0 ? flat.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flat[activeIndex];
      if (item) choose(item);
      else if (query.trim()) go(searchHref(query));
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeSearch();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-start justify-center px-0 sm:px-4 sm:pt-[9vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <button
        type="button"
        aria-label="Close search"
        tabIndex={-1}
        onClick={closeSearch}
        className="absolute inset-0 bg-foreground/45 backdrop-blur-[3px]"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Search Lumora Treks"
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex h-full w-full max-w-[720px] flex-col overflow-hidden bg-surface shadow-[0_30px_90px_rgba(30,30,30,0.35)] sm:h-auto sm:max-h-[78vh] sm:rounded-3xl"
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
          {loading ? (
            <Icon
              icon="svg-spinners:180-ring"
              className="size-6 shrink-0 text-text-secondary"
            />
          ) : (
            <Icon
              icon="mingcute:search-line"
              className="size-6 shrink-0 text-foreground"
            />
          )}
          <input
            ref={inputRef}
            id={INPUT_ID}
            type="search"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={
              activeIndex >= 0 ? `search-opt-${activeIndex}` : undefined
            }
            aria-label="Search packages, destinations and stories"
            placeholder="Search treks, destinations, stories…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={onKeyDown}
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent font-body-alt text-lg font-medium tracking-[-0.04em] text-foreground placeholder:text-text-muted/70 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveIndex(-1);
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-background hover:text-foreground"
            >
              <Icon icon="iconoir:xmark" className="size-5" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={closeSearch}
            className="hidden shrink-0 rounded-md border border-border px-2 py-1 text-xs font-semibold text-text-muted transition-colors hover:text-foreground sm:block"
          >
            ESC
          </button>
          <button
            type="button"
            onClick={closeSearch}
            className="shrink-0 text-sm font-semibold text-foreground sm:hidden"
          >
            Cancel
          </button>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          id="search-results"
          role="listbox"
          className={clsx(
            "flex-1 overflow-y-auto overscroll-contain px-3 py-3 transition-opacity sm:px-4",
            loading && hasResults && "opacity-60",
          )}
        >
          {hasQuery && !hasResults ? <ResultSkeleton /> : null}

          {noResults ? (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-background">
                <Icon icon="iconoir:compass" className="size-7 text-foreground" />
              </span>
              <p className="mt-4 text-lg font-bold tracking-[-0.04em] text-foreground">
                No matches for “{debounced}”
              </p>
              <p className="mt-1 font-body-alt text-sm text-text-secondary">
                Try a region, a trek name, or an activity.
              </p>
              {destinations?.length ? (
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {destinations.slice(0, 5).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setQuery(d.title);
                        inputRef.current?.focus();
                      }}
                      className="rounded-full bg-background px-3.5 py-2 text-sm font-semibold tracking-[-0.03em] text-foreground transition-colors hover:bg-[#ebffe8]"
                    >
                      {d.title}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {(!hasQuery || hasResults) &&
            !noResults &&
            sections.map((section, sectionIndex) => (
              <div key={section.id} className="mb-2 last:mb-0">
                {section.title ? (
                  <div className="flex items-center justify-between px-3 pb-2 pt-3">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-text-muted">
                      <Icon icon={section.icon} className="size-4" />
                      {section.title}
                    </span>
                    {section.action ? (
                      <button
                        type="button"
                        onClick={section.action.onClick}
                        className="text-xs font-semibold text-text-muted transition-colors hover:text-foreground"
                      >
                        {section.action.label}
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className="mx-3 my-2 border-t border-border" />
                )}

                {section.layout === "chips" ? (
                  <div className="flex flex-wrap gap-2 px-3 pb-1">
                    {section.items.map((item, itemIndex) => {
                      const i = offsets[sectionIndex] + itemIndex;
                      const active = i === activeIndex;
                      return (
                        <button
                          key={item.key}
                          id={`search-opt-${i}`}
                          data-index={i}
                          role="option"
                          aria-selected={active}
                          type="button"
                          onMouseEnter={() => setActiveIndex(i)}
                          onClick={() => choose(item)}
                          className={clsx(
                            "flex max-w-full items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold tracking-[-0.03em] transition-colors",
                            active
                              ? "bg-foreground text-text-inverse"
                              : "bg-background text-foreground",
                          )}
                        >
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <ul className="flex flex-col">
                    {section.items.map((item, itemIndex) => {
                      const i = offsets[sectionIndex] + itemIndex;
                      const active = i === activeIndex;
                      const isAll = item.key === "all";
                      return (
                        <li key={item.key}>
                          <button
                            id={`search-opt-${i}`}
                            data-index={i}
                            role="option"
                            aria-selected={active}
                            type="button"
                            onMouseEnter={() => setActiveIndex(i)}
                            onClick={() => choose(item)}
                            className={clsx(
                              "group flex w-full items-center gap-3.5 rounded-2xl px-3 py-2.5 text-left transition-colors",
                              active && (isAll ? "bg-[#ebffe8]" : "bg-background"),
                            )}
                          >
                            {isAll ? (
                              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-accent text-foreground">
                                <Icon icon={item.icon} className="size-5" />
                              </span>
                            ) : (
                              <Thumb image={item.image} icon={item.icon} />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-base font-bold tracking-[-0.04em] text-foreground">
                                {isAll
                                  ? item.label
                                  : highlightMatches(item.label, resultQuery && hasQuery ? resultQuery : "")}
                              </span>
                              {item.subtitle ? (
                                <span className="mt-0.5 block truncate font-body-alt text-sm tracking-[-0.02em] text-text-secondary">
                                  {item.subtitle}
                                </span>
                              ) : null}
                            </span>
                            {item.meta ? (
                              <span className="hidden shrink-0 rounded-md bg-background px-2.5 py-1.5 text-xs font-semibold tracking-[-0.02em] text-foreground group-aria-selected:bg-surface sm:block">
                                {item.meta}
                              </span>
                            ) : null}
                            <Icon
                              icon="iconoir:arrow-up-right"
                              className={clsx(
                                "size-4 shrink-0 text-foreground transition-opacity",
                                active ? "opacity-100" : "opacity-0",
                              )}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
        </div>

        {/* Footer hints */}
        <div className="hidden items-center justify-between border-t border-border bg-background/60 px-6 py-3 text-xs text-text-muted sm:flex">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> navigate
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>↵</Kbd> select
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>esc</Kbd> close
            </span>
          </div>
          {hasQuery ? (
            <button
              type="button"
              onClick={() => go(searchHref(query))}
              className="font-semibold text-foreground hover:underline"
            >
              All results →
            </button>
          ) : (
            <span className="flex items-center gap-1.5">
              Open anytime with <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Thumb({ image, icon }: { image?: string; icon: string }) {
  return (
    <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-background">
      {image ? (
        <Image src={image} alt="" fill sizes="48px" className="object-cover" />
      ) : (
        <Icon icon={icon} className="size-5 text-foreground" />
      )}
    </span>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-5 items-center justify-center rounded border border-border bg-surface px-1.5 py-0.5 font-sans text-[11px] font-semibold text-text-secondary">
      {children}
    </kbd>
  );
}

function ResultSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-1 px-3 pt-3">
      <div className="mb-2 h-3 w-24 rounded bg-background" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3.5 py-2.5">
          <div className="size-12 rounded-xl bg-background" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 rounded bg-background" />
            <div className="h-3 w-1/3 rounded bg-background" />
          </div>
        </div>
      ))}
    </div>
  );
}
