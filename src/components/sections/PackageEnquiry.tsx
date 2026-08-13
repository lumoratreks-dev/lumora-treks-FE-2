"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import StarRating from "@/components/ui/StarRating";
import { useSubmitLeadMutation } from "@/features/leads/leadsApi";
import type { CmsPackageDetail } from "@/lib/blocks";

/** Package enquiry — reached from a package detail page. A no-payment enquiry
 * form + package summary. Submits to `/api/v2/leads/` (`form_key: "enquiry"`);
 * phone/travel_date/travelers/message ride along as extra fields on the lead
 * (see `leadsApi.ts`). */

const inputBase =
  "w-full rounded-lg border border-border p-3 font-body-alt text-base tracking-[-0.04em] text-foreground placeholder:text-[#909dad] focus:outline-none";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="py-1 font-body-alt text-base font-medium tracking-[-0.02em] text-[#3d4c5e]">
        {label}
      </span>
      {children}
    </div>
  );
}

export default function PackageEnquiry({ packageData, package: packageFromCms }: { packageData?: CmsPackageDetail; package?: CmsPackageDetail }) {
  const selectedPackage = packageData || packageFromCms;
  const [formStartedAt] = useState(() => Date.now() / 1000);
  const [sent, setSent] = useState(false);
  const [submitLead, { isLoading, isError }] = useSubmitLeadMutation();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    submitLead({
      form_key: "enquiry",
      name: String(data.get("full_name") || ""),
      email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""),
      message: String(data.get("message") || ""),
      travel_date: String(data.get("travel_date") || ""),
      travelers: String(data.get("travelers") || ""),
      package_id: selectedPackage ? Number(selectedPackage.id) : undefined,
      consent: data.get("privacy_consent") === "yes",
      form_started_at: Number(e.currentTarget.dataset.startedAt || formStartedAt),
      source_url: window.location.href,
    })
      .unwrap()
      .then(() => setSent(true))
      .catch(() => {});
  };

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-12 lg:px-20">
      <div className="mb-10 flex flex-col gap-5">
        <nav className="flex flex-wrap items-center gap-2 font-body-alt text-base tracking-[-0.02em] text-text-secondary">
          <Link href="/packages">Packages</Link>
          <Icon icon="iconoir:nav-arrow-right" className="size-4" />
          <span>Package Description</span>
          <Icon icon="iconoir:nav-arrow-right" className="size-4" />
          <span className="font-medium text-[#2bbf0f] underline">Enquiry</span>
        </nav>
        <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-foreground">
          Enquire about this trip
        </h1>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Left — form / success */}
        <div className="flex flex-col gap-6 lg:flex-1">
          {sent ? (
            <div className="flex flex-col items-center gap-5 rounded-lg border border-border p-10 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#edf8ec]">
                <Icon icon="charm:circle-tick" className="size-10 text-[#2bbf0f]" />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="font-body-alt text-2xl font-semibold tracking-[-0.04em] text-foreground">
                  Enquiry sent!
                </h2>
                <p className="font-body-alt text-lg tracking-[-0.04em] text-text-secondary">
                  Thanks — our team will get back to you within one business day.
                </p>
              </div>
              <Link
                href="/packages"
                className="rounded-lg bg-foreground px-5 py-3 font-body-alt text-base font-medium tracking-[-0.03em] text-background transition-transform hover:scale-[1.03] active:scale-95"
              >
                Browse more packages
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              data-started-at={formStartedAt}
              className="flex flex-col gap-6 rounded-lg border border-border p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full Name">
                  <input required name="full_name" type="text" placeholder="Enter your full name" className={inputBase} />
                </Field>
                <Field label="Email Address">
                  <input required name="email" type="email" placeholder="Enter your email" className={inputBase} />
                </Field>
                <Field label="Phone Number">
                  <input name="phone" type="tel" placeholder="Enter your phone number" className={inputBase} />
                </Field>
                <Field label="Travel Date">
                  <input name="travel_date" type="text" placeholder="When do you want to travel?" className={inputBase} />
                </Field>
              </div>
              <Field label="Number of Travelers">
                <input name="travelers" type="text" placeholder="e.g. 2 Adults, 1 Child" className={inputBase} />
              </Field>
              <Field label="Message">
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Tell us about your trip…"
                  className="resize-none rounded-lg border border-border p-3 font-body-alt text-base tracking-[-0.04em] text-foreground placeholder:text-[#909dad] focus:outline-none"
                />
              </Field>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="privacy_consent"
                  value="yes"
                  required
                  className="size-6 shrink-0 rounded border border-[#b2bbc6] accent-foreground"
                />
                <span className="font-body-alt text-base tracking-[-0.04em] text-[#3d4c5e]">
                  I agree to the <a href="/privacy" className="underline">privacy policy</a>.
                </span>
              </label>
              {isError && (
                <p className="font-body-alt text-sm font-medium text-red-600">
                  Something went wrong — please try again.
                </p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="self-start rounded-lg bg-foreground px-6 py-3 font-body-alt text-base font-medium tracking-[-0.03em] text-background transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
              >
                {isLoading ? "Sending…" : "Send Enquiry"}
              </button>
            </form>
          )}
        </div>

        {/* Right — package summary */}
        <aside className="w-full rounded-lg border border-border px-6 pb-7 pt-6 lg:w-[420px]">
          <div className="flex items-center gap-4 border-b border-border pb-4">
            <div className="relative size-[100px] shrink-0 overflow-hidden rounded-lg">
              <Image
                src={selectedPackage?.image?.src || selectedPackage?.image?.url || "/images/checkout-thumb.png"}
                alt={selectedPackage?.title || "Selected package"}
                fill
                sizes="100px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <p className="font-body-alt text-lg font-medium tracking-[-0.04em] text-foreground">
                {selectedPackage?.title || "Select a package from the packages page"}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-body-alt text-base tracking-[-0.04em] text-text-secondary">
                  {selectedPackage?.duration || "Package details"}
                </span>
                <span className="size-1 rounded-full bg-text-secondary" />
                  <StarRating rating={selectedPackage?.rating ?? 4} starSize={20} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4">
            <span className="font-body-alt text-base tracking-[-0.04em] text-text-secondary">
              Starting from
            </span>
            <span className="font-body-alt text-xl font-medium tracking-[-0.04em] text-foreground">
              {selectedPackage ? `${selectedPackage.currency} ${selectedPackage.price}` : "Quote on request"}
            </span>
          </div>
          <p className="mt-3 font-body-alt text-sm tracking-[-0.03em] text-[#909dad]">
            No payment required to enquire — we&apos;ll confirm availability and
            pricing with you.
          </p>
        </aside>
      </div>
    </section>
  );
}
