import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlockRenderer from "@/components/BlockRenderer";
import { getPageByPath } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByPath("/terms");
  return {
    title:
      page?.seo?.title || page?.title || "Terms & Conditions | Lumora Treks",
    description: page?.seo?.description,
    ...(page?.seo?.canonical_url
      ? { alternates: { canonical: page.seo.canonical_url } }
      : {}),
    ...(page?.seo?.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function TermsPage() {
  const page = await getPageByPath("/terms");
  return (
    <>
      <main className="flex-1">
        <Navbar />
        {page?.body && page.body.length > 0 ? (
          <BlockRenderer blocks={page.body} />
        ) : null}
      </main>
      <Footer />
    </>
  );
}
