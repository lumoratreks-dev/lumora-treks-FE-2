import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlockRenderer from "@/components/BlockRenderer";
import { getPage } from "@/lib/cms";

/**
 * Demo CMS-driven page (`/cms/<slug>`, e.g. `/cms/home`) — proves the Wagtail
 * block pipeline end-to-end on mock data: server-fetch page → <BlockRenderer>.
 * Swap `getPage` for the real Wagtail API v2 (see src/lib/cms.ts) in Phase C.
 */
type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return {
    title: page.seo?.title ?? page.title,
    description: page.seo?.description,
    ...(page.seo?.canonical_url
      ? { alternates: { canonical: page.seo.canonical_url } }
      : {}),
    ...(page.seo?.noindex ? { robots: { index: false, follow: false } } : {}),
    ...(page.seo?.og_image?.url
      ? {
          openGraph: {
            images: [{ url: page.seo.og_image.url, alt: page.title }],
          },
        }
      : {}),
  };
}

export default async function CmsPreviewPage({ params }: Params) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <>
      <main className="flex-1">
        <Navbar />
        <BlockRenderer blocks={page.body} />
      </main>
      <Footer />
    </>
  );
}
