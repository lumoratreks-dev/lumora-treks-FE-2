"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useCallback, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function JoinExperience({
  callbackUrl,
}: {
  callbackUrl: string;
}) {
  const router = useRouter();
  const { status, refreshSession } = useAuth();

  const continueToSite = useCallback(() => {
    router.replace(callbackUrl);
    router.refresh();
  }, [callbackUrl, router]);

  useEffect(() => {
    if (status === "authenticated") continueToSite();
  }, [continueToSite, status]);

  return (
    <section className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
      <div className="grid overflow-hidden rounded-[28px] border border-border bg-surface shadow-[0_18px_60px_rgba(30,30,30,0.07)] lg:grid-cols-[1.3fr_0.7fr]">
        <div className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-12 lg:px-14 lg:py-14">
          <div className="mb-7 flex size-11 items-center justify-center rounded-2xl bg-[#ebffe8]">
            <Icon icon="ph:path" className="size-6 text-primary-active" />
          </div>
          <p className="font-body-alt text-xs font-bold uppercase tracking-[0.16em] text-primary-active">
            Join Lumora
          </p>
          <h1 className="mt-3 max-w-[620px] text-[clamp(2.5rem,4.2vw,4rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-foreground">
            Your trail, shaped around you.
          </h1>
          <p className="mt-5 max-w-md font-body-alt text-base leading-relaxed tracking-[-0.015em] text-text-secondary sm:text-[1.0625rem]">
            Sign in to save your travel preferences and make every Lumora
            experience feel more personal.
          </p>

          <div className="mt-9">
            {status === "loading" || status === "authenticated" ? (
              <div className="flex h-11 w-full max-w-[340px] items-center justify-center rounded-full border border-border bg-background font-body-alt text-sm font-semibold text-text-secondary">
                <Icon icon="svg-spinners:ring-resize" className="mr-2 size-5" />
                Checking your account…
              </div>
            ) : status === "unavailable" ? (
              <div className="w-full max-w-[340px] rounded-2xl border border-amber-300 bg-amber-50 p-4 font-body-alt text-sm text-amber-900">
                <p>The account service is temporarily unavailable.</p>
                <button
                  type="button"
                  onClick={() => void refreshSession()}
                  className="mt-3 inline-flex items-center gap-2 font-bold text-foreground underline underline-offset-4"
                >
                  <Icon icon="iconoir:refresh-double" className="size-4" />
                  Try again
                </button>
              </div>
            ) : (
              <GoogleSignInButton />
            )}
          </div>

          <div className="mt-9 border-t border-border pt-5 font-body-alt text-sm leading-relaxed text-text-secondary">
            Prefer to ask a question first?{" "}
            <Link
              href="/enquiry"
              className="font-bold text-primary-active underline decoration-primary-active/40 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
            >
              Send an enquiry
            </Link>
            <span className="text-text-muted"> — no sign-in needed.</span>
          </div>
        </div>

        <div className="relative hidden min-h-[500px] overflow-hidden lg:block">
          <Image
            src="/images/region-everest.png"
            alt="Mountain trail in the Everest region"
            fill
            priority
            sizes="(min-width: 1024px) 34vw, 0px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/10 to-transparent" />

          <div className="absolute bottom-7 left-7 right-7 border-l-2 border-primary-accent pl-4 text-white">
            <p className="font-body-alt text-[11px] font-bold uppercase tracking-[0.16em] text-primary-accent">
              Lumora Treks
            </p>
            <p className="mt-2 max-w-[240px] text-xl font-semibold leading-tight tracking-[-0.04em]">
              Find the journey that fits you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
