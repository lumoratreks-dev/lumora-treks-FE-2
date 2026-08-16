import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getPackageBySlug } from "@/lib/catalog";
import BlockRenderer from "@/components/BlockRenderer";
import { getPageByPath } from "@/lib/cms";
import { notFound } from "next/navigation";

/** Enquiry page (`/enquiry`) — general enquiry form, reached from "Reserve Now".
 * Presentational; content dummy for now. */
export default async function EnquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const { package: packageSlug } = await searchParams;
  const packageData = packageSlug ? await getPackageBySlug(packageSlug) : null;
  const page = await getPageByPath("/enquiry");
  if (!page?.body?.length) notFound();

  return (
    <>
      <main className="flex-1">
        <Navbar />
        <BlockRenderer blocks={page.body} contextProps={{ PackageEnquiry: { packageData: packageData ?? undefined } }} />
      </main>
      <Footer />
    </>
  );
}
