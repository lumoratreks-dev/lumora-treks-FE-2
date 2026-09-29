import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlockRenderer from "@/components/BlockRenderer";
import { getPackageBySlug } from "@/lib/catalog";
import { getPageByPath } from "@/lib/cms";
import { absoluteAssetUrl, absoluteSiteUrl } from "@/lib/siteUrl";

type Params = { params: Promise<{ slug: string; code: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, code } = await params;
  const path = `/packages/${slug}/${code}`;
  const page = await getPageByPath(path);
  if (!page?.package) return { robots: { index: false } };

  const title = page.seo?.title || page.package.title || page.title;
  const description = page.seo?.description || page.package.summary;
  const imageData = page.seo?.og_image || page.package.image;
  const image = absoluteAssetUrl(
    imageData?.url || imageData?.src || "/images/hero-bg.png",
  );
  const url = absoluteSiteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Lumora Treks",
      type: "website",
      images: [
        {
          url: image,
          alt: imageData?.alt || title,
          ...(imageData?.width ? { width: imageData.width } : {}),
          ...(imageData?.height ? { height: imageData.height } : {}),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function CanonicalPackageDetailPage({ params }: Params) {
  const { slug, code } = await params;
  const path = `/packages/${slug}/${code}`;
  const page = await getPageByPath(path);
  if (!page?.body?.length || !page.package) {
    // An outdated code (e.g. a shared or bookmarked link) for a package that
    // still exists: send visitors — and search engines — to its current URL.
    const current = await getPackageBySlug(slug);
    if (current?.href && current.href !== path) permanentRedirect(current.href);
    notFound();
  }
  const packageContext = {
    PackageHeader: { packageData: page.package },
    PackageOverview: { packageData: page.package },
    PackageBooking: { packageData: page.package },
    PackageItinerary: { packageData: page.package },
    PackageReviewsSection: { packageData: page.package },
  };
  return (
    <>
      <main className="flex-1">
        <Navbar />
        <BlockRenderer blocks={page.body} contextProps={packageContext} />
      </main>
      <Footer />
    </>
  );
}
