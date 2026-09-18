"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { TravelerProfile } from "@/features/account/types";

function displayName(user: TravelerProfile) {
  return user.full_name.trim() || user.email.split("@")[0] || "Traveler";
}

function firstName(user: TravelerProfile) {
  return displayName(user).split(/\s+/)[0] || "Traveler";
}

export default function AuthNavAction({
  mobile = false,
  onAction,
}: {
  mobile?: boolean;
  onAction?: () => void;
}) {
  const pathname = usePathname();
  const { status, user, logout, openOnboarding, refreshSession } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const joinHref = `/join?callbackUrl=${encodeURIComponent(pathname || "/")}`;

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node))
        setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  if (status === "loading") {
    return (
      <span
        aria-label="Loading account"
        className={
          mobile
            ? "h-12 w-full animate-pulse rounded-full bg-border"
            : "hidden h-10 w-32 animate-pulse rounded-full bg-border lg:block"
        }
      />
    );
  }

  if (status === "unavailable") {
    return (
      <button
        type="button"
        onClick={() => void refreshSession()}
        title="Account service unavailable. Try again."
        className={
          mobile
            ? "mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 py-3.5 font-body-alt text-base font-semibold text-foreground"
            : "hidden shrink-0 items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 font-body-alt text-sm font-semibold text-foreground lg:inline-flex"
        }
      >
        <Icon icon="iconoir:refresh-double" className="size-5" />
        Retry account
      </button>
    );
  }

  if (!user) {
    return (
      <Link
        href={joinHref}
        onClick={onAction}
        className={
          mobile
            ? "mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3.5 font-body-alt text-lg font-semibold text-background transition-transform active:scale-[0.98]"
            : "hidden shrink-0 items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 font-body-alt text-base font-semibold tracking-[-0.04em] text-background transition-transform hover:scale-[1.03] active:scale-95 lg:inline-flex"
        }
      >
        Join Lumora
        <Icon icon="iconoir:arrow-up-right" className="size-5" />
      </Link>
    );
  }

  if (mobile) {
    return (
      <div className="mt-2 rounded-2xl border border-border bg-surface p-3">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-body-alt text-base font-semibold text-foreground">
              Hi, {firstName(user)}
            </p>
            <p className="truncate font-body-alt text-xs text-text-secondary">
              {user.email}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          {!user.onboarding_complete && (
            <button
              type="button"
              onClick={() => {
                openOnboarding();
                onAction?.();
              }}
              className="flex-1 rounded-full bg-primary-accent px-3 py-2 font-body-alt text-sm font-semibold text-foreground"
            >
              Complete profile
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              void logout();
              onAction?.();
            }}
            className="flex-1 rounded-full border border-border px-3 py-2 font-body-alt text-sm font-semibold text-foreground"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative hidden shrink-0 lg:block">
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 font-body-alt text-sm font-semibold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="max-w-32 truncate">Hi, {firstName(user)}</span>
        <Icon icon="iconoir:nav-arrow-down" className="size-4" />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+10px)] z-[70] w-72 overflow-hidden rounded-2xl border border-border bg-surface p-3 shadow-[0_18px_60px_rgba(30,30,30,0.16)]"
          >
            <div className="min-w-0 px-2 py-2">
              <p className="truncate font-body-alt text-base font-semibold text-foreground">
                Hi, {firstName(user)}
              </p>
              <p className="truncate font-body-alt text-xs text-text-secondary">
                {user.email}
              </p>
            </div>

            {!user.onboarding_complete && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  openOnboarding();
                }}
                className="mt-1 flex w-full items-center justify-between rounded-xl bg-[#ebffe8] px-3 py-2.5 text-left font-body-alt text-sm font-semibold text-foreground"
              >
                Complete your travel profile
                <Icon icon="iconoir:arrow-up-right" className="size-5" />
              </button>
            )}

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                void logout();
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left font-body-alt text-sm font-medium text-text-secondary transition-colors hover:bg-background hover:text-foreground"
            >
              <Icon icon="iconoir:log-out" className="size-5" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
