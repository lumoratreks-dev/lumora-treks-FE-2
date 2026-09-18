"use client";

import { motion } from "framer-motion";
import PackageCard from "@/components/ui/PackageCard";
import CarouselNav from "@/components/ui/CarouselNav";
import CardSkeleton from "@/components/ui/CardSkeleton";
import QueryError from "@/components/ui/QueryError";
import { useCarousel } from "@/hooks/useCarousel";
import { usePopularPackagesQuery } from "@/features/packages/packageQueries";

import { adaptCmsPackage, type CmsPackage } from "@/lib/adaptCmsPackage";
import type { CmsHeadingGroup } from "@/lib/blocks";
import type { PackageCardData } from "@/types";

/** Our Packages — Figma node 84:938. Embla carousel of package cards.
 *
 * Two data paths, matching INTEGRATION_PLAN's boundary rule ("CMS blocks
 * store only references; the frontend fetches the actual package data"):
 *  - Called directly (landing page, `initialItems` prop) → RTK Query
 *    (`packagesApi`, dummy data today, real Travories/catalog endpoint later).
 *  - Called via `<BlockRenderer>` from a `PopularPackagesBlock` → the block
 *    already resolved `resolved_packages` server-side (see
 *    `apps/cms/blocks/sections.py::_resolve_packages`), so we adapt and use
 *    those directly and skip the query. */

export default function PopularPackages({
  initialItems,
  heading = {
    heading: "Our Packages",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do .",
  },
  resolved_packages,
}: {
  initialItems?: PackageCardData[];
  heading?: CmsHeadingGroup;
  resolved_packages?: CmsPackage[];
}) {
  const hasCmsPackages = !!resolved_packages?.length;
  const { data, isLoading, isError, refetch } = usePopularPackagesQuery();
  const packages = hasCmsPackages
    ? resolved_packages!.map(adaptCmsPackage)
    : data && data.length > 0
      ? data
      : (initialItems ?? []);
  const loading = !hasCmsPackages && isLoading && !initialItems && !data;
  const errored = !hasCmsPackages && isError && !initialItems && !data;

  const { emblaRef, scrollPrev, scrollNext, canPrev, canNext } = useCarousel({
    loop: true,
  });

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
      <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
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
        <CarouselNav
          className="shrink-0"
          onPrev={scrollPrev}
          onNext={scrollNext}
          prevDisabled={!canPrev}
          nextDisabled={!canNext}
        />
      </div>

      {errored ? (
        <QueryError message="Couldn't load packages." onRetry={refetch} />
      ) : loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]"
                >
                  <PackageCard {...pkg} href={pkg.href} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
