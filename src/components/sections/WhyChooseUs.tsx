"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import clsx from "clsx";
import { withHighlight } from "@/lib/highlightText";
import type { CmsHeadingGroup, CmsImage } from "@/lib/blocks";

/** Why Lumora Treks? — Figma node 83:919 (named "Stats Section"). Three service
 * blocks, the middle one dark, each with a rotated rounded image peeking out.
 *
 * Props mirror the backend `WhyChooseUsBlock`/`WhyChooseUsCardBlock`
 * (apps/cms/blocks/sections.py). Each card's `heading_highlight` accents a
 * word/phrase in italic primary-accent green; `description_highlight` accents
 * a phrase in a theme-dependent color (dark cards: light green `#c2ffb6`,
 * light cards: muted gray `#909dad`), matching Figma exactly. */

export type WhyChooseUsCard = {
  theme?: "light" | "dark";
  heading: string;
  heading_highlight?: string;
  description?: string;
  description_highlight?: string;
  image?: CmsImage;
};



const DEFAULT_HEADING: CmsHeadingGroup = {
  heading: "Why Lumora Treks?",
  description:
    "We make every journey effortless, memorable, and uniquely yours. From carefully curated destinations to trusted local expertise, we're committed to delivering travel experiences that go beyond expectations.",
};
const DEFAULT_DESCRIPTION_HIGHLIGHT =
  "we're committed to delivering travel experiences that go beyond expectations.";

export default function WhyChooseUs({
  heading = DEFAULT_HEADING,
  description_highlight = DEFAULT_DESCRIPTION_HIGHLIGHT,
  cards,
}: {
  heading?: CmsHeadingGroup;
  description_highlight?: string;
  cards?: WhyChooseUsCard[];
} = {}) {
  return (
    <section className="px-6 py-16 lg:py-24">
      <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-10">
        <div className="flex max-w-[1000px] flex-col items-center gap-5 text-center">
          {heading.heading && (
            <h2 className="text-[clamp(1.75rem,3vw,32px)] font-bold tracking-[-0.04em] text-foreground">
              {heading.heading}
            </h2>
          )}
          {heading.description && (
            <p className="font-body-alt text-[clamp(1.05rem,2vw,24px)] font-medium tracking-[-0.04em] text-text-secondary">
              {withHighlight(heading.description, description_highlight, "italic text-[#909dad]")}
            </p>
          )}
        </div>

        <div className="grid w-full gap-8 md:grid-cols-3">
          {cards && cards.length > 0
            ? cards.map((card, i) => (
                <motion.div
                  key={card.heading}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
                  className={clsx(
                    "relative flex h-[362px] flex-col justify-center gap-10 overflow-hidden rounded-2xl px-10 py-14",
                    card.theme === "dark" ? "bg-foreground" : "bg-background"
                  )}
                >
                  {card.image?.url && (
                    <div className="absolute -right-10 -top-16 size-52 rotate-[39deg] overflow-hidden rounded-[95px] shadow-[-4px_4px_12px_0_rgba(18,136,67,0.12)]">
                      <Image src={card.image.url} alt="" fill className="object-cover" />
                    </div>
                  )}
                  <p
                    className={clsx(
                      "relative text-2xl font-bold tracking-[-0.04em]",
                      card.theme === "dark" ? "text-background" : "text-foreground"
                    )}
                  >
                    {withHighlight(card.heading, card.heading_highlight, "italic text-primary-accent")}
                  </p>
                  {card.description && (
                    <p
                      className={clsx(
                        "relative font-body-alt text-base font-medium tracking-[-0.04em]",
                        card.theme === "dark" ? "text-[#ebffe8]" : "text-text-secondary"
                      )}
                    >
                      {withHighlight(
                        card.description,
                        card.description_highlight,
                        card.theme === "dark" ? "text-[#c2ffb6]" : "text-[#909dad]"
                      )}
                    </p>
                  )}
                </motion.div>
              ))
            : Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-[362px] flex-col justify-center gap-6 rounded-2xl bg-muted/40 p-10 animate-pulse"
                >
                  <div className="h-8 w-2/3 rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-4/5 rounded bg-muted" />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
