import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlockRenderer from "@/components/BlockRenderer";
import ContactHero from "@/components/sections/ContactHero";
import ContactForm from "@/components/sections/ContactForm";
import FAQSection from "@/components/sections/FAQSection";
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
  const body = page?.body ?? [];
  // The enquiry form is the whole point of this page, but it lives in a
  // CMS-managed `contact_form` block that can drift out of the page body (e.g.
  // edited away in Wagtail admin). When it's absent we render ContactHero +
  // ContactForm inline so the form never silently disappears, then pass any
  // remaining CMS blocks (e.g. a CMS-authored FAQ, with its real items)
  // straight through — falling back to a default FAQ only if there are none.
  const hasForm = body.some((block) => block.type === "contact_form");
  const extraBlocks = body.filter(
    (block) => block.type !== "contact_hero" && block.type !== "contact_form"
  );

  return (
    <>
      <main className="flex-1">
        <Navbar />
        {hasForm ? (
          <BlockRenderer blocks={body} />
        ) : (
          <>
            <ContactHero />
            <ContactForm />
            {extraBlocks.length > 0 ? <BlockRenderer blocks={extraBlocks} /> : <FAQSection />}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
