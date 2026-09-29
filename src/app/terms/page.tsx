import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TermsContent from "@/components/sections/TermsContent";
import { getPageByPath } from "@/lib/cms";
import { absoluteSiteUrl } from "@/lib/siteUrl";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByPath("/terms");
  return {
    title:
      page?.seo?.title || page?.title || "Terms & Conditions | Lumora Treks",
    description:
      page?.seo?.description ||
      "Read the booking, payment, cancellation, safety, and travel conditions that apply to trips with Lumora Treks.",
    alternates: { canonical: absoluteSiteUrl("/terms") },
    ...(page?.seo?.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function TermsPage() {
  return (
    <>
      <main className="flex-1">
        <Navbar />
        <TermsContent />
      </main>
      <Footer />
    </>
  );
}
