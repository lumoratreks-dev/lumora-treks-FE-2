"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import PackageReviews from "@/components/reviews/PackageReviews";
import StarRating from "@/components/ui/StarRating";
import SocialShare from "@/components/ui/SocialShare";
import type { CmsPackageDetail } from "@/lib/blocks";
import { sanitizePackageDescription } from "@/lib/richText";

type PackageSectionProps = {
  packageData: CmsPackageDetail;
  reserveHref?: string;
  reserve_href?: string;
};
const sectionHeading =
  "text-2xl font-semibold tracking-[-0.04em] text-foreground";

function galleryItems(packageData: CmsPackageDetail) {
  return packageData.gallery.flatMap((item, index) => {
    const src = item.image?.src || item.image?.url;
    return src
      ? [
          {
            src,
            caption: item.caption || `${packageData.title} photo ${index + 1}`,
          },
        ]
      : [];
  });
}

function groupSizeLabel(minPeople: number, maxPeople: number | null) {
  if (maxPeople === null) return `Group of ${minPeople}+ people`;
  if (minPeople === maxPeople)
    return `Group of ${minPeople} ${minPeople === 1 ? "person" : "people"}`;
  return `Group of ${minPeople} – ${maxPeople} people`;
}

function formatPrice(currency: string, amount: number) {
  return `${currency || "USD"} ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)}`;
}

export function PackageHeader({ packageData }: PackageSectionProps) {
  return (
    <header className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 border-b border-border px-6 py-8 lg:px-20 lg:py-12">
      <nav
        className="flex flex-wrap items-center gap-2 font-body-alt text-base tracking-[-0.02em] text-text-secondary"
        aria-label="Breadcrumb"
      >
        <Link href="/packages">Packages</Link>
        <Icon icon="iconoir:nav-arrow-right" className="size-4" />
        <span className="font-medium text-primary-active underline">
          {packageData.title}
        </span>
      </nav>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[clamp(1.75rem,4vw,3.5rem)] font-bold tracking-[-0.05em] text-foreground">
          {packageData.title}
        </h1>
        <SocialShare title={packageData.title} />
      </div>
      <div className="flex items-center gap-3">
        {packageData.review_count > 0 ? (
          <>
            <span className="font-medium text-text-secondary">
              {packageData.rating.toFixed(1)}
            </span>
            <StarRating rating={packageData.rating} starSize={20} />
            <span className="size-1 rounded-full bg-text-secondary" />
            <a
              href="#reviews"
              className="text-lg text-text-secondary underline underline-offset-4"
            >
              ({packageData.review_count} Reviews)
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
    </header>
  );
}

export function PackageOverview({ packageData }: PackageSectionProps) {
  const items = galleryItems(packageData);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex === null ? null : items[activeIndex];
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

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight")
        setActiveIndex((current) =>
          current === null ? current : (current + 1) % items.length,
        );
      if (event.key === "ArrowLeft")
        setActiveIndex((current) =>
          current === null
            ? current
            : (current - 1 + items.length) % items.length,
        );
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, items.length]);

  return (
    <>
      <section className="mx-auto flex min-h-[70vh] w-full max-w-[1440px] flex-col gap-10 border-b border-border px-6 py-10 lg:flex-row lg:px-20 lg:py-14">
        <div className="flex flex-col gap-6 lg:w-[644px]">
          <div className="flex flex-col gap-5 border-b border-border pb-6">
            <h2 className={sectionHeading}>Overview</h2>
            {packageData.description ? (
              <div
                className="font-body-alt text-lg leading-[1.6] tracking-[-0.02em] text-text-secondary [&_p+p]:mt-4 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li+li]:mt-2 [&_a]:underline [&_strong]:font-semibold [&_em]:italic"
                dangerouslySetInnerHTML={{
                  __html: sanitizePackageDescription(packageData.description),
                }}
              />
            ) : (
              <p className="font-body-alt text-lg leading-[1.6] text-text-secondary">
                {packageData.summary}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-5">
            <h2 className={sectionHeading}>Key Facts</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {keyFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-xl border border-border p-4"
                >
                  <Icon
                    icon={fact.icon}
                    className="size-5 text-text-secondary"
                  />
                  <p className="mt-3 font-body-alt text-sm text-text-secondary">
                    {fact.label}
                  </p>
                  <p className="mt-1 font-body-alt text-base capitalize text-foreground">
                    {fact.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {items.length > 0 && (
          <div className="grid min-h-[420px] flex-1 grid-cols-2 gap-2">
            {items.slice(0, 4).map((item, index) => (
              <button
                key={`${item.src}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className="group relative overflow-hidden rounded-xl"
                aria-label={`Open photo ${index + 1} of ${items.length}`}
              >
                <Image
                  src={item.src}
                  alt={item.caption}
                  fill
                  sizes="(max-width: 1024px) 50vw, 24vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                  priority={index === 0}
                />
                {index === Math.min(items.length, 4) - 1 && (
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1.5 font-body-alt text-xs font-semibold text-white">
                    View {items.length} photos
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </section>
      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label={`${packageData.title} gallery`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-3 text-white">
            <span className="text-sm">
              {activeIndex! + 1} / {items.length} · {activeItem.caption}
            </span>
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="rounded-full p-2 hover:bg-white/10"
              aria-label="Close gallery"
            >
              <Icon icon="iconoir:xmark" className="size-6" />
            </button>
          </div>
          <div className="relative flex-1 p-6">
            <button
              type="button"
              onClick={() =>
                setActiveIndex((activeIndex! - 1 + items.length) % items.length)
              }
              className="absolute left-5 top-1/2 z-10 rounded-full bg-black/50 p-3 text-white"
              aria-label="Previous photo"
            >
              <Icon icon="iconoir:nav-arrow-left" className="size-6" />
            </button>
            <div className="relative h-full w-full">
              <Image
                src={activeItem.src}
                alt={activeItem.caption}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
            <button
              type="button"
              onClick={() => setActiveIndex((activeIndex! + 1) % items.length)}
              className="absolute right-5 top-1/2 z-10 rounded-full bg-black/50 p-3 text-white"
              aria-label="Next photo"
            >
              <Icon icon="iconoir:nav-arrow-right" className="size-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function PackageBooking({
  packageData,
  reserveHref,
  reserve_href,
}: PackageSectionProps) {
  const [pricingOpen, setPricingOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const included = packageData.included_items.filter(
    (item) => item.kind === "included",
  );
  const excluded = packageData.included_items.filter(
    (item) => item.kind === "excluded",
  );
  const groupPricing = packageData.group_pricing || [];

  useEffect(() => {
    if (!pricingOpen) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPricingOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [pricingOpen]);

  return (
    <>
      <section className="mx-auto flex min-h-[65vh] w-full max-w-[1440px] flex-col gap-8 border-b border-border px-6 py-12 lg:flex-row lg:items-start lg:px-20 lg:py-16">
        <div className="flex flex-1 flex-col gap-6">
          <h2 className={sectionHeading}>What’s included</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#f4f8ef] p-5">
              <p className="font-semibold text-foreground">Included</p>
              <ul className="mt-4 space-y-3 font-body-alt text-sm leading-relaxed text-text-secondary">
                {included.map((item) => (
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
              <p className="font-semibold text-foreground">Not included</p>
              <ul className="mt-4 space-y-3 font-body-alt text-sm leading-relaxed text-text-secondary">
                {excluded.map((item) => (
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
        <aside className="flex w-full flex-col gap-6 rounded-lg border border-border bg-surface p-6 lg:w-[494px] lg:shrink-0">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
            <span className="font-body-alt text-base text-text-secondary">
              Price per adult
            </span>
            <div className="flex flex-col items-end gap-1">
              <span className="font-body-alt text-xl text-foreground">
                {packageData.currency} {packageData.price}
              </span>
              {groupPricing.length > 0 && (
                <button
                  ref={triggerRef}
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={pricingOpen}
                  onClick={() => setPricingOpen(true)}
                  className="font-body-alt text-sm font-semibold text-primary-active underline underline-offset-4"
                >
                  Pricing details
                </button>
              )}
            </div>
          </div>
          <div className="rounded-xl bg-background p-4 font-body-alt text-sm leading-relaxed text-text-secondary">
            Choose your dates and group size with our travel team. This trip is
            limited to {packageData.people_count} guests.
          </div>
          <Link
            href={
              reserve_href ||
              reserveHref ||
              `/enquiry?package=${encodeURIComponent(packageData.slug)}`
            }
            className="flex w-full items-center justify-center rounded-lg bg-foreground p-3 font-body-alt text-base font-medium text-background"
          >
            Ask about this trip
          </Link>
          <p className="text-center font-body-alt text-sm text-text-secondary">
            We’ll confirm availability and the final itinerary before you book.
          </p>
        </aside>
      </section>
      {pricingOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPricingOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="package-pricing-title"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-[650px] overflow-y-auto rounded-2xl bg-surface p-5 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <h2
                  id="package-pricing-title"
                  className="text-[28px] font-semibold tracking-[-0.04em] text-[#00000]"
                >
                  Pricing Details
                </h2>
                <p className="mt-2 font-body-alt text-base text-text-secondary">
                  Prices vary based on group size. All prices are per person.
                </p>
              </div>
              <button
                type="button"
                autoFocus
                onClick={() => setPricingOpen(false)}
                aria-label="Close pricing details"
                className="rounded-full p-2"
              >
                <Icon icon="iconoir:xmark" className="size-8" />
              </button>
            </div>
            <h3 className="mt-8 text-xl font-semibold text-[#00000]">
              Group Size Pricing Per Person:
            </h3>
            <ul className="mt-5 space-y-3">
              {groupPricing.map((tier, index) => (
                <li
                  key={`${tier.min_people}-${tier.max_people ?? "plus"}-${index}`}
                  className="flex flex-col gap-1 rounded-lg border border-border px-4 py-4 font-body-alt sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-text-secondary">
                    {groupSizeLabel(tier.min_people, tier.max_people)}
                  </span>
                  <span className="shrink-0 text-lg font-semibold text-[#00000]">
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

export function PackageItinerary({ packageData }: PackageSectionProps) {
  const [day, setDay] = useState(0);
  if (!packageData.itinerary.length) return null;
  const current = packageData.itinerary[day];
  return (
    <section className="mx-auto flex min-h-[65vh] w-full max-w-[1440px] flex-col gap-8 border-b border-border px-6 py-12 lg:flex-row lg:items-stretch lg:px-20 lg:py-16">
      <div className="flex flex-1 flex-col gap-6">
        <h2 className={sectionHeading}>Itinerary</h2>
        <div className="flex flex-wrap gap-2">
          {packageData.itinerary.map((item, index) => (
            <button
              key={`${item.day_label}-${index}`}
              type="button"
              onClick={() => setDay(index)}
              className={
                index === day
                  ? "rounded bg-foreground p-3 font-body-alt text-base text-background"
                  : "rounded bg-background p-3 font-body-alt text-base text-foreground"
              }
            >
              {item.day_label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-5 rounded-lg border border-border p-6">
          <p className="font-body-alt text-xl text-foreground">
            {current?.title}
          </p>
          <div>
            <p className="font-body-alt text-lg text-foreground">Description</p>
            <p className="mt-3 font-body-alt text-base leading-[1.6] text-text-secondary">
              {current?.description}
            </p>
          </div>
        </div>
      </div>
      {current?.image && (
        <div className="relative h-[300px] w-full overflow-hidden rounded-2xl lg:h-auto lg:w-[517px]">
          <Image
            src={current.image.src || current.image.url || ""}
            alt={current.title}
            fill
            sizes="517px"
            className="object-cover"
          />
        </div>
      )}
    </section>
  );
}

export function PackageReviewsSection({ packageData }: PackageSectionProps) {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 py-12 lg:px-20 lg:py-16">
      <PackageReviews
        packageId={packageData.id}
        packageSlug={packageData.slug}
        initialAverage={packageData.rating}
        initialCount={packageData.review_count}
        testimonials={packageData.testimonials.map((item) => ({
          id: item.id,
          author_name: item.author_name,
          rating: item.rating,
          quote: item.quote,
        }))}
      />
    </section>
  );
}
