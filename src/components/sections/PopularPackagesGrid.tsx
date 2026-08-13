"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PackageCard from "@/components/ui/PackageCard";
import CarouselNav from "@/components/ui/CarouselNav";
import FilterTabs from "@/components/ui/FilterTabs";
import Pagination from "@/components/ui/Pagination";
import CardSkeleton from "@/components/ui/CardSkeleton";
import QueryError from "@/components/ui/QueryError";
import { usePackagesQuery } from "@/features/packages/packageQueries";
import type { PackageListResult } from "@/types";

/** Popular Packages — Figma node 83:656. Header + filter tabs + card grid +
 * pagination. Tabs filter by category; a `searchLocation` (from the SearchBar)
 * overrides the tabs and filters by title. `initialData` (server-provided) gives
 * SSR content for the first render. Dummy data. */

const CATEGORIES = ["Trekking", "Sightseeing", "Paragliding"];

export default function PopularPackagesGrid({
  searchLocation,
  searchDate,
  initialData,
  heading = "Popular Packages",
  categories = CATEGORIES,
  page_size = 6,
  default_category,
  show_filters = true,
}: {
  searchLocation?: string;
  searchDate?: string;
  initialData?: PackageListResult;
  heading?: string;
  categories?: string[];
  page_size?: number;
  default_category?: string;
  show_filters?: boolean;
}) {
  const [category, setCategory] = useState(default_category || categories[0] || "Trekking");
  const [page, setPage] = useState(1);
  const [searchCleared, setSearchCleared] = useState(false);
  const activeSearchLocation = searchCleared ? undefined : searchLocation;
  const activeSearchDate = searchCleared ? undefined : searchDate;

  // Reset to page 1 the moment a new search arrives — render-phase, so the query
  // never runs with a stale page (no empty-state flash).
  const searchKey = `${activeSearchLocation || ""}|${activeSearchDate || ""}`;
  const [prevSearchKey, setPrevSearchKey] = useState(searchKey);
  if (prevSearchKey !== searchKey) {
    setPrevSearchKey(searchKey);
    setPage(1);
  }

  const { data, isLoading, isError, refetch } = usePackagesQuery({
    category: activeSearchLocation ? undefined : category,
    location: activeSearchLocation,
    date: activeSearchDate,
    page,
    pageSize: page_size,
  });

  const result = data ?? initialData;
  const packages = result?.items ?? [];
  const totalPages = result?.totalPages ?? 1;
  const loading = isLoading && !initialData;
  const errored = isError && !initialData;

  const clearSearchMode = () => {
    setSearchCleared(true);
    setPage(1);
    window.history.replaceState(null, "", "/packages");
  };

  const handleCategory = (next: string) => {
    setCategory(next);
    setPage(1);
    if (activeSearchLocation || activeSearchDate) clearSearchMode();
  };

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
      <div className="mb-10 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[clamp(1.75rem,3vw,32px)] font-bold tracking-[-0.04em] text-foreground">
            {heading}
          </h2>
          <CarouselNav
            className="shrink-0"
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            prevDisabled={page === 1}
            nextDisabled={page >= totalPages}
          />
        </div>
        {show_filters ? <FilterTabs
          tabs={categories}
          defaultTab={category}
          onChange={handleCategory}
        /> : null}
        {activeSearchLocation && (
          <p className="font-body-alt text-base text-text-secondary">
            Showing results for{" "}
            <span className="font-semibold text-foreground">
              “{activeSearchLocation}”
            </span>{" "}
            {activeSearchDate ? (
              <>
                on{" "}
                <span className="font-semibold text-foreground">
                  {activeSearchDate}
                </span>{" "}
              </>
            ) : null}
            <button
              type="button"
              onClick={clearSearchMode}
              className="text-primary underline"
            >
              clear
            </button>
          </p>
        )}
        {!activeSearchLocation && activeSearchDate && (
          <p className="font-body-alt text-base text-text-secondary">
            Showing results for{" "}
            <span className="font-semibold text-foreground">{activeSearchDate}</span>{" "}
            <button
              type="button"
              onClick={clearSearchMode}
              className="text-primary underline"
            >
              clear
            </button>
          </p>
        )}
      </div>

      {errored ? (
        <QueryError message="Couldn't load packages." onRetry={refetch} />
      ) : loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: page_size }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : packages.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: (i % 3) * 0.1 }}
            >
              <PackageCard {...pkg} href={pkg.href} />
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="py-16 text-center font-body-alt text-lg text-text-secondary">
          No packages found
          {activeSearchLocation ? ` for “${activeSearchLocation}”` : ""}
          {!activeSearchLocation && activeSearchDate ? ` for ${activeSearchDate}` : ""}.
        </p>
      )}

      <Pagination
        className="mt-12"
        page={page}
        pages={totalPages}
        onChange={setPage}
      />
    </section>
  );
}
