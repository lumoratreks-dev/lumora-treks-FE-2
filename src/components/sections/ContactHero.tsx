"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { CmsImage } from "@/lib/blocks";

/** Contact Hero — Figma node 75:646. Puzzle image + editorial typographic block
 * ("Create Memories" / "Travel is more than a destination." / "beyond maps").
 * Props mirror the backend `ContactHeroBlock` (apps/cms/blocks/sections.py);
 * defaults reproduce the original Figma copy so the section degrades
 * gracefully if a field is left blank in the CMS. */
function highlightSplit(text: string, highlight?: string) {
  if (!highlight) return { before: text, highlighted: "", after: "" };
  const idx = text.indexOf(highlight);
  if (idx === -1) return { before: text, highlighted: "", after: "" };
  return {
    before: text.slice(0, idx),
    highlighted: highlight,
    after: text.slice(idx + highlight.length),
  };
}

export default function ContactHero({
  heading = "Create Memories",
  subtitle = "Mountains, forests, heritage sites, and hidden gems are just the beginning of your next adventure.",
  subtitle_highlight = "just the beginning of your next adventure.",
  tagline = "Travel is more than a destination.",
  tagline_highlight = "Travel",
  closing_heading = "beyond maps",
  closing_text = "We design meaningful travel experiences that connect you with nature, culture, and unforgettable journey at a time.",
  closing_text_highlight = "and unforgettable journey at a time.",
  image,
}: {
  heading?: string;
  subtitle?: string;
  subtitle_highlight?: string;
  tagline?: string;
  tagline_highlight?: string;
  closing_heading?: string;
  closing_text?: string;
  closing_text_highlight?: string;
  image?: CmsImage | string;
} = {}) {
  const subtitleParts = highlightSplit(subtitle, subtitle_highlight);
  const taglineParts = highlightSplit(tagline, tagline_highlight);
  const closingParts = highlightSplit(closing_text, closing_text_highlight);
  const imageSrc = typeof image === "string" ? image : image?.url;

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10 lg:py-16">
      <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative aspect-[523/455] w-full max-w-[523px] shrink-0"
        >
          <Image
            src={imageSrc || "/images/contact-hero.png"}
            alt="Nepal landscapes"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 523px"
            className="object-contain"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="flex w-full flex-col gap-8 lg:max-w-[691px]"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <h1 className="text-[clamp(2rem,4vw,40px)] font-bold tracking-[-0.04em] text-foreground">
              {heading}
            </h1>
            <p className="text-xl font-medium tracking-[-0.06em] text-text-secondary sm:max-w-[358px]">
              {subtitleParts.before}
              {subtitleParts.highlighted && (
                <span className="italic text-[#909dad]">{subtitleParts.highlighted}</span>
              )}
              {subtitleParts.after}
            </p>
          </div>

          <p className="text-[clamp(2rem,4vw,40px)] font-extrabold tracking-[-0.04em] text-foreground">
            {taglineParts.before}
            {taglineParts.highlighted && (
              <span className="italic text-primary-accent">{taglineParts.highlighted}</span>
            )}
            {taglineParts.after}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
            <p className="text-xl font-medium tracking-[-0.04em] text-[#3d4c5e] sm:max-w-[370px]">
              {closingParts.before}
              {closingParts.highlighted && (
                <span className="italic text-[#909dad]">{closingParts.highlighted}</span>
              )}
              {closingParts.after}
            </p>
            <h2 className="whitespace-nowrap text-[clamp(2rem,4vw,40px)] font-bold tracking-[-0.04em] text-foreground">
              {closing_heading}
              <span className="ml-2 inline-block size-2 rounded-full bg-primary-accent align-top" />
            </h2>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
