"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

type SocialShareProps = {
  title: string;
  variant?: "menu" | "rail";
  inverted?: boolean;
};

const destinations = [
  {
    icon: "prime:twitter",
    label: "Share on X",
    href: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    icon: "mdi:facebook",
    label: "Share on Facebook",
    href: (url: string, title: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
  },
  {
    icon: "mdi:whatsapp",
    label: "Share on WhatsApp",
    href: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    icon: "mdi:linkedin",
    label: "Share on LinkedIn",
    href: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

async function copyCurrentUrl() {
  const url = window.location.href;

  try {
    await navigator.clipboard.writeText(url);
  } catch {
    const input = document.createElement("textarea");
    input.value = url;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
}

export default function SocialShare({
  title,
  variant = "menu",
  inverted = false,
}: SocialShareProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", close);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const share = (href: (url: string, shareTitle: string) => string) => {
    window.open(
      href(window.location.href, title),
      "_blank",
      "noopener,noreferrer",
    );
    setOpen(false);
  };

  const copy = async () => {
    await copyCurrentUrl();
    setCopied(true);
  };

  if (variant === "rail") {
    return (
      <div className="flex h-fit flex-col items-center gap-3">
        <span className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
          Share
        </span>
        {destinations.map((destination) => (
          <button
            key={destination.label}
            type="button"
            onClick={() => share(destination.href)}
            aria-label={destination.label}
            className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-foreground transition-colors hover:border-foreground/40 hover:bg-background"
          >
            <Icon icon={destination.icon} className="size-5" />
          </button>
        ))}
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Link copied" : "Copy link"}
          className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-foreground transition-colors hover:border-foreground/40 hover:bg-background"
        >
          <Icon
            icon={copied ? "iconoir:check" : "iconoir:link"}
            className="size-5"
          />
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? "Link copied" : ""}
        </span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Share this page"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex size-11 items-center justify-center rounded-full transition-colors ${
          inverted
            ? "bg-black/30 text-white hover:bg-black/45"
            : "text-foreground hover:bg-background"
        }`}
      >
        <Icon icon="iconoir:share-android" className="size-7" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-56 overflow-hidden rounded-2xl border border-border bg-white p-2 text-foreground shadow-xl"
        >
          {destinations.map((destination) => (
            <button
              key={destination.label}
              type="button"
              role="menuitem"
              onClick={() => share(destination.href)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-body-alt text-sm font-medium transition-colors hover:bg-background"
            >
              <Icon icon={destination.icon} className="size-5" />
              {destination.label}
            </button>
          ))}
          <div className="my-1 border-t border-border" />
          <button
            type="button"
            role="menuitem"
            onClick={copy}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-body-alt text-sm font-medium transition-colors hover:bg-background"
          >
            <Icon
              icon={copied ? "iconoir:check" : "iconoir:link"}
              className="size-5"
            />
            {copied ? "Link copied" : "Copy link"}
          </button>
          <span className="sr-only" aria-live="polite">
            {copied ? "Link copied" : ""}
          </span>
        </div>
      ) : null}
    </div>
  );
}
