"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import clsx from "clsx";

/** Checkout / payment — Figma node 118:5161 ("PaymentFlow"). Stepped booking
 * flow: Your Information → Payment Method → Payment Amount → confirm & pay. Each
 * step's Done collapses it to a summary with Change; once all done the agreement
 * enables "Continue & pay". Right column = order summary. Presentational. */

const TOTAL = 428;

const METHODS = [
  {
    id: "card",
    label: "Credit or debit card",
    icon: "mdi:credit-card-outline",
  },
  { id: "fonepay", label: "Fonepay", img: "/images/fonepay.png" },
] as const;

const AMOUNTS = [
  {
    id: "full",
    label: "Pay 100% now",
    note: "Total amount : $428",
    amount: TOTAL,
    pct: "100%",
  },
  {
    id: "half",
    label: "Pay 50% now",
    note: "Total amount : $214, pay remaining before 4 June, 2026",
    amount: TOTAL / 2,
    pct: "50%",
  },
] as const;

const inputBase =
  "w-full rounded-lg border border-border p-3 font-body-alt text-base tracking-[-0.04em] text-foreground placeholder:text-[#b2bbc6] focus:outline-none";
const doneBtn =
  "self-end rounded-lg bg-foreground px-5 py-3 font-body-alt text-base font-medium tracking-[-0.03em] text-background transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <span className="py-1 font-body-alt text-base font-medium tracking-[-0.02em] text-[#3d4c5e]">
        {label} <span className="text-[#c62222]">*</span>
      </span>
      {children}
    </div>
  );
}

function StepShell({
  n,
  title,
  onChange,
  children,
}: {
  n: number;
  title: string;
  onChange?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-lg border border-border p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground font-body-alt text-sm text-white">
            {n}
          </span>
          <span className="font-body-alt text-xl font-medium tracking-[-0.04em] text-foreground">
            {title}
          </span>
        </div>
        {onChange && (
          <button
            type="button"
            onClick={onChange}
            className="shrink-0 rounded-lg border border-border bg-background px-5 py-2.5 font-body-alt text-base tracking-[-0.03em] text-foreground"
          >
            Change
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function RadioRow({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center justify-between gap-3 border-b border-border pb-4 text-left last:border-b-0 last:pb-0"
    >
      {children}
      <span
        className={clsx(
          "flex size-6 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-foreground" : "border-[#b2bbc6]",
        )}
      >
        {selected && <span className="size-3 rounded-full bg-foreground" />}
      </span>
    </button>
  );
}

const dot = <span className="size-1 rounded-full bg-[#3d4c5e]" />;

export default function Checkout() {
  const router = useRouter();
  const [openStep, setOpenStep] = useState<number | null>(1);
  const [maxDone, setMaxDone] = useState(0);

  const [info, setInfo] = useState({
    fullName: "",
    dob: "",
    email: "",
    phone: "",
  });
  const [method, setMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const complete = (n: number) => {
    setMaxDone((m) => Math.max(m, n));
    setOpenStep(n < 3 ? n + 1 : null);
  };

  const allDone = maxDone >= 3;
  const selectedMethod = METHODS.find((m) => m.id === method);
  const selectedAmount = AMOUNTS.find((a) => a.id === amount);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto max-w-[1440px] px-6 py-8 lg:px-20"
    >
      {/* Header */}
      <div className="mb-10 flex flex-col gap-5">
        <nav className="flex flex-wrap items-center gap-2 font-body-alt text-base tracking-[-0.02em] text-text-secondary">
          <Link href="/packages">Packages</Link>
          <Icon icon="iconoir:nav-arrow-right" className="size-4" />
          <span>Package Description</span>
          <Icon icon="iconoir:nav-arrow-right" className="size-4" />
          <span className="font-medium text-[#2bbf0f] underline">Payment</span>
        </nav>
        <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-foreground">
          Confirm and Pay
        </h1>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Left — stepped payment flow */}
        <div className="flex flex-col gap-6 lg:w-[758px]">
          {/* Step 1 — Your Information */}
          <StepShell
            n={1}
            title="Your Information"
            onChange={
              maxDone >= 1 && openStep !== 1 ? () => setOpenStep(1) : undefined
            }
          >
            {openStep === 1 ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  complete(1);
                }}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-5 sm:flex-row">
                  <Field label="Full Name">
                    <input
                      required
                      type="text"
                      value={info.fullName}
                      onChange={(e) =>
                        setInfo({ ...info, fullName: e.target.value })
                      }
                      placeholder="Enter your full name"
                      className={inputBase}
                    />
                  </Field>
                  <Field label="Date of Birth">
                    <input
                      required
                      type="text"
                      value={info.dob}
                      onChange={(e) =>
                        setInfo({ ...info, dob: e.target.value })
                      }
                      placeholder="Enter your dob"
                      className={inputBase}
                    />
                  </Field>
                </div>
                <div className="flex flex-col gap-5 sm:flex-row">
                  <Field label="Email Address">
                    <input
                      required
                      type="email"
                      value={info.email}
                      onChange={(e) =>
                        setInfo({ ...info, email: e.target.value })
                      }
                      placeholder="Enter your email address"
                      className={inputBase}
                    />
                  </Field>
                  <Field label="Phone Number">
                    <input
                      required
                      type="tel"
                      value={info.phone}
                      onChange={(e) =>
                        setInfo({ ...info, phone: e.target.value })
                      }
                      placeholder="Enter your phone number"
                      className={inputBase}
                    />
                  </Field>
                </div>
                <button type="submit" className={doneBtn}>
                  Done
                </button>
              </form>
            ) : maxDone >= 1 ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-body-alt text-base tracking-[-0.04em] text-[#3d4c5e]">
                <span className="flex items-center gap-2">
                  <Icon icon="ion:people-outline" className="size-4" />
                  {info.fullName || "—"}
                </span>
                {dot}
                <span className="flex items-center gap-2">
                  <Icon icon="formkit:date" className="size-3.5" />
                  {info.dob || "—"}
                </span>
                {dot}
                <span className="flex items-center gap-2">
                  <Icon icon="mdi:email-outline" className="size-3.5" />
                  {info.email || "—"}
                </span>
                {dot}
                <span className="flex items-center gap-2">
                  <Icon icon="mdi:phone-outline" className="size-3.5" />
                  {info.phone || "—"}
                </span>
              </div>
            ) : null}
          </StepShell>

          {/* Step 2 — Payment Method */}
          <StepShell
            n={2}
            title="Payment Method"
            onChange={
              maxDone >= 2 && openStep !== 2 ? () => setOpenStep(2) : undefined
            }
          >
            {openStep === 2 ? (
              <>
                <div className="flex flex-col gap-4">
                  {METHODS.map((m) => (
                    <RadioRow
                      key={m.id}
                      selected={method === m.id}
                      onSelect={() => setMethod(m.id)}
                    >
                      <span className="flex items-center gap-3">
                        {"img" in m ? (
                          <Image
                            src={m.img}
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 shrink-0 object-contain"
                          />
                        ) : (
                          <Icon
                            icon={m.icon}
                            className="size-8 shrink-0 text-[#3d4c5e]"
                          />
                        )}
                        <span className="flex flex-col gap-1">
                          <span className="font-body-alt text-lg tracking-[-0.04em] text-[#3d4c5e]">
                            {m.label}
                          </span>
                          {m.id === "card" && (
                            <span className="flex items-center gap-1">
                              <Icon icon="logos:visa" height={16} />
                              <Icon icon="logos:mastercard" height={16} />
                            </span>
                          )}
                        </span>
                      </span>
                    </RadioRow>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!method}
                  onClick={() => complete(2)}
                  className={doneBtn}
                >
                  Done
                </button>
              </>
            ) : maxDone >= 2 && selectedMethod ? (
              <div className="flex items-center gap-3">
                {"img" in selectedMethod ? (
                  <Image
                    src={selectedMethod.img}
                    alt=""
                    width={32}
                    height={32}
                    className="size-8 shrink-0 object-contain"
                  />
                ) : (
                  <Icon
                    icon={selectedMethod.icon}
                    className="size-8 shrink-0 text-[#3d4c5e]"
                  />
                )}
                <span className="font-body-alt text-lg tracking-[-0.04em] text-[#3d4c5e]">
                  {selectedMethod.label}
                </span>
              </div>
            ) : null}
          </StepShell>

          {/* Step 3 — Payment Amount */}
          <StepShell
            n={3}
            title="Payment Amount"
            onChange={
              maxDone >= 3 && openStep !== 3 ? () => setOpenStep(3) : undefined
            }
          >
            {openStep === 3 ? (
              <>
                <div className="flex flex-col gap-4">
                  {AMOUNTS.map((a) => (
                    <RadioRow
                      key={a.id}
                      selected={amount === a.id}
                      onSelect={() => setAmount(a.id)}
                    >
                      <span className="flex flex-col gap-2">
                        <span className="font-body-alt text-lg tracking-[-0.04em] text-[#3d4c5e]">
                          {a.label}
                        </span>
                        <span className="font-body-alt text-base tracking-[-0.04em] text-[#3d4c5e]">
                          {a.note}
                        </span>
                      </span>
                    </RadioRow>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!amount}
                  onClick={() => complete(3)}
                  className={doneBtn}
                >
                  Done
                </button>
              </>
            ) : maxDone >= 3 && selectedAmount ? (
              <div className="flex items-center gap-2 font-body-alt tracking-[-0.04em]">
                <span className="text-base text-[#3d4c5e]">Price to pay</span>
                <span className="text-xl font-medium text-foreground">
                  ${selectedAmount.amount}
                </span>
                <span className="text-base text-primary-accent">
                  ({selectedAmount.pct} now)
                </span>
              </div>
            ) : null}
          </StepShell>

          {/* Agreement */}
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setAgreed((a) => !a)}
              aria-pressed={agreed}
              aria-label="Agree to terms and conditions"
              className={clsx(
                "flex size-6 shrink-0 items-center justify-center rounded border",
                agreed
                  ? "border-primary-accent bg-primary-accent"
                  : "border-[#a3adbb]",
              )}
            >
              {agreed && (
                <Icon icon="charm:tick" className="size-4 text-foreground" />
              )}
            </button>
            <span className="font-body-alt text-lg tracking-[-0.04em] text-[#3d4c5e]">
              I agree to terms &amp; conditions of{" "}
              <span className="underline">booking policy</span>.
            </span>
          </div>

          {/* Final action */}
          <button
            type="button"
            disabled={!allDone || !agreed}
            onClick={() => {
              if (!selectedAmount) return;
              router.push(
                `/checkout/success?simulation=1&amount=${selectedAmount.amount}`,
              );
            }}
            className={clsx(
              "w-full rounded-lg px-5 py-3 font-body-alt text-lg font-medium tracking-[-0.04em] transition-transform",
              allDone && agreed
                ? "bg-foreground text-background hover:scale-[1.01] active:scale-95"
                : "cursor-not-allowed bg-border text-[#909dad]",
            )}
          >
            {allDone && selectedAmount
              ? `Simulate payment $${selectedAmount.amount}`
              : "Next"}
          </button>
          <p className="text-sm text-text-muted">
            Demo mode only — no card details are requested and no payment is
            charged.
          </p>
        </div>

        {/* Right — order summary */}
        <div className="flex-1 rounded-lg border border-border px-6 pb-7 pt-6">
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
              <div className="flex items-center gap-2">
                <span className="font-body-alt text-base tracking-[-0.04em] text-text-secondary">
                  4 Days
                </span>
              </div>
            </div>
          </div>

          {/* Booking info */}
          <div className="flex items-center justify-between gap-2 border-b border-border py-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2">
                <Icon
                  icon="iconoir:calendar"
                  className="size-4 text-text-secondary"
                />
                <span className="font-body-alt text-lg tracking-[-0.04em] text-text-secondary">
                  Tuesday, May 24
                </span>
              </span>
              <span className="size-1 rounded-full bg-text-secondary" />
              <span className="flex items-center gap-2">
                <Icon
                  icon="ion:people-outline"
                  className="size-4 text-text-secondary"
                />
                <span className="font-body-alt text-lg tracking-[-0.04em] text-text-secondary">
                  2 Adults, 1 Child
                </span>
              </span>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-lg border border-border bg-background px-3 py-2 font-body-alt text-base tracking-[-0.03em] text-text-secondary"
            >
              Change
            </button>
          </div>

          {/* Price details */}
          <div className="flex flex-col gap-3 border-b border-border py-4">
            <p className="font-body-alt text-lg font-medium tracking-[-0.04em] text-foreground">
              Price Details
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="font-body-alt text-base tracking-[-0.04em] text-text-secondary">
                2 Adult X $140 + 1 Child X $88
              </span>
              <span className="font-body-alt text-lg font-medium tracking-[-0.04em] text-foreground">
                $380
              </span>
            </div>
          </div>

          {/* Subtotal + promo applied */}
          <div className="flex flex-col gap-3 py-4">
            <div className="flex items-center justify-between">
              <span className="font-body-alt text-base tracking-[-0.04em] text-text-secondary">
                Subtotal
              </span>
              <span className="font-body-alt text-lg font-medium tracking-[-0.04em] text-foreground">
                $380
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-alt text-base tracking-[-0.04em] text-text-secondary">
                Promo code (PromocoX)
              </span>
              <span className="font-body-alt text-lg tracking-[-0.04em] text-[#44a33c]">
                -$40
              </span>
            </div>
          </div>

          {/* Promo input */}
          <div className="flex flex-col gap-3 border-b border-border pb-4">
            <p className="font-body-alt text-lg font-medium tracking-[-0.04em] text-foreground">
              Promo code
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter promo code"
                className="flex-1 rounded-lg border border-foreground p-3 font-body-alt text-base tracking-[-0.04em] text-foreground placeholder:text-[#a3adbb] focus:outline-none"
              />
              <button
                type="button"
                className="shrink-0 rounded-lg border border-foreground px-4 py-3 font-body-alt text-base font-medium tracking-[-0.03em] text-foreground"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="mt-5 flex items-center justify-between rounded border border-[#2bbf0f] bg-background px-4 py-3">
            <span className="font-body-alt text-lg font-medium tracking-[-0.04em] text-foreground">
              Total Price
            </span>
            <span className="font-body-alt text-xl font-medium tracking-[-0.04em] text-[#2ecc10]">
              ${TOTAL}
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
