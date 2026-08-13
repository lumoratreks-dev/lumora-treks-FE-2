import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PaymentSuccess from "@/components/sections/PaymentSuccess";
import BlockRenderer from "@/components/BlockRenderer";
import { getPageByPath } from "@/lib/cms";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ simulation?: string; amount?: string }>;
}) {
  const { simulation, amount } = await searchParams;
  const page = await getPageByPath("/checkout/success");

/** Booking simulation result page (`/checkout/success`) — Figma node
 * 118:4814. The verified variant will be enabled when a payment provider and
 * server-side booking confirmation are connected. */
  return (
    <>
      <main className="flex-1">
        <Navbar />
        {page?.body?.length ? <BlockRenderer blocks={page.body} contextProps={{ PaymentSuccess: { simulation: simulation === "1", amount } }} /> : <PaymentSuccess simulation={simulation === "1"} amount={amount} />}
      </main>
      <Footer />
    </>
  );
}
