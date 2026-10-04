"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PackageCard from "@/components/ui/PackageCard";
import FilterTabs from "@/components/ui/FilterTabs";
import Pagination from "@/components/ui/Pagination";
import CardSkeleton from "@/components/ui/CardSkeleton";
import QueryError from "@/components/ui/QueryError";
import { usePackagesQuery } from "@/features/packages/packageQueries";
import type { PackageListResult } from "@/types";

/** Popular Packages — Figma node 83:656. Header + filter tabs + card grid +
 * pagination (shown only when there is more than one page). Tabs filter by category; a `searchLocation` (from the SearchBar)
 * overrides the tabs and filters by title. `initialData` (server-provided) gives
 * SSR content for the first render. Dummy data. */

const CATEGORIES = [
  "Trekking",
  "Trail Run",
  "Hiking",
  "Day Excursions",
  "Religious Tour",
  "Nepal's Wild Life",
  "6000m Peak Climbing",
  "Sightseeing",
  "Paragliding",
];

/** "annapurna-circuit" -> "Annapurna Circuit" for the results label. */
function formatDestination(slug?: string) {
  if (!slug) return "";
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatSearchDate(date?: string) {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export default function PopularPackagesGrid({
  searchLocation,
  searchDate,
  searchDestination,
  initialData,
  heading = "Popular Packages",
  categories = CATEGORIES,
  page_size = 6,
  default_category,
  show_filters = true,
}: {
  searchLocation?: string;
  searchDate?: string;
  searchDestination?: string;
  initialData?: PackageListResult;
  heading?: string;
  categories?: string[];
  page_size?: number;
  default_category?: string;
  show_filters?: boolean;
}) {
  const [category, setCategory] = useState(
    default_category || categories[0] || "Trekking",
  );
  const [page, setPage] = useState(1);
  const router = useRouter();
  const [searchCleared, setSearchCleared] = useState(false);

  // A new search from the URL re-activates search mode after a "clear".
  const incomingSearchKey = `${searchLocation || ""}|${searchDate || ""}|${searchDestination || ""}`;
  const [prevIncomingSearchKey, setPrevIncomingSearchKey] =
    useState(incomingSearchKey);
  if (prevIncomingSearchKey !== incomingSearchKey) {
    setPrevIncomingSearchKey(incomingSearchKey);
    setSearchCleared(false);
  }

  const activeSearchLocation = searchCleared ? undefined : searchLocation;
  const activeSearchDate = searchCleared ? undefined : searchDate;
  const activeSearchDestination =
    searchCleared || activeSearchLocation ? undefined : searchDestination;
  const activeSearchDateLabel = formatSearchDate(activeSearchDate);
  const activeDestinationLabel = formatDestination(activeSearchDestination);

  // Reset to page 1 the moment a new search arrives — render-phase, so the query
  // never runs with a stale page (no empty-state flash).
  const searchKey = `${activeSearchLocation || ""}|${activeSearchDate || ""}|${activeSearchDestination || ""}`;
  const [prevSearchKey, setPrevSearchKey] = useState(searchKey);
  if (prevSearchKey !== searchKey) {
    setPrevSearchKey(searchKey);
    setPage(1);
  }

  const { data, isLoading, isError, refetch } = usePackagesQuery({
    category:
      activeSearchLocation || activeSearchDestination ? undefined : category,
    location: activeSearchLocation,
    date: activeSearchDate,
    destination: activeSearchDestination,
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
    // Navigate (not history.replaceState) so the route's search params reset
    // and the same search can be run again afterwards.
    router.replace("/packages", { scroll: false });
  };

  const handleCategory = (next: string) => {
    setCategory(next);
    setPage(1);
    if (activeSearchLocation || activeSearchDate || activeSearchDestination)
      clearSearchMode();
  };

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
      <div className="mb-10 flex flex-col gap-6">
        <h2 className="text-[clamp(1.75rem,3vw,32px)] font-bold tracking-[-0.04em] text-foreground">
          {heading}
        </h2>
        {show_filters ? (
          <FilterTabs
            tabs={categories}
            defaultTab={category}
            onChange={handleCategory}
          />
        ) : null}
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
                  {activeSearchDateLabel}
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
        {!activeSearchLocation && activeSearchDestination && (
          <p className="font-body-alt text-base text-text-secondary">
            Showing packages in{" "}
            <span className="font-semibold text-foreground">
              {activeDestinationLabel}
            </span>{" "}
            <button
              type="button"
              onClick={clearSearchMode}
              className="text-primary underline"
            >
              clear
            </button>
          </p>
        )}
        {!activeSearchLocation &&
          !activeSearchDestination &&
          activeSearchDate && (
            <p className="font-body-alt text-base text-text-secondary">
              Showing results for{" "}
              <span className="font-semibold text-foreground">
                {activeSearchDateLabel}
              </span>{" "}
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
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: (i % 3) * 0.1,
              }}
            >
              <PackageCard {...pkg} href={pkg.href} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <p className="text-xl font-semibold tracking-[-0.03em] text-foreground">
            {activeSearchLocation
              ? `No trips match “${activeSearchLocation}” yet`
              : activeSearchDestination
                ? `No trips in ${activeDestinationLabel} yet`
                : activeSearchDate
                  ? `No trips found for ${activeSearchDateLabel}`
                  : `No ${category} trips yet`}
          </p>
          <p className="max-w-md font-body-alt text-base text-text-secondary">
            Tell us where and when you would like to travel — our team plans
            custom trips across Nepal.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/enquiry"
              className="rounded-lg bg-foreground px-5 py-3 font-body-alt text-sm font-medium text-background"
            >
              Plan a custom trip
            </Link>
            {(activeSearchLocation ||
              activeSearchDate ||
              activeSearchDestination) && (
              <button
                type="button"
                onClick={clearSearchMode}
                className="rounded-lg border border-border px-5 py-3 font-body-alt text-sm font-medium text-foreground"
              >
                Show all packages
              </button>
            )}
          </div>
        </div>
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
