"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import clsx from "clsx";

/** Location search with a neon-green submit button. Shared by the landing hero
 * and page heroes; submits to `/packages?location=`. */
type SearchBarProps = {
  className?: string;
  /** Accessible name of the location field. */
  label?: string;
  placeholder?: string;
  /** Accessible name of the icon-only submit button. */
  buttonLabel?: string;
};

export default function SearchBar({
  className,
  label = "Location",
  placeholder = "Location",
  buttonLabel = "Search",
}: SearchBarProps) {
  const router = useRouter();
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    const qs = params.toString();
    router.push(qs ? `/packages?${qs}` : "/packages");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        "flex flex-col gap-3 rounded-2xl border border-white/50 bg-background/90 p-3 shadow-[0_18px_60px_rgba(30,30,30,0.12)] backdrop-blur-sm sm:flex-row sm:items-center",
        className,
      )}
    >
      <label className="flex h-[56px] flex-1 items-center justify-between rounded-xl border border-border bg-white px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-colors focus-within:border-primary-active">
        <input
          type="text"
          aria-label={label}
          placeholder={placeholder}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-transparent font-body-alt text-lg font-medium tracking-[-0.04em] text-foreground placeholder:text-foreground/70 focus:outline-none"
        />
        <Icon
          icon="proicons:location"
          className="size-5 shrink-0 text-foreground"
        />
      </label>

      <button
        type="submit"
        aria-label={buttonLabel}
        className="flex h-[56px] items-center justify-center rounded-xl bg-primary-accent px-5 text-foreground transition-transform hover:scale-[1.03] active:scale-95"
      >
        <Icon icon="mingcute:search-line" className="size-6" />
      </button>
    </form>
  );
}
