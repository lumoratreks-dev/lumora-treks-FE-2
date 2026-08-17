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
import { popularPackagesQueryOptions } from "@/features/packages/packageQueries";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByPath("/");
  return {
    title: page?.seo?.title || page?.title || "Lumora Treks | Travel Beyond Destinations",
    description: page?.seo?.description,
    ...(page?.seo?.canonical_url ? { alternates: { canonical: page.seo.canonical_url } } : {}),
    ...(page?.seo?.noindex ? { robots: { index: false, follow: false } } : {}),
    ...(page?.seo?.og_image?.url
      ? { openGraph: { images: [{ url: page.seo.og_image.url, alt: page.title }] } }
      : {}),
  };
}

export default async function Home() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(popularPackagesQueryOptions());
  const page = await getPageByPath("/");

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex-1">
        <Navbar />
        {page?.body && page.body.length > 0 ? (
          <BlockRenderer blocks={page.body} />
        ) : null}
      </main>
     
      <Footer />
    </HydrationBoundary>
  );
}
