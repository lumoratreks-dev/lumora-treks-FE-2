"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import PackageCard from "@/components/ui/PackageCard";
import DestinationCard from "@/components/ui/DestinationCard";
import BlogCard from "@/components/ui/BlogCard";
import { useUIStore } from "@/store/useUIStore";
import type { SearchResults as Results } from "@/features/search/searchQueries";
import { saveRecentSearch } from "./searchUtils";

/** `/search?q=` results — a dedicated results page (not the packages hero):
 * query header with an editable field, tabs with counts (All / Packages /
 * Destinations / Stories), and each group as its own card grid. "All" shows a
 * preview of every group with "View all" jumping to that tab. */

type Tab = "all" | "packages" | "destinations" | "stories";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function SearchResults({
  results,
  suggestions,
}: {
  results: Results;
  /** Destination names offered when the query is empty or finds nothing. */
  suggestions: string[];
}) {
  const router = useRouter();
  const openSearch = useUIStore((s) => s.openSearch);
  const [tab, setTab] = useState<Tab>("all");
  const [value, setValue] = useState(results.query);
  const { query, packages, packagesTotal, destinations, posts } = results;

  const counts = {
    packages: packagesTotal,
    destinations: destinations.length,
    stories: posts.length,
  };
  const total = counts.packages + counts.destinations + counts.stories;

  const submit = (q: string) => {
    const next = q.trim();
    if (!next) return;
    saveRecentSearch(next);
    setTab("all");
    router.push(`/search?q=${encodeURIComponent(next)}`);
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "all", label: "All", count: total },
    { id: "packages", label: "Packages", count: counts.packages },
    { id: "destinations", label: "Destinations", count: counts.destinations },
    { id: "stories", label: "Stories", count: counts.stories },
  ];

  const show = (t: Exclude<Tab, "all">) => tab === "all" || tab === t;
  const preview = tab === "all";

  return (
    <section className="mx-auto w-full max-w-[1400px] px-6 pb-20 pt-10 lg:px-10 lg:pt-14">
      {/* Header */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <p className="font-body-alt text-base font-medium tracking-[-0.04em] text-text-secondary">
            {query
              ? `${total} result${total === 1 ? "" : "s"} for`
              : "Search Lumora Treks"}
          </p>
          <h1 className="text-[clamp(2rem,4vw,48px)] font-bold leading-tight tracking-[-0.06em] text-foreground">
            {query ? `“${query}”` : "Where do you want to go?"}
            <span className="ml-2 inline-block size-3 rounded-full bg-primary-accent align-middle" />
          </h1>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
          className="flex max-w-[760px] gap-3 rounded-2xl border border-border bg-surface p-2.5 shadow-[0_18px_60px_rgba(30,30,30,0.08)]"
        >
          <label className="flex h-[52px] min-w-0 flex-1 items-center gap-3 rounded-xl px-3">
            <Icon
              icon="mingcute:search-line"
              className="size-5 shrink-0 text-text-secondary"
            />
            <input
              type="search"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Search treks, destinations, stories…"
              aria-label="Search"
              className="min-w-0 flex-1 bg-transparent font-body-alt text-lg font-medium tracking-[-0.04em] text-foreground placeholder:text-text-muted/70 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => openSearch(value)}
              className="hidden shrink-0 rounded-md border border-border px-2 py-1 text-xs font-semibold text-text-muted transition-colors hover:text-foreground sm:block"
              title="Open live search"
            >
              ⌘K
            </button>
          </label>
          <button
            type="submit"
            aria-label="Search"
            className="flex h-[52px] items-center justify-center rounded-xl bg-primary-accent px-5 text-foreground transition-transform hover:scale-[1.03] active:scale-95"
          >
            <Icon icon="mingcute:search-line" className="size-6" />
          </button>
        </form>

        {query && total > 0 ? (
          <div
            role="tablist"
            aria-label="Result type"
            className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 lg:mx-0 lg:px-0"
          >
            {tabs.map((t) => {
              const active = tab === t.id;
              const empty = t.id !== "all" && !t.count;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  disabled={empty}
                  onClick={() => setTab(t.id)}
                  className={clsx(
                    "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-base font-semibold tracking-[-0.04em] transition-colors",
                    active
                      ? "bg-foreground text-background"
                      : "bg-surface text-foreground hover:bg-border/60",
                    empty && "cursor-not-allowed opacity-40",
                  )}
                >
                  {t.label}
                  <span
                    className={clsx(
                      "rounded-full px-2 py-0.5 text-xs font-bold",
                      active
                        ? "bg-primary-accent text-foreground"
                        : "bg-background text-text-secondary",
                    )}
                  >
                    {t.count ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </motion.div>

      {/* Empty / no-query states */}
      {total === 0 ? (
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="mt-14 flex flex-col items-center rounded-3xl bg-surface px-6 py-14 text-center"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-background">
            <Icon icon="iconoir:compass" className="size-8 text-foreground" />
          </span>
          <h2 className="mt-5 text-2xl font-bold tracking-[-0.05em] text-foreground">
            {query ? "No matches yet" : "Start with a place or a trek"}
          </h2>
          <p className="mt-2 max-w-md font-body-alt text-base tracking-[-0.03em] text-text-secondary">
            {query
              ? "Try a region, a trek name, or an activity — or explore one of these:"
              : "Search packages, destinations and travel stories all at once."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setValue(s);
                  submit(s);
                }}
                className="rounded-full bg-background px-4 py-2.5 text-sm font-semibold tracking-[-0.03em] text-foreground transition-colors hover:bg-[#ebffe8]"
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* Destinations */}
      {show("destinations") && destinations.length > 0 ? (
        <ResultGroup
          title="Destinations"
          icon="iconoir:map-pin"
          count={destinations.length}
          onViewAll={
            preview && destinations.length > 3
              ? () => setTab("destinations")
              : undefined
          }
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(preview ? destinations.slice(0, 3) : destinations).map((d, i) => (
              <motion.div
                key={d.id}
                {...fadeUp}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="h-[300px]"
              >
                <DestinationCard
                  image={d.image}
                  title={d.title}
                  price={d.price}
                  href={d.href}
                />
              </motion.div>
            ))}
          </div>
        </ResultGroup>
      ) : null}

      {/* Packages */}
      {show("packages") && packages.length > 0 ? (
        <ResultGroup
          title="Packages"
          icon="iconoir:hiking"
          count={packagesTotal}
          onViewAll={
            preview && packages.length > 3 ? () => setTab("packages") : undefined
          }
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(preview ? packages.slice(0, 3) : packages).map((p, i) => (
              <motion.div
                key={p.id}
                {...fadeUp}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <PackageCard
                  image={p.image}
                  title={p.title}
                  description={p.description}
                  price={p.price}
                  duration={p.duration}
                  rating={p.rating}
                  href={p.href}
                />
              </motion.div>
            ))}
          </div>
        </ResultGroup>
      ) : null}

      {/* Stories */}
      {show("stories") && posts.length > 0 ? (
        <ResultGroup
          title="Stories & guides"
          icon="iconoir:journal-page"
          count={posts.length}
          onViewAll={
            preview && posts.length > 3 ? () => setTab("stories") : undefined
          }
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(preview ? posts.slice(0, 3) : posts).map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </ResultGroup>
      ) : null}
    </section>
  );
}

function ResultGroup({
  title,
  icon,
  count,
  onViewAll,
  children,
}: {
  title: string;
  icon: string;
  count: number;
  onViewAll?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="flex items-center gap-3 text-[clamp(1.5rem,2.5vw,32px)] font-bold tracking-[-0.06em] text-foreground">
          <span className="flex size-10 items-center justify-center rounded-full bg-surface">
            <Icon icon={icon} className="size-5" />
          </span>
          {title}
          <span className="font-body-alt text-lg font-medium tracking-[-0.04em] text-text-muted">
            {count}
          </span>
        </h2>
        {onViewAll ? (
          <button
            type="button"
            onClick={() => {
              onViewAll();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
          >
            View all
            <Icon icon="iconoir:arrow-right" className="size-4" />
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}
