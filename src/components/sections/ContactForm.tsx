"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useSubmitLeadMutation } from "@/features/leads/leadsApi";

/** Contact Form — Figma node 75:690. Contact info + social (left) and the
 * "Leave your message" form (right). Submits to `/api/v2/leads/`
 * (`form_key: "contact"`) — `destination` has no dedicated backend field, it
 * rides along in `LeadSubmission.data` like any other extra form field. */

const DEFAULT_SOCIALS = [
  { icon: "mdi:facebook", label: "Facebook", url: "#" },
  { icon: "mdi:instagram", label: "Instagram", url: "#" },
  { icon: "prime:twitter", label: "X", url: "#" },
  { icon: "mdi:whatsapp", label: "WhatsApp", url: "#" },
];

const DEFAULT_DESTINATIONS = [
  "Kathmandu Valley",
  "Pokhara",
  "Annapurna Base Camp",
  "Poon Hills",
];

function highlightSplit(text: string, highlight?: string) {
  if (!highlight) return { before: text, highlighted: "", after: "" };
  const idx = text.indexOf(highlight);
  if (idx === -1) return { before: text, highlighted: "", after: "" };
  return {
    before: text.slice(0, idx),
    highlighted: highlight,
    after: text.slice(idx + highlight.length),
  };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <span className="py-1 text-lg font-semibold tracking-[-0.04em] text-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

const fieldBox =
  "flex items-center justify-between gap-2 rounded-lg border border-border bg-white p-3 text-base tracking-[-0.04em]";

export default function ContactForm({
  heading = "Don't Hesitate to Contact Us",
  heading_highlight = "Contact Us",
  description = "Whether you have a quick question or want to book a full consultation — we're easy to reach. Fill in the form and we'll respond within one business day",
  description_highlight = "Fill in the form and we'll respond within one business day",
  socials,
  destinations,
  submit_label = "Reserve Now",
}: {
  heading?: string;
  heading_highlight?: string;
  description?: string;
  description_highlight?: string;
  socials?: { icon: string; label: string; url?: string }[];
  destinations?: { title: string }[];
  submit_label?: string;
} = {}) {
  const [formStartedAt] = useState(() => Date.now() / 1000);
  const [submitLead, { isLoading, isSuccess, isError }] = useSubmitLeadMutation();

  const headingParts = highlightSplit(heading, heading_highlight);
  const descriptionParts = highlightSplit(description, description_highlight);
  const socialLinks = socials && socials.length > 0 ? socials : DEFAULT_SOCIALS;
  const destinationOptions =
    destinations && destinations.length > 0
      ? destinations.map((d) => d.title)
      : DEFAULT_DESTINATIONS;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    submitLead({
      form_key: "contact",
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      message: String(data.get("message") || ""),
      destination: String(data.get("destination") || ""),
      consent: data.get("privacy_consent") === "yes",
      form_started_at: Number(form.dataset.startedAt || formStartedAt),
      source_url: window.location.href,
    })
      .unwrap()
      .then(() => form.reset())
      .catch(() => {});
  };

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-stretch lg:gap-16">
        {/* Left — contact info */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-1 flex-col justify-center gap-10"
        >
          <div className="flex flex-col gap-8">
            <h2 className="text-[clamp(1.75rem,3vw,32px)] font-bold tracking-[-0.04em] text-foreground">
              {headingParts.before}
              {headingParts.highlighted && (
                <span className="italic text-primary-accent">{headingParts.highlighted}</span>
              )}
              {headingParts.after}
            </h2>
            <p className="font-body-alt text-[clamp(1.1rem,2vw,24px)] font-medium tracking-[-0.04em] text-text-secondary">
              {descriptionParts.before}
              {descriptionParts.highlighted && (
                <span className="italic text-[#909dad]">{descriptionParts.highlighted}</span>
              )}
              {descriptionParts.after}
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <p className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
              Social Media :
            </p>
            <div className="flex items-center gap-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url || "#"}
                  aria-label={social.label}
                  className="text-foreground transition-transform hover:scale-110"
                >
                  <Icon icon={social.icon} className="size-8" />
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right — form */}
          <motion.form
          data-started-at={formStartedAt}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-12 rounded-2xl border border-border bg-background p-8 lg:w-[536px] lg:shrink-0"
        >
          <p className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
            Leave your <span className="italic text-primary-accent">message</span>
          </p>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-5 sm:flex-row">
              <Field label="Name">
                <label className={fieldBox}>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Your name"
                    className="w-full bg-transparent font-body-alt text-[#909dad] placeholder:text-[#909dad] focus:outline-none"
                  />
                  <Icon
                    icon="material-symbols:person-outline-rounded"
                    className="size-4 shrink-0 text-foreground"
                  />
                </label>
              </Field>
              <Field label="Email Address">
                <label className={fieldBox}>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Your Email Address"
                    className="w-full bg-transparent font-body-alt text-foreground placeholder:text-[#909dad] focus:outline-none"
                  />
                  <Icon
                    icon="mdi:email-open-outline"
                    className="size-4 shrink-0 text-foreground"
                  />
                </label>
              </Field>
            </div>

            <Field label="Destination">
              <label className={fieldBox}>
                <select
                  name="destination"
                  defaultValue=""
                  className="w-full appearance-none bg-transparent font-body-alt text-[#909dad] focus:outline-none"
                >
                  <option value="" disabled>
                    Select a Destination
                  </option>
                  {destinationOptions.map((title) => (
                    <option key={title}>{title}</option>
                  ))}
                </select>
                <Icon
                  icon="iconoir:nav-arrow-down"
                  className="size-4 shrink-0 text-foreground"
                />
              </label>
            </Field>

            <Field label="Message">
              <textarea
                name="message"
                required
                placeholder="Message"
                rows={3}
                className="h-[95px] resize-none rounded-lg border border-border bg-white p-3 font-body-alt text-base tracking-[-0.04em] text-foreground placeholder:text-[#909dad] focus:outline-none"
              />
            </Field>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="privacy_consent"
                  value="yes"
                  required
                  className="size-6 shrink-0 rounded border border-border accent-foreground"
                />
                <span className="text-base font-semibold tracking-[-0.04em] text-foreground">
                  I agree to the <a href="/privacy" className="underline">privacy policy</a>
                </span>
              </label>
              <button
                type="submit"
                disabled={isLoading}
                className="shrink-0 rounded-lg bg-foreground px-5 py-3 font-body-alt text-lg font-medium tracking-[-0.04em] text-background transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-60"
              >
                {isLoading ? "Sending…" : submit_label}
              </button>
            </div>
            {isSuccess && (
              <p className="font-body-alt text-base font-medium text-primary">
                Thanks — we&apos;ll get back to you within one business day.
              </p>
            )}
            {isError && (
              <p className="font-body-alt text-base font-medium text-red-600">
                Something went wrong — please try again.
              </p>
            )}
          </div>
        </motion.form>
      </div>
    </section>
  );
}
