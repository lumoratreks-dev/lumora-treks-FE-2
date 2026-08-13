import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlockRenderer from "@/components/BlockRenderer";
import { getPageByPath } from "@/lib/cms";

type Params = { params: Promise<{ slug: string; code: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, code } = await params;
  const page = await getPageByPath(`/packages/${slug}/${code}`);
  return page ? { title: page.seo?.title || page.title, description: page.seo?.description } : { robots: { index: false } };
}

export default async function CanonicalPackageDetailPage({ params }: Params) {
  const { slug, code } = await params;
  const page = await getPageByPath(`/packages/${slug}/${code}`);
  if (!page?.body?.length) notFound();
  return <><main className="flex-1"><Navbar /><BlockRenderer blocks={page.body} /></main><Footer /></>;
}
