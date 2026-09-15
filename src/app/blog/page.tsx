import type { Metadata } from "next";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/sections/PageHero";
import BlogGrid from "@/components/sections/BlogGrid";
import CTABand from "@/components/sections/CTABand";
import BlockRenderer from "@/components/BlockRenderer";
import { getPageByPath } from "@/lib/cms";
import {
  blogPostsQueryOptions,
  featuredPostQueryOptions,
} from "@/features/blog/blogQueries";
import { BLOG_CATEGORIES } from "@/features/blog/blogData";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByPath("/blog");
  return {
    title: page?.seo?.title || page?.title || "Stories & Guides | Lumora Treks",
    description:
      page?.seo?.description ||
      "Field notes, trekking guides, and cultural stories from the Himalaya — written by the guides and travellers who know these trails best.",
    ...(page?.seo?.canonical_url ? { alternates: { canonical: page.seo.canonical_url } } : {}),
    ...(page?.seo?.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

/** Blog index (`/blog`) — editorial magazine layout. Renders the Wagtail
 * `BlogIndexPage` body (PageHero → BlogListing → CTABanner) when the CMS is
 * reachable; otherwise falls back to the same composition inline. Either way
 * the posts come from the blog API (dummy fallback), and the featured + first
 * list page are prefetched for SSR. */
export default async function BlogPage() {
  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchQuery(featuredPostQueryOptions()),
    queryClient.prefetchQuery(
      blogPostsQueryOptions({ category: BLOG_CATEGORIES[0], page: 1, pageSize: 5 })
    ),
  ]);

  const page = await getPageByPath("/blog");
  const hasCmsBody = !!page?.body && page.body.length > 0;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex-1">
        <Navbar />
        {hasCmsBody ? (
          <BlockRenderer blocks={page!.body} />
        ) : (
          <>
            <PageHero
              title="Stories & Guides"
              image="/images/exp-big.png"
              imageAlt="Himalayan trail at golden hour"
              imageWidth={620}
              imageHeight={460}
              subtitle={
                <>
                  Field notes and trekking guides from the trail —{" "}
                  <span className="italic text-[#909dad]">
                    stories worth carrying home.
                  </span>
                </>
              }
              show_search={false}
            />
            <BlogGrid />
            <CTABand />
          </>
        )}
      </main>
      <Footer />
    </HydrationBoundary>
  );
}
