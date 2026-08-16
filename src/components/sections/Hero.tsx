"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import SearchBar from "@/components/ui/SearchBar";
import { useDestinationsQuery } from "@/features/destinations/destinationQueries";

/**
 * Hero — Figma node 104:1763 ("prototype").
 *
 * Motion (Figma timeline, played once on load instead of Figma's boomerang loop):
 *  - Heading rises 67px into place (ease-in, ~0.85s).
 *  - Subtitle + search bar fade in after the heading settles (delay 0.85s, ~0.75s).
 *  - Destination card fades in over the same window (delay 0.85s, ~1.15s).
 *
 * The foreground mountain cutout (transparent PNG) sits ABOVE the heading, so the
 * peaks visually overlap the text — matching the Figma layering.
 *
 * `heading`/`subheading`/search copy mirror the backend `HeroBlock`
 * (apps/cms/blocks/sections.py). The background scene + mountain cutout are
 * NOT wired to `slides` yet: the cutout is a bespoke pre-cropped PNG for this
 * exact photo, not something derivable from an arbitrary CMS-uploaded image —
 * swapping backgrounds needs a per-slide cutout asset or a different treatment.
 */
export default function Hero({
  heading = "Travel beyond destinations",
  subheading = "Creating lifelong memories",
  show_search = true,
}: {
  heading?: string;
  subheading?: string;
  show_search?: boolean;
} = {}) {
  const { data: destinations } = useDestinationsQuery();
  const featured = destinations?.[0];

  return (
    <section className="w-full p-5">
      <div className="relative aspect-[1400/790] min-h-[560px] w-full overflow-hidden rounded-[2rem]">
        {/* Background scene */}
        <Image
          src="/images/hero-bg.png"
          alt="Snow-capped mountain landscape"
          fill
          priority
          sizes="(max-width: 1440px) 100vw, 1400px"
          className="object-cover"
        />

        {/* Heading — behind the foreground cutout */}
        <motion.h1
          initial={{ y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-x-0 top-[28%] z-10 px-6 text-center text-[clamp(2.5rem,8vw,100px)] font-extrabold leading-none tracking-[-0.06em] text-foreground"
        >
          {heading}
        </motion.h1>

        {/* Foreground mountain cutout — in front of the heading */}
        <Image
          src="/images/hero-foreground.png"
          alt=""
          aria-hidden
          fill
          priority
          sizes="(max-width: 1440px) 100vw, 1400px"
          className="pointer-events-none z-20 object-cover"
        />

        {/* Prev / next arrows */}
        <button
          type="button"
          aria-label="Previous"
          className="absolute left-4 top-1/2 z-30 flex size-7 -translate-y-1/2 items-center justify-center text-foreground transition-transform hover:-translate-x-0.5 hover:-translate-y-1/2"
        >
          <Icon icon="iconoir:nav-arrow-left" className="size-7" />
        </button>
        <button
          type="button"
          aria-label="Next"
          className="absolute right-4 top-1/2 z-30 flex size-7 -translate-y-1/2 items-center justify-center text-foreground transition-transform hover:translate-x-0.5 hover:-translate-y-1/2"
        >
          <Icon icon="iconoir:nav-arrow-right" className="size-7" />
        </button>

        {/* Bottom overlay: subtitle + search bar (left) and destination card (right) */}
        <div className="absolute inset-x-0 bottom-6 z-30 flex flex-col items-stretch gap-6 px-6 lg:bottom-8 lg:flex-row lg:items-end lg:justify-between lg:px-12">
          {/* subtitle-frame */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.55, ease: "easeOut" }}
            className="flex w-full flex-col gap-6 lg:max-w-[684px]"
          >
            <div className="flex items-end gap-2">
              <span className="text-[clamp(1.5rem,3vw,40px)] font-bold leading-none tracking-[-0.06em] text-white [text-shadow:0_2px_16px_rgb(0_0_0_/_45%)]">
                {subheading}
              </span>
              <span className="mb-1 size-3 shrink-0 rounded-full bg-primary-accent" />
            </div>

            {show_search && <SearchBar />}
          </motion.div>

          {/* destinations card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.55, ease: "easeOut" }}
            className="flex w-full flex-col gap-4 rounded-2xl bg-white p-6 lg:w-[354px] lg:shrink-0"
          >
            <Link
              href={featured?.href ?? "/destinations"}
              className="flex items-center justify-between"
            >
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {featured?.title ?? "Explore destinations"}
              </span>
              <Icon
                icon="iconoir:arrow-up-right"
                className="size-8 shrink-0 text-foreground"
              />
            </Link>
            <p className="text-base font-medium leading-snug tracking-tight text-text-secondary">
              {featured?.price
                ? `Starting from ${featured.price}`
                : "Discover handpicked trails, cities, and hidden gems across Nepal."}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
