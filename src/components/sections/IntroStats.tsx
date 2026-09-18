"use client";

import { motion } from "framer-motion";
import { withHighlight } from "@/lib/highlightText";

/** Intro + stats — Figma node 49:561 ("Content Section"). Static in Figma; a
 * subtle scroll-reveal is added here for polish.
 *
 * Props mirror the backend `IntroStatsBlock` (apps/cms/blocks/sections.py) so
 * this renders unchanged whether called directly (landing page, all props
 * default to the original Figma copy) or via `<BlockRenderer>` from real CMS
 * data. */

export type StatItem = { value: string; label: string; icon?: string };

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
};

export default function IntroStats({
  heading = "We've helped thousands of travelers discover unforgettable journeys across the world",
  highlight = "unforgettable journeys",
  description = "From iconic landmarks to hidden gems, we curate authentic travel experiences that inspire exploration, create lasting memories, and make every journey seamless from start to finish.",
  description_highlight = "and make every journey seamless from start to finish.",
  stats,
}: {
  heading?: string;
  highlight?: string;
  description?: string;
  description_highlight?: string;
  stats?: StatItem[];
} = {}) {
  const statItems = stats ?? [];

  return (
    <section className="px-6 py-16 md:py-20 lg:py-24">
      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-10 text-center">
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center gap-5"
        >
          <h2 className="text-[clamp(1.75rem,4vw,40px)] font-bold leading-tight tracking-[-0.04em] text-foreground">
            {withHighlight(heading, highlight, "italic text-primary-accent")}
          </h2>

          {description && (
            <p className="max-w-[840px] font-body-alt text-[clamp(1.05rem,2.2vw,24px)] font-medium leading-snug tracking-[-0.04em] text-text-secondary">
              {withHighlight(
                description,
                description_highlight,
                "italic text-[#909dad]",
              )}
            </p>
          )}
        </motion.div>

        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="flex flex-wrap items-start justify-center gap-x-20 gap-y-8"
        >
          {statItems.length === 0
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 animate-pulse"
                >
                  <div className="h-10 w-24 rounded bg-muted" />
                  <div className="h-5 w-32 rounded bg-muted" />
                </div>
              ))
            : statItems.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="text-[40px] font-bold leading-tight tracking-[-0.04em] text-foreground">
                    {stat.value}
                  </span>
                  <span className="text-xl font-medium italic tracking-[-0.04em] text-text-secondary">
                    {stat.label}
                  </span>
                </div>
              ))}
        </motion.div>
      </div>
    </section>
  );
}
