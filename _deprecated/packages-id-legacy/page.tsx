import type { Metadata } from "next";
import { getPackageBySlug } from "@/lib/catalog";
import { notFound, redirect } from "next/navigation";

type Params = { params: Promise<{ id: string }> };

async function loadPackage(id: string) {
  return getPackageBySlug(id);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const packageData = await loadPackage(id);
  if (!packageData) {
    return { title: "Package not found | Lumora Treks", robots: { index: false } };
  }

  const image = packageData.image?.src || packageData.image?.url;
  return {
    title: `${packageData.title} | Lumora Treks`,
    description: packageData.summary || undefined,
    alternates: { canonical: `/packages/${packageData.slug}/${packageData.public_code}` },
    openGraph: {
      title: packageData.title,
      description: packageData.summary || undefined,
      ...(image ? { images: [{ url: image, alt: packageData.title }] } : {}),
    },
  };
}

/** Package detail page (`/packages/[id]`) — Figma node 150:10819. Its own
 * layout (overview, gallery, things included, booking card, itinerary + map,
 * reviews), distinct from the destination detail. Booking card "Reserve Now" →
 * checkout. */
export default async function PackageDetailPage({
  params,
}: Params) {
  const { id } = await params;
  const packageData = await loadPackage(id);
  if (!packageData) notFound();
  redirect(`/packages/${packageData.slug}/${packageData.public_code}`);
}
