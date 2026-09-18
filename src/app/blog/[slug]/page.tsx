import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlockRenderer from "@/components/BlockRenderer";
import ReadingProgress from "@/components/sections/ReadingProgress";
import ArticleHero from "@/components/sections/ArticleHero";
import ArticleBody from "@/components/sections/ArticleBody";
import RelatedStories from "@/components/sections/RelatedStories";
import CTABand from "@/components/sections/CTABand";
import { getPageByPath } from "@/lib/cms";
import { absoluteAssetUrl, absoluteSiteUrl } from "@/lib/siteUrl";
import {
  fetchBlogPost,
  fetchBlogSlugs,
  fetchRelatedPosts,
} from "@/features/blog/blogQueries";

/** Pre-render every known article slug (CMS list, falling back to the dummy
 * dataset — the CMS is the source once reachable). */
export async function generateStaticParams() {
  const slugs = await fetchBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) return { title: "Story not found | Lumora Treks" };
  const url = absoluteSiteUrl(`/blog/${slug}`);
  const image = absoluteAssetUrl(post.image || "/images/hero-bg.png");
  return {
    title: `${post.title} | Lumora Treks`,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      siteName: "Lumora Treks",
      images: [{ url: image, alt: post.title }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [image],
    },
  };
}

/** Article page (`/blog/[slug]`) — the reading experience: reading-progress
 * bar → cinematic ArticleHero → narrow-measure ArticleBody (with share rail +
 * author bio) → RelatedStories → CTABand. Content comes from the Wagtail blog
 * API (dummy fallback). */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) notFound();

  const [related, page] = await Promise.all([
    fetchRelatedPosts(slug, 6),
    getPageByPath(`/blog/${slug}`),
  ]);

  const articleContext = {
    ArticleHero: { post },
    ArticleBody: { post },
    RelatedStories: { posts: related },
  };

  return (
    <>
      <ReadingProgress />
      <main className="flex-1">
        <Navbar />
        {page?.body?.length ? (
          <BlockRenderer blocks={page.body} contextProps={articleContext} />
        ) : (
          <>
            <ArticleHero post={post} />
            <ArticleBody post={post} />
            <RelatedStories posts={related} count={3} />
            <CTABand />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
