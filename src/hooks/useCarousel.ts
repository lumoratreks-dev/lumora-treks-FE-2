"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

type CarouselOptions = Parameters<typeof useEmblaCarousel>[0];

/** Thin wrapper over Embla: returns the viewport ref, scroll actions,
 * whether prev/next are possible (to disable `CarouselNav` at the ends), and
 * whether there is anything to scroll at all (`canScroll` — false when every
 * card already fits, so callers can hide the arrows instead of showing
 * controls that do nothing). */
export function useCarousel(options?: CarouselOptions) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    ...options,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
    setCanScroll(emblaApi.scrollSnapList().length > 1);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const frame = requestAnimationFrame(onSelect);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      cancelAnimationFrame(frame);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return { emblaRef, scrollPrev, scrollNext, canPrev, canNext, canScroll };
}
