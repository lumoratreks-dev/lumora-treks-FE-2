"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import PackageCard from "@/components/ui/PackageCard";
import type { CmsDestinationDetail } from "@/lib/blocks";

type DestinationSectionProps = { destination: CmsDestinationDetail };

function priceLabel(currency: string | undefined, price: number | undefined) {
  if (price == null) return "Ask for price";
  return `${currency === "USD" || !currency ? "$" : `${currency} `}${price} per person`;
}

export function DestinationHeader({ destination }: DestinationSectionProps) {
  return (
    <header className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 border-b border-border px-6 py-8 sm:px-12 lg:px-20 lg:py-12">
      <nav className="flex flex-wrap items-center gap-2 font-body-alt text-base tracking-[-0.02em] text-text-secondary" aria-label="Breadcrumb">
        <Link href="/destinations" className="hover:text-foreground">Destinations</Link>
        <Icon icon="iconoir:nav-arrow-right" className="size-4" />
        <span className="font-medium text-primary-active underline">{destination.title}</span>
      </nav>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 font-body-alt text-sm font-semibold uppercase tracking-[0.12em] text-primary-active">{destination.region}</p>
          <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-bold tracking-[-0.06em] text-foreground">{destination.title}</h1>
          {destination.subtitle && <p className="mt-3 max-w-2xl font-body-alt text-lg leading-relaxed text-text-secondary">{destination.subtitle}</p>}
        </div>
        <button type="button" aria-label="Share destination" className="shrink-0 rounded-full p-2 text-foreground transition hover:bg-background">
          <Icon icon="iconoir:share-android" className="size-6" />
        </button>
      </div>
    </header>
  );
}

export function DestinationOverview({ destination }: DestinationSectionProps) {
  const image = destination.image?.src || destination.image?.url;
  const packages = destination.packages || [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" as const }}
      className="mx-auto grid w-full max-w-[1440px] gap-8 border-b border-border px-6 py-10 sm:px-12 lg:min-h-[70vh] lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)] lg:px-20 lg:py-14"
    >
      <div className="flex flex-col justify-center gap-7">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">Why go</h2>
          <p className="font-body-alt text-lg leading-[1.65] tracking-[-0.02em] text-text-secondary">{destination.description || destination.subtitle}</p>
        </div>
        {destination.highlights.length > 0 && <div className="rounded-2xl bg-[#f4f8ef] p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Destination highlights</h2>
          <ul className="space-y-3 font-body-alt text-base leading-relaxed text-text-secondary">
            {destination.highlights.map((highlight) => <li key={highlight} className="flex gap-2.5"><Icon icon="iconoir:check-circle-solid" className="mt-0.5 size-5 shrink-0 text-primary-active" />{highlight}</li>)}
          </ul>
        </div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-4"><p className="text-sm text-text-secondary">Best season</p><p className="mt-1 font-body-alt font-semibold text-foreground">{destination.best_season || "Ask our travel team"}</p></div>
          <div className="rounded-xl border border-border p-4"><p className="text-sm text-text-secondary">Trips available</p><p className="mt-1 font-body-alt font-semibold text-foreground">{packages.length} curated {packages.length === 1 ? "trip" : "trips"}</p></div>
        </div>
      </div>
      {image && <div className="relative min-h-[340px] overflow-hidden rounded-2xl bg-background lg:min-h-full"><Image src={image} alt={destination.title} fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" /></div>}
    </motion.section>
  );
}

export function DestinationPackages({ destination }: DestinationSectionProps) {
  const packages = destination.packages || [];

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-6 py-12 sm:px-12 lg:px-20 lg:py-16">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="font-body-alt text-sm font-semibold uppercase tracking-[0.12em] text-primary-active">Explore here</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-foreground">Packages in {destination.title}</h2></div>
        <Link href={`/packages?destination=${encodeURIComponent(destination.slug)}`} className="font-body-alt font-semibold text-foreground underline underline-offset-4">View all packages</Link>
      </div>
      {packages.length > 0 ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{packages.map((pkg) => <PackageCard key={pkg.id} image={pkg.image?.src || pkg.image?.url || ""} title={pkg.title} description={pkg.summary || ""} price={priceLabel(pkg.currency, pkg.price)} duration={pkg.duration || ""} rating="" href={pkg.href} />)}</div> : <div className="rounded-2xl border border-dashed border-border p-8 font-body-alt text-text-secondary">Packages for this destination are being prepared. Send us an enquiry and we’ll help plan your trip.</div>}
    </section>
  );
}
