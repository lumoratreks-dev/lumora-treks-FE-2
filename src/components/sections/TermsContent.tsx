import Link from "next/link";
import { Icon } from "@iconify/react";

const sections = [
  {
    id: "booking-contract",
    title: "1. Your booking contract",
    content: (
      <>
        <p>
          These Terms and Conditions apply when you book a trek, tour,
          expedition, activity, transport, accommodation, or related travel
          service directly with Lumora Treks. By submitting a booking and
          paying any required amount, you confirm that you have read and
          accepted these terms.
        </p>
        <p>
          If you book for other travellers, you confirm that you have their
          authority to accept these terms on their behalf and that all details
          you provide are complete and accurate. Your contract is formed when
          we issue written booking confirmation.
        </p>
      </>
    ),
  },
  {
    id: "booking-payment",
    title: "2. Booking and payment",
    content: (
      <>
        <p>
          The deposit, balance due date, accepted payment methods, and any
          transaction fees will be shown during booking or stated in your
          quotation and confirmation. A place is not secured until we receive
          the required payment and confirm the booking in writing.
        </p>
        <p>
          You must pay the balance by the stated deadline. If payment is late,
          we may treat the booking as cancelled by you after giving reasonable
          notice. Bank, card, currency-conversion, and intermediary charges are
          your responsibility unless we expressly state otherwise.
        </p>
      </>
    ),
  },
  {
    id: "prices",
    title: "3. Prices and inclusions",
    content: (
      <>
        <p>
          Your confirmed itinerary identifies what is included and excluded.
          Unless expressly included, international flights, visas, insurance,
          vaccinations, personal equipment, optional activities, tips, excess
          baggage, and personal expenses are not part of the trip price.
        </p>
        <p>
          Before full payment, we may correct an obvious pricing error or adjust
          a price because of exchange-rate movements, taxes, permit fees,
          government charges, fuel costs, or supplier increases. We will explain
          any material change and the options available to you before proceeding.
        </p>
      </>
    ),
  },
  {
    id: "cancellation-by-you",
    title: "4. Cancellation by you",
    content: (
      <>
        <p>
          Cancellation must be sent to us in writing and takes effect when we
          receive it. The cancellation schedule disclosed in your quotation,
          checkout, or booking confirmation applies and forms part of your
          contract. If those documents differ, the most recent terms accepted
          before payment will apply.
        </p>
        <p>
          Deposits, permits, flights, accommodation, and other supplier payments
          may be non-refundable once arranged. No refund is normally available
          for a no-show, voluntary early departure, or services you choose not to
          use after the trip has started. You should obtain insurance that covers
          cancellation and interruption.
        </p>
      </>
    ),
  },
  {
    id: "changes-by-you",
    title: "5. Changes, postponements, and transfers",
    content: (
      <p>
        Tell us in writing as early as possible if you wish to change dates,
        services, or traveller names. We will try to help, but changes depend on
        availability, permits, and supplier rules. You are responsible for any
        price difference, supplier charge, or reasonable administrative cost.
        Credits and transfers are only valid when confirmed by us in writing and
        are subject to the conditions stated at that time.
      </p>
    ),
  },
  {
    id: "changes-by-us",
    title: "6. Changes or cancellation by us",
    content: (
      <>
        <p>
          Adventure travel is affected by weather, trail conditions, transport,
          permits, health concerns, and local circumstances. We may alter routes,
          accommodation, transport, guides, or timings where reasonably necessary
          for safety or proper trip operation. A comparable service may be used
          where available.
        </p>
        <p>
          If we make a material change before departure, we will notify you and
          explain the available alternative, credit, or refund, after deducting
          amounts already paid to suppliers that cannot reasonably be recovered.
          We are not responsible for consequential costs such as separate flights,
          visas, equipment, or accommodation you arranged independently.
        </p>
      </>
    ),
  },
  {
    id: "traveller-responsibilities",
    title: "7. Traveller responsibilities",
    content: (
      <p>
        You must select a trip suitable for your experience, fitness, and health;
        follow reasonable safety instructions; respect local laws, customs,
        communities, wildlife, and the environment; and act considerately toward
        other travellers, staff, and suppliers. We may remove a traveller whose
        conduct creates a safety risk, causes serious disruption, or is unlawful.
        In that situation, additional costs are the traveller&apos;s responsibility
        and refunds are not normally provided.
      </p>
    ),
  },
  {
    id: "health-insurance",
    title: "8. Health, fitness, and travel insurance",
    content: (
      <>
        <p>
          You must disclose any medical condition, disability, medication, or
          other circumstance that may affect your participation or require
          assistance. We may request medical clearance for strenuous, remote, or
          high-altitude trips and may decline participation where we cannot safely
          accommodate a material risk.
        </p>
        <p>
          Comprehensive travel insurance is strongly recommended for every trip
          and may be mandatory for particular itineraries. Where required, it must
          cover the full travel period and relevant activities, including medical
          treatment, emergency evacuation and repatriation, trip cancellation or
          interruption, and personal belongings. You remain responsible for costs
          not paid by your insurer.
        </p>
      </>
    ),
  },
  {
    id: "documents",
    title: "9. Passports, visas, permits, and health requirements",
    content: (
      <p>
        You are responsible for carrying a valid passport and obtaining all visas,
        permits, certificates, vaccinations, and entry documents required for your
        itinerary. Requirements can change without notice. Information we provide
        is general guidance only; verify current requirements with the relevant
        authorities. We are not responsible for loss caused by incomplete,
        inaccurate, or missing documents supplied by you.
      </p>
    ),
  },
  {
    id: "risk",
    title: "10. Adventure travel risk and guide authority",
    content: (
      <p>
        Trekking and adventure travel involve inherent risks, including altitude,
        difficult terrain, remoteness, unpredictable weather, limited medical
        facilities, transport disruption, illness, injury, and evacuation delays.
        By booking, you acknowledge these risks. The trip leader may change an
        itinerary or restrict participation when reasonably necessary for safety.
        Their operational and safety decisions must be followed.
      </p>
    ),
  },
  {
    id: "suppliers",
    title: "11. Third-party suppliers",
    content: (
      <p>
        We arrange services through independent airlines, hotels, transport
        providers, guides, activity operators, and other suppliers. Their own
        terms may also apply. We take reasonable care when selecting suppliers
        but do not control their day-to-day operations. Nothing in these terms
        excludes rights or remedies that cannot lawfully be excluded.
      </p>
    ),
  },
  {
    id: "force-majeure",
    title: "12. Events beyond our control",
    content: (
      <p>
        We are not responsible for a failure or delay caused by events we or our
        suppliers could not reasonably prevent, including severe weather, natural
        disaster, epidemic, government action, border closure, political unrest,
        terrorism, strike, transport cancellation, or infrastructure failure. We
        will provide reasonable assistance, but additional costs and recoveries
        will be handled according to supplier terms, applicable law, and your
        travel insurance.
      </p>
    ),
  },
  {
    id: "complaints",
    title: "13. Problems and complaints",
    content: (
      <p>
        Tell your guide or our local representative promptly about a problem so
        we have an opportunity to resolve it during the trip. If it remains
        unresolved, contact us in writing as soon as reasonably possible after
        the trip with your booking reference and supporting details. Delay may
        limit our ability to investigate or provide an effective remedy.
      </p>
    ),
  },
  {
    id: "privacy-content",
    title: "14. Privacy, content, and website use",
    content: (
      <>
        <p>
          We process personal information to administer bookings, deliver travel
          services, meet legal obligations, and provide support, as described in
          our <Link href="/privacy" className="font-semibold text-primary-active underline underline-offset-4">Privacy Policy</Link>.
          Please ask before using our trademarks or reproducing website content.
        </p>
        <p>
          If you provide a review or give us permission to use trip photographs,
          you grant us the rights described in that permission. You may withdraw
          consent for future promotional use by contacting us, subject to content
          already lawfully published or otherwise required to be retained.
        </p>
      </>
    ),
  },
  {
    id: "law",
    title: "15. Governing law and general terms",
    content: (
      <p>
        These terms are governed by the laws of Nepal, subject to any mandatory
        consumer protection that applies in your place of residence. If a term is
        found unenforceable, the remaining terms continue in effect. A failure to
        enforce a term is not a waiver. These terms, your itinerary, quotation,
        and booking confirmation form the agreement between you and Lumora Treks.
      </p>
    ),
  },
];

export default function TermsContent() {
  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-[1200px] px-6 py-14 lg:px-10 lg:py-20">
          <nav className="mb-8 flex items-center gap-2 font-body-alt text-sm text-text-secondary" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-primary-active">Home</Link>
            <Icon icon="iconoir:nav-arrow-right" className="size-4" />
            <span>Terms &amp; Conditions</span>
          </nav>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary-active">Booking conditions</p>
          <h1 className="max-w-4xl text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.98] tracking-[-0.06em] text-foreground">
            Terms &amp; Conditions
          </h1>
          <p className="mt-6 max-w-3xl font-body-alt text-lg leading-8 text-text-secondary">
            Please read these terms before booking. They explain the agreement
            between you and Lumora Treks and the responsibilities that come with
            adventure travel.
          </p>
          <p className="mt-5 text-sm font-medium text-text-muted">Effective 18 September 2026</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-14 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-10 lg:py-20">
        <aside className="h-fit lg:sticky lg:top-24">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">On this page</p>
          <nav aria-label="Terms sections" className="max-h-[65vh] space-y-1 overflow-y-auto border-l border-border pl-4">
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="block py-1.5 font-body-alt text-sm text-text-secondary transition-colors hover:text-primary-active">
                {section.title.replace(/^\d+\.\s*/, "")}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <div className="mb-12 rounded-2xl border border-primary-accent/40 bg-primary-accent/10 p-6">
            <div className="flex gap-4">
              <Icon icon="iconoir:info-circle" className="mt-0.5 size-6 shrink-0 text-primary-active" />
              <p className="font-body-alt leading-7 text-text-secondary">
                Your trip itinerary, quotation, checkout, or booking confirmation
                may contain trip-specific payment and cancellation terms. Those
                specific terms form part of your contract and take priority if
                they conflict with this general page.
              </p>
            </div>
          </div>

          <div className="space-y-12">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28 border-b border-border pb-12 last:border-0">
                <h2 className="text-2xl font-bold tracking-[-0.04em] text-foreground md:text-[28px]">{section.title}</h2>
                <div className="mt-5 space-y-4 font-body-alt text-lg leading-8 text-text-secondary">{section.content}</div>
              </section>
            ))}
          </div>

          <div className="mt-4 rounded-3xl bg-foreground p-8 text-background md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-accent">Questions?</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">Talk to us before you book.</h2>
            <p className="mt-4 max-w-2xl font-body-alt text-lg leading-8 text-background/75">
              If any part of these terms or your trip-specific conditions is unclear,
              ask us for an explanation before making payment.
            </p>
            <Link href="/contact" className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary-accent px-6 py-3 font-semibold text-foreground transition-transform hover:scale-[1.02]">
              Contact Lumora Treks
              <Icon icon="iconoir:arrow-up-right" className="size-5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
