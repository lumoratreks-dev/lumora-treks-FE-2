"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import clsx from "clsx";
import SearchBar from "@/components/ui/SearchBar";
import { useDestinationsQuery } from "@/features/destinations/destinationQueries";
import type { CmsImage } from "@/lib/blocks";

/**
 * Hero — Figma node 104:1763 ("prototype").
 *
 * Mirrors the backend `HeroBlock` (apps/cms/blocks/sections.py): a heading,
 * subheading, search bar and a set of slides the arrows move between.
 *
 * Each slide has a background (image, or a video file) and may carry a
 * `foreground` cut-out — a transparent PNG made for that exact photo (the
 * mountain peaks). A cut-out is drawn in front of the heading so the heading
 * sits *behind* the scenery, matching the Figma layering. Slides without one
 * show the heading on top of the photo in a light, shadowed style instead.
 *
 * The card on the right highlights the slide's `destination`; slides without
 * one fall back to the first destination in the catalogue.
 *
 * Motion (Figma timeline, played once on load): the heading rises into place,
 * then the subtitle, search bar and destination card fade in.
 */

type CmsVideo = {
  source?: "file" | "embed";
  url?: string;
  poster?: CmsImage;
} | null;

type HeroDestination = {
  title: string;
  subtitle?: string;
  href?: string | null;
  slug?: string;
  starting_price?: number | null;
  currency?: string | null;
} | null;

export type HeroSlide = {
  image?: CmsImage;
  foreground?: CmsImage;
  video?: CmsVideo;
  alt?: string;
  heading_override?: string;
  destination?: HeroDestination;
};

/** Used when the CMS provides no slides: the bundled Figma scene. */
const DEFAULT_SLIDES: HeroSlide[] = [
  {
    image: { url: "/images/hero-bg.png" },
    foreground: { url: "/images/hero-foreground.png" },
    alt: "Snow-capped mountain landscape",
  },
];

const FADE = "transition-opacity duration-700 ease-out";

export default function Hero({
  heading = "Travel beyond destinations",
  subheading = "Creating lifelong memories",
  slides,
  show_search = true,
  search_location_label,
  search_location_placeholder,
  search_button_label,
}: {
  heading?: string;
  subheading?: string;
  slides?: HeroSlide[];
  show_search?: boolean;
  search_location_label?: string;
  search_location_placeholder?: string;
  search_button_label?: string;
} = {}) {
  const slideList = slides?.length ? slides : DEFAULT_SLIDES;
  const [activeIndex, setActiveIndex] = useState(0);
  const active = slideList[activeIndex] ?? slideList[0];
  const hasCutout = Boolean(active.foreground?.url);
  const headingText = active.heading_override || heading;

  const { data: destinations } = useDestinationsQuery();
  const fallback = destinations?.[0];
  const card = active.destination
    ? {
        title: active.destination.title,
        href: active.destination.href || `/destinations/${active.destination.slug}`,
        text:
          active.destination.starting_price != null
            ? `Starting from ${active.destination.currency || "USD"} ${active.destination.starting_price}`
            : active.destination.subtitle,
      }
    : fallback && {
        title: fallback.title,
        href: fallback.href,
        text: fallback.price ? `Starting from ${fallback.price}` : undefined,
      };

  const go = (step: number) =>
    setActiveIndex((index) => (index + step + slideList.length) % slideList.length);

  return (
    <section
      className="mx-auto w-full max-w-[1440px]"
      aria-roledescription="carousel"
      aria-label="Featured destinations"
    >
      <div className="relative aspect-[1400/790] min-h-[560px] w-full overflow-hidden rounded-[2rem]">
        {/* Backgrounds — every slide is mounted so switching is an instant crossfade. */}
        {slideList.map((slide, index) => {
          const isActive = index === activeIndex;
          const video = slide.video?.source === "file" ? slide.video : null;
          return (
            <div
              key={index}
              aria-hidden={!isActive}
              className={clsx("absolute inset-0", FADE, isActive ? "opacity-100" : "opacity-0")}
            >
              {video?.url ? (
                <video
                  src={video.url}
                  poster={video.poster?.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="size-full object-cover"
                />
              ) : (
                slide.image?.url && (
                  <Image
                    src={slide.image.url}
                    alt={isActive ? slide.alt || slide.image.alt || "" : ""}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1440px) 100vw, 1400px"
                    className="object-cover"
                  />
                )
              )}
              {!slide.foreground?.url && (
                // Keeps the light heading legible on any photo.
                <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/30" />
              )}
            </div>
          );
        })}

        {/* Heading — behind the foreground cut-out when the slide has one */}
        <motion.h1
          key={headingText}
          initial={{ y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className={clsx(
            "absolute inset-x-0 top-[28%] z-10 px-6 text-center text-[clamp(2.5rem,8vw,100px)] font-extrabold leading-none tracking-[-0.06em] transition-colors duration-700",
            hasCutout
              ? "text-foreground"
              : "text-white [text-shadow:0_4px_32px_rgb(0_0_0_/_40%)]",
          )}
        >
          {headingText}
        </motion.h1>

        {/* Foreground cut-outs — in front of the heading */}
        {slideList.map(
          (slide, index) =>
            slide.foreground?.url && (
              <Image
                key={index}
                src={slide.foreground.url}
                alt=""
                aria-hidden
                fill
                priority={index === 0}
                sizes="(max-width: 1440px) 100vw, 1400px"
                className={clsx(
                  "pointer-events-none z-20 object-cover",
                  FADE,
                  index === activeIndex ? "opacity-100" : "opacity-0",
                )}
              />
            ),
        )}

        {/* Prev / next arrows */}
        {slideList.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => go(-1)}
              className="absolute left-4 top-1/2 z-30 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background text-foreground shadow-md transition-transform hover:-translate-x-0.5"
            >
              <Icon icon="iconoir:nav-arrow-left" className="size-6" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(1)}
              className="absolute right-4 top-1/2 z-30 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background text-foreground shadow-md transition-transform hover:translate-x-0.5"
            >
              <Icon icon="iconoir:nav-arrow-right" className="size-6" />
            </button>
          </>
        )}

        {/* Bottom overlay: subtitle + search bar (left) and destination card (right) */}
        <div className="absolute inset-x-0 bottom-6 z-30 flex flex-col items-stretch gap-6 px-6 lg:bottom-8 lg:flex-row lg:items-end lg:justify-between lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.55, ease: "easeOut" }}
            className="flex w-full flex-col gap-6 lg:max-w-[684px]"
          >
            {subheading && (
              <div className="flex items-end gap-2">
                <span className="text-[clamp(1.5rem,3vw,40px)] font-bold leading-none tracking-[-0.06em] text-white [text-shadow:0_2px_16px_rgb(0_0_0_/_45%)]">
                  {subheading}
                </span>
                <span className="mb-1 size-3 shrink-0 rounded-full bg-primary-accent" />
              </div>
            )}

            {show_search && (
              <SearchBar
                label={search_location_label || undefined}
                placeholder={search_location_placeholder || undefined}
                buttonLabel={search_button_label || undefined}
              />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.55, ease: "easeOut" }}
            className="flex w-full flex-col gap-4 rounded-2xl bg-white p-6 lg:w-[354px] lg:shrink-0"
          >
            <Link
              href={card?.href ?? "/destinations"}
              className="flex items-center justify-between"
            >
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {card?.title ?? "Explore destinations"}
              </span>
              <Icon
                icon="iconoir:arrow-up-right"
                className="size-8 shrink-0 text-foreground"
              />
            </Link>
            <p className="text-base font-medium leading-snug tracking-tight text-text-secondary">
              {card?.text ||
                "Discover handpicked trails, cities, and hidden gems across Nepal."}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
