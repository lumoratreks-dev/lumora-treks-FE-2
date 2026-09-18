"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import StarRating from "@/components/ui/StarRating";
import SocialShare from "@/components/ui/SocialShare";
import PackageReviews from "@/components/reviews/PackageReviews";
import type { CmsPackageDetail } from "@/lib/blocks";
import { sanitizePackageDescription } from "@/lib/richText";

/** Package detail — Figma node 150:10819 ("Main Content"). Distinct from the
 * destination detail: overview + key facts, gallery, things included, booking
 * card, itinerary (+ map), reviews. Content dummy; the seam for Travories. */

const sectionHeading =
  "text-2xl font-semibold tracking-[-0.04em] text-foreground";

function formatPrice(currency: string, amount: number) {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${currency || "USD"} ${formattedAmount}`;
}

function groupSizeLabel(minPeople: number, maxPeople: number | null) {
  if (maxPeople === null) return `Group of ${minPeople}+ people`;
  if (minPeople === maxPeople) {
    return `Group of ${minPeople} ${minPeople === 1 ? "person" : "people"}`;
  }

  return `Group of ${minPeople} – ${maxPeople} people`;
}

export default function PackageDetail({
  reserveHref: reserveHrefProp = "/checkout",
  packageData: packageDataProp,
  package: packageFromCms,
  reserve_href,
}: {
  reserveHref?: string;
  reserve_href?: string;
  packageData?: CmsPackageDetail;
  package?: CmsPackageDetail;
}) {
  // A Wagtail PackageDetail block always supplies `package`; direct callers
  // supply `packageData`. Keep this resolved before hooks so hook order is stable.
  const packageData = (packageDataProp || packageFromCms) as CmsPackageDetail;
  const reserveHref = reserve_href || reserveHrefProp;
  const [day, setDay] = useState(0);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(
    null,
  );
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [itineraryExpanded, setItineraryExpanded] = useState(false);
  const pricingTriggerRef = useRef<HTMLButtonElement>(null);
  const pricingDialogRef = useRef<HTMLDivElement>(null);
  const title = packageData.title;
  const rating = packageData.rating;
  const reviewCount = packageData.review_count;
  const keyFacts = [
    { icon: "bi:suitcase", label: "Trip Style", value: packageData.category },
    {
      icon: "lets-icons:speed",
      label: "Difficulty",
      value: packageData.difficulty,
    },
    {
      icon: "lucide:calendar",
      label: "Number of days",
      value: packageData.duration,
    },
  ];
  const galleryItems = packageData.gallery.length
    ? (packageData.gallery
        .map((item, index) => {
          const src = item.image?.src || item.image?.url;
          if (!src) return null;

          return {
            src,
            caption: item.caption || `${title} photo ${index + 1}`,
          };
        })
        .filter(Boolean) as Array<{ src: string; caption: string }>)
    : [];
  const galleryLarge = galleryItems.slice(0, 2);
  const gallerySmall = galleryItems.slice(2, 5);
  const itinerary = packageData.itinerary;
  const groupPricing = packageData.group_pricing ?? [];
  const dayLabels = itinerary.map((item) => item.day_label);
  const includedItems = packageData.included_items.filter(
    (item) => item.kind === "included",
  );
  const excludedItems = packageData.included_items.filter(
    (item) => item.kind === "excluded",
  );
  const currentGalleryIndex = activeGalleryIndex ?? 0;
  const activeGalleryItem =
    activeGalleryIndex === null ? null : galleryItems[activeGalleryIndex];

  useEffect(() => {
    if (activeGalleryIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveGalleryIndex(null);
        return;
      }

      if (event.key === "ArrowRight") {
        setActiveGalleryIndex((current) => {
          if (current === null) return current;
          return (current + 1) % galleryItems.length;
        });
      }

      if (event.key === "ArrowLeft") {
        setActiveGalleryIndex((current) => {
          if (current === null) return current;
          return (current - 1 + galleryItems.length) % galleryItems.length;
        });
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeGalleryIndex, galleryItems.length]);

  useEffect(() => {
    if (!isPricingOpen) return;

    const previousOverflow = document.body.style.overflow;
    const pricingTrigger = pricingTriggerRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPricingOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements =
        pricingDialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
      if (!focusableElements?.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      pricingTrigger?.focus();
    };
  }, [isPricingOpen]);

  return (
    <>
      <section className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-8 lg:px-20">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <nav className="flex flex-wrap items-center gap-2 font-body-alt text-base tracking-[-0.02em] text-text-secondary">
            <Link href="/packages">Packages</Link>
            <Icon icon="iconoir:nav-arrow-right" className="size-4" />
            <span className="font-medium text-[#2bbf0f] underline">
              {title}
            </span>
          </nav>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-[28px] font-bold tracking-[-0.04em] text-foreground">
              {title}
            </h1>
            <SocialShare title={title} />
          </div>
          <div className="flex items-center gap-3">
            {reviewCount > 0 ? (
              <>
                <span className="font-medium text-text-secondary">
                  {rating.toFixed(1)}
                </span>
                <StarRating rating={rating} starSize={20} />
                <span className="size-1 rounded-full bg-text-secondary" />
                <a
                  href="#reviews"
                  className="text-lg text-text-secondary underline underline-offset-4"
                >
                  ({reviewCount} Reviews)
                </a>
              </>
            ) : (
              <a
                href="#reviews"
                className="font-body-alt text-base font-semibold text-primary-active underline underline-offset-4"
              >
                Be the first to review
              </a>
            )}
          </div>
        </div>

        {/* Overview + Key Facts | Gallery */}
        <div className="flex flex-col gap-10 border-b border-border pb-6 lg:flex-row lg:items-start lg:gap-10">
          <div className="flex flex-col gap-6 lg:w-[644px]">
            <div className="flex flex-col gap-5 border-b border-border pb-6">
              <h2 className={sectionHeading}>Overview</h2>
              {packageData.description ? (
                <div
                  className={`font-body-alt text-lg leading-[1.6] tracking-[-0.02em] text-text-secondary [&_p+p]:mt-4 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li+li]:mt-2 [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-semibold [&_b]:font-semibold [&_em]:italic [&_i]:italic [&>:first-child]:mt-0 [&>:last-child]:mb-0${overviewExpanded ? "" : " line-clamp-3"}`}
                  dangerouslySetInnerHTML={{
                    __html: sanitizePackageDescription(packageData.description),
                  }}
                />
              ) : (
                <p
                  className={`font-body-alt text-lg leading-[1.6] tracking-[-0.02em] text-text-secondary${overviewExpanded ? "" : " line-clamp-3"}`}
                >
                  {packageData.summary}
                </p>
              )}
              <button
                type="button"
                onClick={() => setOverviewExpanded((v) => !v)}
                className="self-start font-body-alt text-lg font-semibold tracking-[-0.02em] text-primary-active underline underline-offset-4"
                aria-expanded={overviewExpanded}
              >
                {overviewExpanded ? "See less" : "See more"}
              </button>
            </div>
            <div className="flex flex-col gap-5">
              <h2 className={sectionHeading}>Key Facts</h2>
              <div className="flex gap-12">
                <div className="flex flex-col gap-4">
                  {keyFacts.map((f) => (
                    <div key={f.label} className="flex items-center gap-2">
                      <Icon
                        icon={f.icon}
                        className="size-5 text-text-secondary"
                      />
                      <span className="font-body-alt text-lg capitalize tracking-[-0.02em] text-text-secondary">
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-4">
                  {keyFacts.map((f) => (
                    <span
                      key={f.label}
                      className="font-body-alt text-lg capitalize tracking-[-0.04em] text-foreground"
                    >
                      {f.value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Gallery */}
          {galleryItems.length > 0 && (
            <div className="flex flex-1 flex-col gap-2">
              {galleryItems.length === 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveGalleryIndex(0)}
                  className="group relative h-[360px] overflow-hidden rounded-2xl text-left"
                  aria-label="Open package photo"
                >
                  <Image
                    src={galleryItems[0].src}
                    alt={galleryItems[0].caption}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    priority
                  />
                  <span className="absolute bottom-4 left-4 rounded-full bg-black/55 px-3 py-1.5 font-body-alt text-xs font-semibold text-white">
                    View photo
                  </span>
                </button>
              ) : (
                <>
                  <div className="grid h-[335px] grid-cols-2 gap-2">
                    {galleryLarge.map((item, i) => (
                      <button
                        key={item.src}
                        type="button"
                        onClick={() => setActiveGalleryIndex(i)}
                        className="group relative overflow-hidden rounded-lg text-left"
                        aria-label={`Open photo ${i + 1} of ${galleryItems.length}`}
                      >
                        <Image
                          src={item.src}
                          alt={item.caption}
                          fill
                          sizes="320px"
                          className="object-cover transition duration-300 group-hover:scale-105"
                          priority={i === 0}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="grid h-[125px] grid-cols-3 gap-4">
                    {gallerySmall.map((item, i) => {
                      const itemIndex = i + 2;

                      return (
                        <button
                          key={item.src}
                          type="button"
                          onClick={() => setActiveGalleryIndex(itemIndex)}
                          className="group relative overflow-hidden rounded-lg text-left"
                          aria-label={`Open photo ${itemIndex + 1} of ${galleryItems.length}`}
                        >
                          <Image
                            src={item.src}
                            alt={item.caption}
                            fill
                            sizes="200px"
                            className="object-cover transition duration-300 group-hover:scale-105"
                          />
                          {i === gallerySmall.length - 1 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <span className="font-body-alt text-2xl tracking-[-0.02em] text-white">
                                {galleryItems.length - itemIndex - 1 > 0
                                  ? `+ ${galleryItems.length - itemIndex - 1} Photos`
                                  : "View Photos"}
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Things Included | Booking card */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-1 flex-col gap-6">
            <h2 className={sectionHeading}>What’s included</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f4f8ef] p-5">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary-active text-white">
                    <Icon icon="iconoir:check" className="size-4" />
                  </span>
                  <p className="font-semibold text-foreground">Included</p>
                </div>
                <ul className="mt-4 space-y-3 font-body-alt text-sm leading-relaxed text-text-secondary">
                  {includedItems.map((item) => (
                    <li key={item.text} className="flex gap-2.5">
                      <Icon
                        icon="iconoir:check-circle-solid"
                        className="mt-0.5 size-4 shrink-0 text-primary-active"
                      />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-text-secondary text-white">
                    <Icon icon="iconoir:xmark" className="size-4" />
                  </span>
                  <p className="font-semibold text-foreground">Not included</p>
                </div>
                <ul className="mt-4 space-y-3 font-body-alt text-sm leading-relaxed text-text-secondary">
                  {excludedItems.map((item) => (
                    <li key={item.text} className="flex gap-2.5">
                      <Icon
                        icon="iconoir:cancel"
                        className="mt-0.5 size-4 shrink-0 text-text-muted"
                      />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Booking card */}
          <aside className="flex w-full flex-col gap-6 rounded-lg border border-border bg-surface p-6 lg:w-[494px] lg:shrink-0">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
              <span className="font-body-alt text-base tracking-[-0.03em] text-text-secondary">
                Price per adult
              </span>
              <div className="flex flex-col items-end gap-1">
                <span className="font-body-alt text-xl tracking-[-0.03em] text-foreground">
                  {packageData.currency} {packageData.price}
                </span>
                {groupPricing.length > 0 && (
                  <button
                    ref={pricingTriggerRef}
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded={isPricingOpen}
                    aria-controls="package-pricing-dialog"
                    onClick={() => setIsPricingOpen(true)}
                    className="font-body-alt text-sm font-semibold text-primary-active underline decoration-1 underline-offset-4 transition-opacity hover:opacity-75"
                  >
                    Pricing details
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="rounded-xl bg-background p-4 font-body-alt text-sm leading-relaxed text-text-secondary">
                Choose your dates and group size with our travel team. This trip
                is limited to {packageData.people_count} guests.
              </div>
              <div className="flex flex-col gap-4">
                <Link
                  href={reserveHref}
                  className="flex w-full items-center justify-center rounded-lg bg-foreground p-3 font-body-alt text-base font-medium tracking-[-0.03em] text-background transition-transform hover:scale-[1.02] active:scale-95"
                >
                  Ask about this trip
                </Link>
                <p className="text-center font-body-alt text-sm tracking-[-0.04em] text-text-secondary">
                  We’ll confirm availability and the final itinerary before you
                  book.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Itinerary + Map */}
        {itinerary.length > 0 && (
          <div className="flex flex-col gap-8 border-y border-border py-8 lg:flex-row lg:items-stretch lg:gap-8">
            <div className="flex flex-1 flex-col gap-6">
              <h2 className={sectionHeading}>Itinerary</h2>
              <div className="flex gap-2">
                {dayLabels.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDay(i);
                      setItineraryExpanded(false);
                    }}
                    className={
                      i === day
                        ? "rounded bg-foreground p-3 font-body-alt text-base text-background"
                        : "rounded bg-background p-3 font-body-alt text-base text-foreground"
                    }
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-5 rounded-lg border border-border p-6">
                <div className="flex items-start justify-between gap-4">
                  <p className="font-body-alt text-xl tracking-[-0.04em] text-foreground">
                    {itinerary[day]?.title}
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <p className="font-body-alt text-lg tracking-[-0.04em] text-foreground">
                    Description
                  </p>
                  <p
                    className={`font-body-alt text-base leading-[1.6] tracking-[-0.02em] text-text-secondary${itineraryExpanded ? "" : " line-clamp-6"}`}
                  >
                    {itinerary[day]?.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => setItineraryExpanded((v) => !v)}
                    className="self-start font-body-alt text-base font-semibold tracking-[-0.02em] text-primary-active underline underline-offset-4"
                    aria-expanded={itineraryExpanded}
                  >
                    {itineraryExpanded ? "See less" : "See more"}
                  </button>
                </div>
              </div>
            </div>
            {itinerary[day]?.image && (
              <div className="relative h-[300px] w-full overflow-hidden rounded-2xl lg:h-auto lg:w-[517px] lg:shrink-0">
                <Image
                  src={
                    itinerary[day].image?.src || itinerary[day].image?.url || ""
                  }
                  alt={itinerary[day].title}
                  fill
                  sizes="517px"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        )}

        {packageData && (
          <PackageReviews
            packageId={packageData.id}
            packageSlug={packageData.slug}
            initialAverage={rating}
            initialCount={reviewCount}
            testimonials={packageData.testimonials.map((item) => ({
              id: item.id,
              author_name: item.author_name,
              rating: item.rating,
              quote: item.quote,
            }))}
          />
        )}
      </section>

      {activeGalleryItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} gallery`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white sm:px-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium tracking-[0.02em] text-white/70">
                  {currentGalleryIndex + 1} / {galleryItems.length}
                </span>
                <span className="line-clamp-1 text-sm font-medium">
                  {title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveGalleryIndex(null)}
                className="rounded-full p-2 text-white transition hover:bg-white/10"
                aria-label="Close gallery"
              >
                <Icon icon="iconoir:xmark" className="size-6" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="relative flex min-h-0 items-center justify-center px-4 py-4 sm:px-6 lg:px-10">
                <button
                  type="button"
                  onClick={() =>
                    setActiveGalleryIndex(
                      (currentGalleryIndex - 1 + galleryItems.length) %
                        galleryItems.length,
                    )
                  }
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/45 p-3 text-white transition hover:bg-black/65"
                  aria-label="Previous photo"
                >
                  <Icon icon="iconoir:nav-arrow-left" className="size-6" />
                </button>

                <div className="relative h-full max-h-[78vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-black">
                  <Image
                    src={activeGalleryItem.src}
                    alt={activeGalleryItem.caption}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setActiveGalleryIndex(
                      (currentGalleryIndex + 1) % galleryItems.length,
                    )
                  }
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/45 p-3 text-white transition hover:bg-black/65"
                  aria-label="Next photo"
                >
                  <Icon icon="iconoir:nav-arrow-right" className="size-6" />
                </button>
              </div>

              <aside className="flex min-h-0 flex-col border-t border-white/10 bg-[#111111] text-white lg:border-l lg:border-t-0">
                <div className="border-b border-white/10 px-5 py-4">
                  <p className="text-base font-semibold">
                    {activeGalleryItem.caption}
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    Browse all package photos
                  </p>
                </div>
                <div className="grid min-h-0 grid-cols-3 gap-2 overflow-y-auto p-4 sm:grid-cols-4 lg:grid-cols-3">
                  {galleryItems.map((item, index) => (
                    <button
                      key={`${item.src}-${index}`}
                      type="button"
                      onClick={() => setActiveGalleryIndex(index)}
                      className={
                        index === activeGalleryIndex
                          ? "relative aspect-square overflow-hidden rounded-xl ring-2 ring-white"
                          : "relative aspect-square overflow-hidden rounded-xl opacity-70 transition hover:opacity-100"
                      }
                      aria-label={`View photo ${index + 1}`}
                    >
                      <Image
                        src={item.src}
                        alt={item.caption}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}

      {isPricingOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsPricingOpen(false);
          }}
        >
          <div
            ref={pricingDialogRef}
            id="package-pricing-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="package-pricing-title"
            aria-describedby="package-pricing-description"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-[650px] overflow-y-auto rounded-2xl bg-surface p-5 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <h2
                  id="package-pricing-title"
                  className="text-[28px] font-semibold tracking-[-0.04em] text-[#00000] sm:text-3xl"
                >
                  Pricing Details
                </h2>
                <p
                  id="package-pricing-description"
                  className="mt-2 font-body-alt text-base leading-relaxed tracking-[-0.02em] text-text-secondary sm:text-lg"
                >
                  Prices vary based on group size. All prices are per person.
                </p>
              </div>
              <button
                type="button"
                autoFocus
                onClick={() => setIsPricingOpen(false)}
                aria-label="Close pricing details"
                className="-mr-2 -mt-2 shrink-0 rounded-full p-2 text-foreground transition hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-active"
              >
                <Icon icon="iconoir:xmark" className="size-8" />
              </button>
            </div>

            <h3 className="mt-8 text-xl font-semibold tracking-[-0.03em] text-[#00000] sm:text-2xl">
              Group Size Pricing Per Person:
            </h3>
            <ul className="mt-5 space-y-3" aria-label="Group prices per person">
              {groupPricing.map((tier, index) => (
                <li
                  key={`${tier.min_people}-${tier.max_people ?? "plus"}-${index}`}
                  className="flex flex-col gap-1 rounded-lg border border-border px-4 py-4 font-body-alt sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <span className="text-base tracking-[-0.02em] text-text-secondary sm:text-lg">
                    {groupSizeLabel(tier.min_people, tier.max_people)}
                  </span>
                  <span className="shrink-0 text-lg font-semibold tracking-[-0.03em] text-[#00000] sm:text-xl">
                    {formatPrice(packageData.currency, tier.price_per_person)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
