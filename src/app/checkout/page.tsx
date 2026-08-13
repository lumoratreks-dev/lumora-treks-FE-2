import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Checkout from "@/components/sections/Checkout";
import BlockRenderer from "@/components/BlockRenderer";
import { getPageByPath } from "@/lib/cms";

/** Checkout / payment page (`/checkout`) — Figma node 118:4743. Reached from a
 * package's Reserve Now. Content dummy; wires to Travories/payment later. */
export default async function CheckoutPage() {
  const page = await getPageByPath("/checkout");
  return (
    <>
      <main className="flex-1">
        <Navbar />
        {page?.body?.length ? <BlockRenderer blocks={page.body} /> : <Checkout />}
      </main>
      <Footer />
    </>
  );
}
