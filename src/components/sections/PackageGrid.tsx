"use client";

import { motion } from "framer-motion";
import PackageCard from "@/components/ui/PackageCard";
import CardSkeleton from "@/components/ui/CardSkeleton";
import QueryError from "@/components/ui/QueryError";
import { usePopularPackagesQuery } from "@/features/packages/packageQueries";
import { adaptCmsPackage, type CmsPackage } from "@/lib/adaptCmsPackage";
import type { CmsHeadingGroup } from "@/lib/blocks";

/**
 * → backend `PackageGridBlock` (`component: "PackageGrid"`,
 * apps/cms/blocks/sections.py) — same resolved-package data as
 * `PopularPackages`' carousel, laid out as a static grid instead. No Figma
 * node of its own yet (not used directly on any page today, only reachable
 * via `<BlockRenderer>`); styled to match the other package card grids
 * (`PopularPackagesGrid`) pending a dedicated design. */

const COLUMN_CLASS: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

export default function PackageGrid({
  heading = { heading: "Popular Packages" },
  resolved_packages,
  columns = "3",
}: {
  heading?: CmsHeadingGroup;
  resolved_packages?: CmsPackage[];
  columns?: "2" | "3" | "4";
} = {}) {
  const hasCmsPackages = !!resolved_packages?.length;
  const { data, isLoading, isError, refetch } = usePopularPackagesQuery();
  const packages = hasCmsPackages
    ? resolved_packages!.map(adaptCmsPackage)
    : (data ?? []);

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
      {(heading.heading || heading.description) && (
        <div className="mb-10 flex flex-col gap-2">
          {heading.heading && (
            <h2 className="text-[clamp(1.75rem,3vw,32px)] font-bold tracking-[-0.04em] text-foreground">
              {heading.heading}
            </h2>
          )}
          {heading.description && (
            <p className="font-body-alt text-[clamp(1.05rem,2vw,24px)] tracking-[-0.04em] text-text-secondary">
              {heading.description}
            </p>
          )}
        </div>
      )}

      {!hasCmsPackages && isError ? (
        <QueryError message="Couldn't load packages." onRetry={refetch} />
      ) : !hasCmsPackages && isLoading ? (
        <div className={`grid gap-6 ${COLUMN_CLASS[columns]}`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className={`grid gap-6 ${COLUMN_CLASS[columns]}`}>
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
      )}
    </section>
  );
}
