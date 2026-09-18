"use client";

import { motion } from "framer-motion";
import DestinationCard from "@/components/ui/DestinationCard";
import type { CmsHeadingGroup, CmsImage } from "@/lib/blocks";

/** Explore famous destinations — Figma node 34:1417. Bento grid:
 * left column (2), tall center (1), right column (2). Staggered scroll-reveal.
 *
 * Props mirror the backend `BentoGridBlock` (apps/cms/blocks/sections.py,
 * `component: "BentoGrid"`) — `items` mirror `DestinationCardBlock`
 * (title/image/href already resolved server-side, destination-snippet
 * fallback included).
 *
 * Simplification: the 2-tall-2 grid placement below is a fixed template for
 * the first 5 items (matching the Figma "welcome" bento exactly), not driven
 * by each item's `layout` field — a general arbitrary-count bento algorithm
 * is out of scope here. */

import CardSkeleton from "@/components/ui/CardSkeleton";
import { useDestinationsQuery } from "@/features/destinations/destinationQueries";

export type BentoItem = {
  title: string;
  image?: CmsImage;
  href?: string;
  price?: string;
};

const SLOT_PLACEMENT = [
  "lg:col-start-1 lg:row-start-1",
  "lg:col-start-2 lg:row-start-1 lg:row-span-2",
  "lg:col-start-3 lg:row-start-1",
  "lg:col-start-1 lg:row-start-2",
  "lg:col-start-3 lg:row-start-2",
];

const DEFAULT_HEADING: CmsHeadingGroup = {
  heading: "Explore famous destinations",
  description:
    "Whether you're seeking mountain adventures, wildlife encounters.",
};

export default function DestinationsBento({
  heading = DEFAULT_HEADING,
  items,
  resolved_items,
}: {
  heading?: CmsHeadingGroup;
  items?: BentoItem[];
  resolved_items?: BentoItem[];
} = {}) {
  const { data: apiDestinations, isLoading } = useDestinationsQuery();

  const cmsItems =
    resolved_items && resolved_items.length > 0 ? resolved_items : items;
  const apiCards: BentoItem[] = (apiDestinations ?? [])
    .slice(0, 5)
    .map((d) => ({
      title: d.title,
      image: { url: d.image },
      href: d.href || `/destinations/${d.slug || d.id}`,
      price: d.price,
    }));
  const cards: BentoItem[] =
    apiCards.length > 0 ? apiCards : (cmsItems || []).slice(0, 5);

  const showSkeleton = isLoading && !cmsItems && cards.length === 0;

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
      <div className="mb-14 flex flex-col gap-4">
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:h-[570px] lg:grid-cols-3 lg:grid-rows-2">
        {showSkeleton
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-[275px] lg:h-auto ${SLOT_PLACEMENT[i] ?? ""}`}
              >
                <CardSkeleton />
              </div>
            ))
          : cards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
                className={`h-[275px] lg:h-auto ${SLOT_PLACEMENT[i] ?? ""}`}
              >
                <DestinationCard
                  image={card.image?.url}
                  title={card.title}
                  href={card.href}
                  price={card.price}
                />
              </motion.div>
            ))}
      </div>
    </section>
  );
}
