"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { withHighlight } from "@/lib/highlightText";
import type { CmsImage } from "@/lib/blocks";

/** Discover Nepal Through Authentic Experiences — Figma node 63:399.
 * Puzzle-masked image on the left, heading + numbered list on the right.
 *
 * Props mirror the backend `AuthenticExperiencesBlock`
 * (apps/cms/blocks/sections.py) — defaults are the original Figma copy so
 * this renders unchanged when called directly (no CMS data). */

export type AuthenticExperienceItem = {
  number?: string;
  title: string;
  description?: string;
};

export default function AuthenticExperiences({
  heading = "Discover Nepal Through Authentic Experiences with Us",
  description = "From the majestic Himalayas and ancient heritage sites to serene lakes and vibrant local cultures, Journeyfinder helps you experience Nepal beyond the ordinary.",
  description_highlight = "Journeyfinder helps you experience Nepal beyond the ordinary.",
  image,
  items,
  reversed = false,
}: {
  heading?: string;
  description?: string;
  description_highlight?: string;
  image?: CmsImage;
  items?: AuthenticExperienceItem[];
  reversed?: boolean;
} = {}) {
  console.log("image here", image);
  const imageSrc = image?.url || "/images/authentic-nepal.png";
  const imageAlt = image?.alt || "Ancient heritage temples in Nepal";
  const listItems = items ?? [];

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
      <div
        className={`flex flex-col items-center gap-10 lg:gap-16 ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"
          }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative aspect-square w-full max-w-[523px] shrink-0"
        >
          <Image
            src={imageSrc}
            // src="/images/seasonal-1.png"
            alt={imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 523px"
            className="object-cover"
          />
          {/* <div
            className="absolute -left-12 bottom-0 w-64 h-64 bg-white"
            style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
          /> */}
          {/* <div
            className="bg-white h-18 w-64 -start-[160px] -rotate-[20deg] absolute bottom-[30%] rounded-4xl">
          </div> */}
          {/* <div className="bg-white h-18 w-42 -start-[100px] -rotate-[20deg] absolute bottom-[30%] rounded-4xl"></div> */}

          {/*           
          <svg
            className="absolute top-[97px] right-0 w-1/3 h-auto fill-white pointer-events-none"
            viewBox="0 0 300 300"
          >
            <path d="M100,0 C180,20 220,120 180,180 C140,240 250,280 300,300 L300,0 Z" />
          </svg>  */}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="flex flex-1 flex-col gap-7"
        >
          <h2 className="text-[clamp(1.75rem,3vw,32px)] font-bold leading-[1.4] tracking-[-0.04em] text-foreground">
            {heading}
            <span className="ml-2 inline-block size-2 rounded-full bg-primary-accent align-middle" />
          </h2>
          {description && (
            <p className="font-body-alt text-[clamp(1.05rem,2vw,24px)] tracking-[-0.04em] text-text-secondary">
              {withHighlight(description, description_highlight, "text-[#909dad]")}
            </p>
          )}

          <div className="flex flex-col gap-6">
            {listItems.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="h-8 w-8 rounded bg-muted" />
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="h-6 w-1/3 rounded bg-muted" />
                    <div className="h-4 w-full rounded bg-muted" />
                  </div>
                </div>
              ))
            ) : (
              listItems.map((item, index) => (
                <div key={item.title} className="flex gap-4">
                  <span className="text-2xl font-bold tracking-[-0.04em] text-foreground">
                    {item.number || String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-1 flex-col gap-3">
                    <h3 className="text-2xl font-bold tracking-[-0.04em] text-foreground">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="font-body-alt text-xl tracking-[-0.04em] text-text-secondary">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
