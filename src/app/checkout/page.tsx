import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlockRenderer from "@/components/BlockRenderer";
import { getPageByPath } from "@/lib/cms";
import { notFound } from "next/navigation";

/** Checkout / payment page (`/checkout`) — Figma node 118:4743. Reached from a
 * package's Reserve Now. Content dummy; wires to Travories/payment later. */
export default async function CheckoutPage() {
  const page = await getPageByPath("/checkout");
  if (!page?.body?.length) notFound();
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
