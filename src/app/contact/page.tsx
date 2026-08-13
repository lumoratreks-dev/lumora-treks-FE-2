import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlockRenderer from "@/components/BlockRenderer";
import { getPageByPath } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByPath("/contact");
  return {
    title: page?.seo?.title || page?.title || "Contact Lumora Treks",
    description: page?.seo?.description,
    ...(page?.seo?.canonical_url ? { alternates: { canonical: page.seo.canonical_url } } : {}),
    ...(page?.seo?.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

/** Contact Us page (`/contact`) — Figma node 75:144. New: ContactHero,
 * ContactForm. Reuses WhyChooseUs, AuthenticExperiences (mirrored), FAQSection. */
export default async function ContactPage() {
  const page = await getPageByPath("/contact");

  return (
    <>
      <main className="flex-1">
        <Navbar />
        {page?.body && page.body.length > 0 ? <BlockRenderer blocks={page.body} /> : null}
      </main>
      <Footer />
    </>
  );
}
