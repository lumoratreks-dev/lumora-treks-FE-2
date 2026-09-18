"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

/** Payment success — Figma node 118:4814 ("transaction successful"). Success
 * state + booking summary card. Presentational. */
export default function PaymentSuccess({
  verified = false,
  simulation = false,
  amount,
}: {
  verified?: boolean;
  simulation?: boolean;
  amount?: string;
}) {
  if (simulation) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/15">
          <Icon
            icon="charm:circle-tick"
            className="size-12 text-primary-active"
          />
        </div>
        <p className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.15em] text-amber-900">
          Simulation only
        </p>
        <h1 className="font-body-alt text-3xl font-semibold text-foreground">
          Demo payment completed
        </h1>
        <p className="font-body-alt text-lg text-text-secondary">
          This simulated {amount ? `$${amount}` : "payment"} did not contact a
          provider, collect card data, or charge money.
        </p>
        <Link
          href="/packages"
          className="rounded-lg bg-foreground px-5 py-3 font-medium text-background"
        >
          Return to packages
        </Link>
      </section>
    );
  }

  if (!verified) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-amber-100">
          <Icon
            icon="iconoir:warning-circle"
            className="size-12 text-amber-700"
          />
        </div>
        <h1 className="font-body-alt text-3xl font-semibold text-foreground">
          Payment confirmation is unavailable
        </h1>
        <p className="font-body-alt text-lg text-text-secondary">
          No verified payment was found for this page. Online payment will be
          available once the booking provider is connected.
        </p>
        <Link
          href="/enquiry"
          className="rounded-lg bg-foreground px-5 py-3 font-medium text-background"
        >
          Send an enquiry instead
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-12 lg:px-20">
      <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        {/* Left — success state */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex w-full flex-col items-center gap-10 py-8 text-center lg:w-[629px]"
        >
          <div className="flex flex-col items-center gap-5">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "backOut", delay: 0.1 }}
              className="flex size-20 items-center justify-center rounded-full bg-[#edf8ec]"
            >
              <Icon
                icon="charm:circle-tick"
                className="size-12 text-[#2bbf0f]"
              />
            </motion.div>
            <div className="flex flex-col gap-2">
              <h1 className="font-body-alt text-2xl font-semibold tracking-[-0.04em] text-foreground">
                Your booking is confirmed.
              </h1>
              <p className="font-body-alt text-lg tracking-[-0.04em] text-text-secondary">
                Your payment has been processed successfully. We&apos;ve emailed
                your booking confirmation and invoice.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-5 sm:flex-row">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-foreground p-3 font-body-alt text-base font-medium tracking-[-0.03em] text-background transition-transform hover:scale-[1.02] active:scale-95"
            >
              <Icon icon="iconoir:download" className="size-5" />
              Download Receipt
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-foreground p-3 font-body-alt text-base font-medium tracking-[-0.03em] text-foreground transition-colors hover:bg-background"
            >
              <Icon icon="iconoir:calendar" className="size-5" />
              View My Bookings
            </button>
          </div>

          <p className="font-body-alt text-lg tracking-[-0.04em] text-text-secondary">
            Questions about your trip?{" "}
            <Link
              href="/contact"
              className="font-medium text-[#33e612] underline"
            >
              Chat with host
            </Link>
          </p>
        </motion.div>

        {/* Right — booking summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="w-full rounded-lg border border-border px-6 pb-7 pt-6 lg:w-[487px]"
        >
          {/* Package */}
          <div className="flex items-center gap-4 border-b border-border pb-4">
            <div className="relative size-[100px] shrink-0 overflow-hidden rounded-lg">
              <Image
                src="/images/checkout-thumb.png"
                alt="UNESCO Heritage Site & Lumbini Sightseeing"
                fill
                sizes="100px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <p className="font-body-alt text-lg font-medium tracking-[-0.04em] text-foreground">
                UNESCO Heritage Site &amp; Lumbini Sightseeing
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-2">
                  <Icon
                    icon="iconoir:calendar"
                    className="size-3.5 text-text-secondary"
                  />
                  <span className="font-body-alt text-base tracking-[-0.04em] text-text-secondary">
                    Tuesday, May 24
                  </span>
                </span>
                <span className="size-1 rounded-full bg-text-secondary" />
                <span className="flex items-center gap-2">
                  <Icon
                    icon="ion:people-outline"
                    className="size-4 text-text-secondary"
                  />
                  <span className="font-body-alt text-base tracking-[-0.04em] text-text-secondary">
                    2 people
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Booking ID */}
          <div className="flex items-center justify-between border-b border-border py-4">
            <span className="font-body-alt text-base tracking-[-0.04em] text-text-secondary">
              Booking ID
            </span>
            <span className="font-body-alt text-base font-medium text-[#2bbf0f] underline">
              #46999
            </span>
          </div>

          {/* Price details */}
          <p className="pt-4 font-body-alt text-lg font-medium tracking-[-0.04em] text-foreground">
            Price Details
          </p>
          <div className="flex items-center justify-between gap-2 py-4">
            <div className="flex flex-col gap-1">
              <span className="font-body-alt text-base tracking-[-0.04em] text-text-secondary">
                Booking Date
              </span>
              <span className="font-body-alt text-xs italic tracking-[-0.04em] text-[#909dad]">
                When you made your booking
              </span>
            </div>
            <span className="font-body-alt text-base font-medium tracking-[-0.04em] text-foreground">
              June 20, 2026
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border pb-4">
            <span className="font-body-alt text-base tracking-[-0.04em] text-text-secondary">
              Payment Status
            </span>
            <span className="font-body-alt text-base font-medium text-[#2bbf0f]">
              Partially Paid
            </span>
          </div>
          <div className="flex items-center justify-between pt-4">
            <span className="font-body-alt text-base tracking-[-0.04em] text-text-secondary">
              Payment Amount (30%)
            </span>
            <span className="font-body-alt text-lg font-medium tracking-[-0.04em] text-[#2bbf0f]">
              $312
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
