"use client";

import { motion } from "framer-motion";
import PackageCard from "@/components/ui/PackageCard";
import CarouselNav from "@/components/ui/CarouselNav";
import CardSkeleton from "@/components/ui/CardSkeleton";
import QueryError from "@/components/ui/QueryError";
import { useCarousel } from "@/hooks/useCarousel";
import { useCulturalToursQuery } from "@/features/packages/packageQueries";
import { adaptCmsPackage, type CmsPackage } from "@/lib/adaptCmsPackage";
import type { PackageCardData } from "@/types";

/** Cultural & Day Tours — Figma node 84:1278. Embla carousel of package cards. */

export default function CulturalDayTours({
  initialItems,
  resolved_packages,
  heading = "Cultural & Day Tours",
  description = "",
}: {
  initialItems?: PackageCardData[];
  resolved_packages?: CmsPackage[];
  heading?: string;
  description?: string;
}) {
  const { data, isLoading, isError, refetch } = useCulturalToursQuery();
  const cmsItems = resolved_packages?.map(adaptCmsPackage) ?? initialItems;
  const tours = cmsItems ?? (data && data.length > 0 ? data : []);
  const loading = isLoading && !cmsItems && !data;
  const errored = isError && !cmsItems && !data;



  const { emblaRef, scrollPrev, scrollNext, canPrev, canNext } = useCarousel({
    loop: true,
  });

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
      <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-[clamp(1.75rem,3vw,32px)] font-bold tracking-[-0.04em] text-foreground">
            {heading}
          </h2>
          <p className="font-body-alt text-[clamp(1.05rem,2vw,24px)] tracking-[-0.04em] text-text-secondary">
            {description}
          </p>
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
        <QueryError message="Couldn't load tours." onRetry={refetch} />
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
              {tours.map((tour) => (
                <div
                  key={tour.id}
                  className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]"
                >
                  <PackageCard {...tour} href={tour.href} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
