"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import type { CmsHeadingGroup } from "@/lib/blocks";

/** FAQ + contact — Figma node 49:654 ("Page Container"). Interactive accordion;
 * only Q1 has answer copy in Figma, the rest reuse it as placeholder.
 *
 * Props mirror the backend `FAQBlock` (apps/cms/blocks/sections.py). `answer`
 * is Wagtail rich text (already-expanded HTML from the API), rendered via
 * `dangerouslySetInnerHTML` — safe here since it's CMS-authored content, not
 * user input. The side card's inline color accents ("answer"/"asap") have no
 * highlight field on the backend block, so CMS-authored copy renders plain;
 * only this file's untouched defaults keep the accent. */

export type FAQItem = {
  question: string;
  answer?: string;
  open_by_default?: boolean;
};
export type FAQButton = { label?: string; href?: string };

const DEFAULT_HEADING: CmsHeadingGroup = {
  heading: "Frequently Asked Questions",
  description: "These are the questions we hear more often.",
};

export default function FAQSection({
  heading = DEFAULT_HEADING,
  items,
  show_side_card = true,
  side_card_heading,
  side_card_text,
  side_card_button = { label: "Reserve Now", href: "/contact" },
}: {
  heading?: CmsHeadingGroup;
  items?: FAQItem[];
  show_side_card?: boolean;
  side_card_heading?: string;
  side_card_text?: string;
  side_card_button?: FAQButton;
} = {}) {
  const faqItems = items ?? [];
  const defaultOpen = faqItems.findIndex((item) => item.open_by_default);
  const [openIndex, setOpenIndex] = useState<number | null>(
    defaultOpen === -1 ? 0 : defaultOpen,
  );

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-24">
      <div className="mb-12 flex flex-col items-center gap-4 text-center">
        {heading.heading && (
          <h2 className="text-[clamp(1.75rem,3vw,32px)] font-bold tracking-[-0.06em] text-foreground">
            {heading.heading}
          </h2>
        )}
        {heading.description && (
          <p className="font-body-alt text-[clamp(1.05rem,2vw,24px)] font-medium tracking-[-0.04em] text-text-secondary">
            {heading.description}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-[60px]">
        {/* Accordion */}
        <div className="flex flex-1 flex-col gap-7">
          {faqItems.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="border-b border-border pb-7 animate-pulse"
                >
                  <div className="h-6 w-3/4 rounded bg-muted" />
                </div>
              ))
            : faqItems.map((faq, i) => {
                const open = openIndex === i;
                return (
                  <div
                    key={faq.question}
                    className="border-b border-border pb-7"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <span className="text-xl font-semibold tracking-[-0.04em] text-foreground">
                        {faq.question}
                      </span>
                      <Icon
                        icon={open ? "charm:cross" : "tabler:plus-filled"}
                        className="size-8 shrink-0 text-foreground"
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {open && faq.answer && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="overflow-hidden font-body-alt text-lg tracking-[-0.04em] text-text-secondary"
                        >
                          <span
                            className="mt-3 block"
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
        </div>

        {/* Contact card */}
        {show_side_card && (
          <div className="flex flex-col items-center justify-center gap-8 rounded-2xl bg-background px-8 py-10 text-center lg:w-[490px] lg:shrink-0">
            <p className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
              {side_card_heading ?? (
                <>
                  Don&apos;t see the{" "}
                  <span className="text-primary-accent">answer</span> you need?
                </>
              )}
            </p>
            <p className="font-body-alt text-lg font-medium tracking-[-0.04em] text-text-secondary">
              {side_card_text ?? (
                <>
                  That&apos;s ok. Just drop a message and we will get back to
                  you{" "}
                  <span className="uppercase text-primary-accent">asap</span>.
                </>
              )}
            </p>
            {side_card_button?.href && (
              <a
                href={side_card_button.href}
                className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-3 font-body-alt text-lg font-medium tracking-[-0.04em] text-background transition-transform hover:scale-[1.03] active:scale-95"
              >
                {side_card_button.label || "Reserve Now"}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
