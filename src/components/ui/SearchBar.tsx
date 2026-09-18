"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import clsx from "clsx";

/** SearchBar — Location + Date fields with a neon-green search button. Submits to
 * `/packages?location=&date=`. Shared by the landing hero and page heroes. */
type SearchBarProps = {
  className?: string;
};

type DateInputWithPicker = HTMLInputElement & {
  showPicker?: () => void;
};

function localISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function SearchBar({ className }: SearchBarProps) {
  const router = useRouter();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const today = localISODate(new Date());

  const formattedDate = date
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(`${date}T00:00:00`))
    : "Travel date";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (date.trim()) params.set("date", date.trim());
    const qs = params.toString();
    router.push(qs ? `/packages?${qs}` : "/packages");
  };

  const openDatePicker = () => {
    const input = dateInputRef.current as DateInputWithPicker | null;
    if (!input) return;
    input.focus();
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.click();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        "flex flex-col gap-3 rounded-2xl border border-white/50 bg-background/90 p-3 shadow-[0_18px_60px_rgba(30,30,30,0.12)] backdrop-blur-sm sm:flex-row sm:items-center",
        className
      )}
    >
      <label className="flex h-[56px] flex-1 items-center justify-between rounded-xl border border-border bg-white px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-colors focus-within:border-primary-active">
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-transparent font-body-alt text-lg font-medium tracking-[-0.04em] text-foreground placeholder:text-foreground/70 focus:outline-none"
        />
        <Icon icon="proicons:location" className="size-5 shrink-0 text-foreground" />
      </label>

      <div
        role="button"
        tabIndex={0}
        aria-label="Select travel date"
        onClick={openDatePicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDatePicker();
          }
        }}
        className="relative flex h-[56px] flex-1 items-center rounded-xl border border-border bg-white px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-colors focus-within:border-primary-active"
      >
        <input
          ref={dateInputRef}
          type="date"
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="pointer-events-none absolute inset-0 opacity-0"
        />
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eef7e8] text-primary-active">
            <Icon icon="iconoir:calendar" className="size-4.5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
              Departure
            </p>
            <p className="truncate font-body-alt text-lg font-medium tracking-[-0.04em] text-foreground">
              {formattedDate}
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        aria-label="Search"
        className="flex h-[56px] items-center justify-center rounded-xl bg-primary-accent px-5 text-foreground transition-transform hover:scale-[1.03] active:scale-95"
      >
        <Icon icon="mingcute:search-line" className="size-6" />
      </button>
    </form>
  );
}
