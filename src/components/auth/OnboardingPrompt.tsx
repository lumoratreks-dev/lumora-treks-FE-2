"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";
import type { TravelerProfile } from "@/features/account/types";

const INTERESTS = [
  ["trekking", "Trekking", "ph:mountains"],
  ["sightseeing", "Sightseeing", "iconoir:binocular"],
  ["paragliding", "Paragliding", "ph:parachute"],
  ["culture", "Culture", "ph:temple"],
  ["nature", "Nature", "ph:leaf"],
  ["wildlife", "Wildlife", "ph:paw-print"],
  ["wellness", "Wellness", "ph:flower-lotus"],
] as const;

const TRAVELER_TYPES = [
  ["solo", "Solo"],
  ["couple", "Couple"],
  ["family", "Family"],
  ["friends", "Friends"],
  ["group", "Group"],
] as const;

function OnboardingForm({ user }: { user: TravelerProfile }) {
  const { completeOnboarding, dismissOnboarding } = useAuth();
  const [fullName, setFullName] = useState(user.full_name);
  const [travelerType, setTravelerType] = useState(user.traveler_type);
  const [interests, setInterests] = useState<string[]>(user.interests);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleInterest = (interest: string) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fullName.trim().length < 2) {
      setError("Enter your full name.");
      return;
    }
    if (!travelerType) {
      setError("Choose how you usually travel.");
      return;
    }
    if (interests.length === 0) {
      setError("Choose at least one travel interest.");
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      await completeOnboarding({
        full_name: fullName.trim(),
        traveler_type: travelerType,
        interests,
      });
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Your profile could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid max-h-[min(820px,calc(100vh-32px))] overflow-y-auto lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-foreground p-8 text-background lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-20 -top-14 size-60 rounded-full border border-primary-accent/30" />
        <div className="absolute -right-8 top-2 size-40 rounded-full border border-primary-accent/20" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-background/20 px-3 py-1 font-body-alt text-xs font-semibold uppercase tracking-[0.12em]">
            <Icon icon="ph:path" className="size-4 text-primary-accent" />
            Traveler profile
          </span>
          <h2 className="mt-7 text-[34px] font-semibold leading-[1.05] tracking-[-0.055em]">
            Tell us what calls you outside.
          </h2>
          <p className="mt-4 font-body-alt text-sm leading-relaxed text-background/70">
            We&apos;ll use these details to shape future trip ideas around you.
          </p>
        </div>

        <div className="relative mt-10 space-y-0 font-body-alt text-xs text-background/70">
          {["Your name", "Your travel style", "Your interests"].map(
            (label, index) => (
              <div key={label} className="flex min-h-14 items-start gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary-accent text-[10px] font-bold text-foreground">
                    {index + 1}
                  </span>
                  {index < 2 && <span className="h-8 w-px bg-background/20" />}
                </div>
                <span className="pt-1">{label}</span>
              </div>
            ),
          )}
        </div>
      </aside>

      <form onSubmit={handleSubmit} className="bg-surface p-5 sm:p-8 lg:p-10">
        <div className="mb-7 flex items-start justify-between gap-4 lg:hidden">
          <div>
            <p className="font-body-alt text-xs font-bold uppercase tracking-[0.12em] text-primary-active">
              Traveler profile
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">
              Make Lumora yours
            </h2>
          </div>
          <button
            type="button"
            onClick={dismissOnboarding}
            aria-label="Close onboarding"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-foreground"
          >
            <Icon icon="iconoir:xmark" className="size-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={dismissOnboarding}
          aria-label="Close onboarding"
          className="ml-auto hidden size-10 items-center justify-center rounded-full bg-background text-foreground transition-colors hover:bg-border lg:flex"
        >
          <Icon icon="iconoir:xmark" className="size-5" />
        </button>

        <div className="lg:-mt-2">
          <label
            htmlFor="traveler-full-name"
            className="font-body-alt text-sm font-semibold text-foreground"
          >
            Full name
          </label>
          <input
            id="traveler-full-name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            autoFocus
            maxLength={150}
            required
            placeholder="Your full name"
            className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3.5 font-body-alt text-base text-foreground outline-none transition-shadow placeholder:text-text-muted focus:border-foreground focus:ring-2 focus:ring-primary-accent/50"
          />
          <p className="mt-2 font-body-alt text-xs text-text-muted">
            Signed in as {user.email}
          </p>
        </div>

        <fieldset className="mt-7">
          <legend className="font-body-alt text-sm font-semibold text-foreground">
            How do you usually travel?
          </legend>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {TRAVELER_TYPES.map(([value, label]) => {
              const selected = travelerType === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setTravelerType(value)}
                  className={`rounded-xl border px-2 py-3 font-body-alt text-sm font-semibold transition-colors ${
                    selected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-white text-text-secondary hover:border-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-7">
          <legend className="font-body-alt text-sm font-semibold text-foreground">
            What are you interested in?
          </legend>
          <p className="mt-1 font-body-alt text-xs text-text-muted">
            Choose one or more.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {INTERESTS.map(([value, label, icon]) => {
              const selected = interests.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleInterest(value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 font-body-alt text-sm font-medium transition-colors ${
                    selected
                      ? "border-[#8bea78] bg-[#ebffe8] text-foreground"
                      : "border-border bg-white text-text-secondary hover:border-foreground"
                  }`}
                >
                  <Icon icon={icon} className="size-4" />
                  {label}
                  {selected && <Icon icon="iconoir:check" className="size-4" />}
                </button>
              );
            })}
          </div>
        </fieldset>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-50 px-4 py-3 font-body-alt text-sm font-medium text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-64 font-body-alt text-xs leading-relaxed text-text-muted">
            Close for now and we&apos;ll ask again when you return.
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex min-w-48 items-center justify-center gap-2 rounded-full bg-primary-accent px-6 py-3.5 font-body-alt text-sm font-bold text-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Icon icon="svg-spinners:ring-resize" className="size-5" />
                Saving…
              </>
            ) : (
              <>
                Save my travel profile
                <Icon icon="iconoir:arrow-up-right" className="size-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function OnboardingPrompt() {
  const { user, isOnboardingOpen, dismissOnboarding } = useAuth();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOnboardingOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOnboardingOpen]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      dismissOnboarding();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => element.getClientRects().length > 0);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <AnimatePresence>
      {isOnboardingOpen && user && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
            onKeyDown={handleKeyDown}
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-[900px] overflow-hidden rounded-[28px] border border-white/20 bg-surface shadow-[0_28px_100px_rgba(0,0,0,0.3)]"
          >
            <span id="onboarding-title" className="sr-only">
              Complete your Lumora traveler profile
            </span>
            <OnboardingForm key={user.id} user={user} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
