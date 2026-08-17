"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import CarouselNav from "@/components/ui/CarouselNav";
import { useDestinationsQuery } from "@/features/destinations/destinationQueries";
import { withHighlight } from "@/lib/highlightText";
import type { CmsImage } from "@/lib/blocks";
import useEmblaCarousel from "embla-carousel-react";

/** Experience Section — Figma node 49:449.
 * Responsive Carousel displaying dynamic CMS and API destination data. */

export type ExperienceCard = {
  title: string;
  image?: CmsImage;
  href?: string;
  description?: string;
  subtitle?: string
};

function slugifyTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ExperienceSection({
  heading = "Discover the soul of Nepal with major hospitality of Lumora Treks",
  description = "From the snow-capped Himalayas to ancient heritage cities and lush wildlife reserves, every destination is carefully selected to offer authentic experiences, breathtaking scenery, and unforgettable memories.",
  description_highlight = "offer authentic experiences, breathtaking scenery, and unforgettable memories.",
  show_arrows = true,
  small_cards,
  feature_card,
}: {
  heading?: string;
  description?: string;
  description_highlight?: string;
  show_arrows?: boolean;
  small_cards?: ExperienceCard[];
  feature_card?: ExperienceCard;
} = {}) {
  const { data: destinations } = useDestinationsQuery();

  const cmsCards: ExperienceCard[] = [
    ...(feature_card ? [feature_card] : []),
    ...(small_cards ?? []),
  ];



  const queryCards: ExperienceCard[] = (destinations ?? []).map((dest: any) => ({
    title: dest.title,
    description: dest.subtitle || (dest.price ? `Starting from ${dest.price}` : undefined),
    image: dest.image ? { url: dest.image } : undefined,
    href: dest.href || `/destinations/${dest.slug}`,
  }));

  const cardsList = cmsCards.length > 0 ? cmsCards : queryCards;


  console.log("cardlists here are", cardsList)
  const [activeIndex, setActiveIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    slidesToScroll: 1,
    containScroll: false,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const snapIndex = emblaApi.selectedScrollSnap();
    if (snapIndex >= 0 && snapIndex < cardsList.length) {
      setActiveIndex(snapIndex);
    }
  }, [emblaApi, cardsList.length]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const handleSelectCard = (index: number) => {
    setActiveIndex(index);
    emblaApi?.scrollTo(index);
  };

  const destinationsByTitle = new Map(
    (destinations ?? []).map((destination) => [
      destination.title.trim().toLowerCase(),
      destination,
    ])
  );

  const resolveDestinationHref = (card?: ExperienceCard) => {
    if (!card) return undefined;
    if (card.href) return card.href;

    const match = destinationsByTitle.get(card.title.trim().toLowerCase());
    if (match?.href) return match.href;
    if (match?.slug) return `/destinations/${match.slug}`;

    return `/destinations/${slugifyTitle(card.title)}`;
  };

  const activeCard = cardsList[activeIndex] || cardsList[0];

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-8">
        {/* Left column: Headings, Carousel Nav, Small Cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-1 flex-col gap-8 lg:gap-12"
        >
          <div className="flex flex-col gap-6">
            <h2 className="text-[clamp(1.75rem,3vw,32px)] font-bold leading-[1.35] tracking-[-0.04em] text-foreground">
              {heading}
              <span className="ml-2 inline-block size-2 rounded-full bg-primary-accent align-middle" />
            </h2>
            {description && (
              <p className="font-body-alt text-[clamp(1.05rem,2vw,24px)] leading-snug tracking-[-0.04em] text-text-secondary">
                {withHighlight(description, description_highlight, "italic text-[#909dad]")}
              </p>
            )}
            {show_arrows && cardsList.length > 0 && (
              <CarouselNav
                onPrev={scrollPrev}
                onNext={scrollNext}
                prevDisabled={cardsList.length <= 1}
                nextDisabled={cardsList.length <= 1}
              />
            )}
          </div>

          {/* Small destination cards responsive carousel */}
          {cardsList.length === 0 ? (
            <div className="flex gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[180px] sm:h-[210px] flex-1 min-w-0 rounded-2xl bg-muted/40 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden p-1" ref={emblaRef}>
              <div className="flex gap-4">
                {cardsList.map((card, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <div
                      key={card.title + idx}
                      onClick={() => handleSelectCard(idx)}
                      className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_48%] md:flex-[0_0_calc(33.333%-11px)]"
                    >
                      <div
                        className={clsx(
                          "relative flex h-[180px] sm:h-[210px] cursor-pointer items-end justify-center overflow-hidden rounded-2xl p-4 transition-all duration-300",
                          isActive
                            ? "ring-2 ring-primary-accent scale-[1.02] shadow-xl grayscale-0"
                            : "grayscale opacity-75 hover:grayscale-0 hover:opacity-100 hover:scale-[1.01]"
                        )}
                      >
                        <Image
                          src={card.image?.url || "/images/destination-card-default.png"}
                          alt={card.title}
                          fill
                          sizes="(max-width: 768px) 80vw, 220px"
                          className="object-cover"
                        />
                        <div
                          className={clsx(
                            "absolute inset-0 transition-opacity duration-300",
                            isActive ? "bg-black/20" : "bg-black/45"
                          )}
                        />
                        <span className="relative z-10 truncate text-center text-base font-semibold tracking-[-0.04em] text-text-inverse sm:text-lg">
                          {card.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Right column: Big feature card displaying active image in full color */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="min-h-[420px] w-full lg:w-[580px] xl:w-[622px] lg:shrink-0"
        >
          {cardsList.length === 0 ? (
            <div className="h-full min-h-[420px] w-full rounded-2xl bg-muted/40 animate-pulse" />
          ) : (
            <AnimatePresence mode="wait">
              {activeCard && (
                <motion.div
                  key={activeCard.title + activeIndex}
                  initial={{ opacity: 0.4, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.4, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="relative flex h-full min-h-[420px] flex-col justify-end overflow-hidden rounded-2xl p-6 shadow-2xl"
                >
                  <Image
                    src={activeCard.image?.url || "/images/destination-card-default.png"}
                    alt={activeCard.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 622px"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="relative z-10 flex flex-col gap-4 rounded-xl bg-background/90 p-6 backdrop-blur-md">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="truncate text-xl font-bold tracking-[-0.04em] text-foreground sm:text-2xl">
                        {activeCard.title}
                      </h3>
                      <Link
                        href={resolveDestinationHref(activeCard) ?? "/destinations"}
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-110"
                      >
                        <Icon icon="iconoir:arrow-up-right" className="size-5 text-background" />
                      </Link>
                    </div>
                    {activeCard.description && (
                      <p className="font-body-alt text-base tracking-[-0.04em] text-text-secondary">
                        {activeCard.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </section>
  );
}
