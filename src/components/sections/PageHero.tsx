"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import SearchBar from "@/components/ui/SearchBar";
import type { CmsImage } from "@/lib/blocks";

/** PageHero — reusable puzzle-image + heading + subtitle + SearchBar hero, with a
 * staggered play-once entrance. Shared by the Packages and Destinations pages
 * (Figma 118:5899 / 84:1546). The hero image starts oversized (full-bleed,
 * matching Figma's width keyframe) and settles down to its resting size;
 * heading/subtitle/search-bar cascade in right after. */
const EASE_INOUT: [number, number, number, number] = [0.5, 0, 0.5, 1];
const EASE_EXPO_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

type PageHeroProps = {
  title: string;
  image?: CmsImage | string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  subtitle?: ReactNode;
  show_search?: boolean;
};

const DEFAULT_SUBTITLE = (
  <>
    We design meaningful travel experiences that connect you with nature,
    culture,{" "}
    <span className="italic text-[#909dad]">
      and unforgettable journey at a time.
    </span>
  </>
);

export default function PageHero({
  title,
  image,
  imageAlt = "",
  imageWidth = 565,
  imageHeight = 457,
  subtitle = DEFAULT_SUBTITLE,
  show_search = true,
}: PageHeroProps) {
  const imageSrc = typeof image === "string" ? image : image?.url;

  if (!imageSrc) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10 lg:py-16">
      <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
        <motion.div
          initial={{ scale: 1.32 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: EASE_EXPO_OUT }}
          className="relative w-full shrink-0"
          style={{ aspectRatio: `${imageWidth}/${imageHeight}`, maxWidth: imageWidth }}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes={`(max-width: 1024px) 100vw, ${imageWidth}px`}
            className="object-cover"
          />
        </motion.div>

        <div className="flex w-full flex-col gap-8 lg:max-w-[684px]">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE_INOUT, delay: 0.35 }}
            className="text-[clamp(2rem,4vw,40px)] font-bold tracking-[-0.06em] text-foreground"
          >
            {title}
            <span className="ml-2 inline-block size-3 rounded-full bg-primary-accent align-middle" />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_INOUT, delay: 0.55 }}
            className="font-body-alt text-[clamp(1.05rem,2vw,24px)] font-medium tracking-[-0.04em] text-[#3d4c5e]"
          >
            {subtitle}
          </motion.p>

          {show_search ? <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE_INOUT, delay: 0.75 }}
          >
            <SearchBar />
          </motion.div> : null}
        </div>
      </div>
    </section>
  );
}
