import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlockRenderer from "@/components/BlockRenderer";
import { getPageByPath } from "@/lib/cms";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageByPath(`/destinations/${slug}`);
  return page ? { title: page.seo?.title || page.title, description: page.seo?.description } : { robots: { index: false } };
}

export default async function DestinationDetailPage({ params }: Params) {
  const { slug } = await params;
  const page = await getPageByPath(`/destinations/${slug}`);
  if (!page?.body?.length) notFound();
  return <><main className="flex-1"><Navbar /><BlockRenderer blocks={page.body} /></main><Footer /></>;
}
