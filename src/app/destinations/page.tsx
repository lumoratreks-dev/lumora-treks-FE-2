import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlockRenderer from "@/components/BlockRenderer";
import { getPageByPath } from "@/lib/cms";

import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { destinationsQueryOptions } from "@/features/destinations/destinationQueries";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByPath("/destinations");
  return {
    title: page?.seo?.title || page?.title || "Destinations | Lumora Treks",
    description: page?.seo?.description,
    ...(page?.seo?.canonical_url ? { alternates: { canonical: page.seo.canonical_url } } : {}),
    ...(page?.seo?.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

/** Destinations listing page (`/destinations`) — Figma node 84:1535. New:
 * DestinationsGrid. Reuses PageHero, IntroStats, ExperienceSection. */
export default async function DestinationsPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(
    destinationsQueryOptions()
  );
  const page = await getPageByPath("/destinations");

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex-1">
        <Navbar />
        {page?.body && page.body.length > 0 ? <BlockRenderer blocks={page.body} /> : null}
      </main>
      <Footer />
    </HydrationBoundary>
  );
}
