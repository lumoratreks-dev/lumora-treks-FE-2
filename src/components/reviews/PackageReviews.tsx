"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

type Review = {
  id: number;
  author_name: string;
  rating: number;
  body: string;
  created_at: string;
  updated_at: string;
  is_mine: boolean;
};

type ReviewResponse = {
  meta: { total_count: number; limit: number; offset: number };
  items: Review[];
  summary: {
    total: number;
    average: number;
    distribution: Record<string, number>;
  };
};

type Testimonial = {
  id: string | number;
  author_name: string;
  rating: number;
  quote: string;
};

function Stars({
  rating,
  interactive,
  onChange,
}: {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const value = index + 1;
        const icon = (
          <Icon
            icon={value <= rating ? "iconoir:star-solid" : "iconoir:star"}
            className="size-5"
          />
        );
        return interactive ? (
          <button
            key={value}
            type="button"
            onClick={() => onChange?.(value)}
            className="rounded p-0.5 text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-active"
            aria-label={`Rate ${value} stars`}
          >
            {icon}
          </button>
        ) : (
          <span key={value} className="text-primary">
            {icon}
          </span>
        );
      })}
    </div>
  );
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function PackageReviews({
  packageId,
  packageSlug,
  initialAverage,
  initialCount,
  testimonials = [],
}: {
  packageId: string | number;
  packageSlug: string;
  initialAverage: number;
  initialCount: number;
  testimonials?: Testimonial[];
}) {
  const { status, user } = useAuth();
  const [data, setData] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async (offset = 0, append = false) => {
      try {
        const response = await fetch(
          `/api/reviews/${encodeURIComponent(String(packageId))}?limit=5&offset=${offset}`,
          { cache: "no-store" },
        );
        if (!response.ok) throw new Error("Reviews could not be loaded.");
        const next = (await response.json()) as ReviewResponse;
        setData((current) =>
          append && current
            ? { ...next, items: [...current.items, ...next.items] }
            : next,
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Reviews could not be loaded.",
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [packageId],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const ownReview = useMemo(
    () => data?.items.find((review) => review.is_mine),
    [data],
  );
  const callbackUrl = `/packages/${packageSlug}#reviews`;
  const summary = data?.summary ?? {
    total: initialCount,
    average: initialAverage,
    distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
  };

  const openEditor = () => {
    if (!user) return;
    setError("");
    setRating(ownReview?.rating ?? 5);
    setBody(ownReview?.body ?? "");
    setEditorOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        `/api/reviews/${encodeURIComponent(String(packageId))}`,
        {
          method: ownReview ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, body }),
        },
      );
      const result = (await response.json().catch(() => null)) as {
        detail?: string;
      } | null;
      if (!response.ok)
        throw new Error(result?.detail || "Your review could not be saved.");
      setEditorOpen(false);
      await load();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Your review could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (
      !ownReview ||
      !window.confirm("Delete your review? You can add a new one later.")
    )
      return;
    setError("");
    const response = await fetch(
      `/api/reviews/${encodeURIComponent(String(packageId))}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as {
        detail?: string;
      } | null;
      setError(result?.detail || "Your review could not be deleted.");
      return;
    }
    await load();
  };

  return (
    <section id="reviews" className="scroll-mt-28 border-t border-border pt-9">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-body-alt text-xs font-bold uppercase tracking-[0.15em] text-primary-active">
            Traveler notes
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
            Reviews & ratings
          </h2>
        </div>
        {status === "loading" ? null : user ? (
          <button
            type="button"
            onClick={openEditor}
            className="rounded-full bg-foreground px-5 py-3 font-body-alt text-sm font-semibold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {ownReview ? "Edit your review" : "Write a review"}
          </button>
        ) : (
          <Link
            href={`/join?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="rounded-full bg-foreground px-5 py-3 text-center font-body-alt text-sm font-semibold text-background transition-transform hover:scale-[1.02]"
          >
            Sign in to review
          </Link>
        )}
      </div>

      <div className="mt-7 grid gap-7 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-2xl bg-[#f4f8ef] p-5">
          <div className="flex items-end gap-3">
            <span className="text-4xl font-semibold tracking-[-0.06em] text-foreground">
              {summary.average.toFixed(1)}
            </span>
            <span className="pb-1 font-body-alt text-sm text-text-secondary">
              out of 5
            </span>
          </div>
          <div className="mt-3">
            <Stars rating={Math.round(summary.average)} />
          </div>
          <p className="mt-2 font-body-alt text-sm text-text-secondary">
            {summary.total} {summary.total === 1 ? "review" : "reviews"}
          </p>
          <div className="mt-5 space-y-2.5">
            {[5, 4, 3, 2, 1].map((value) => {
              const count = summary.distribution[String(value)] || 0;
              const width = summary.total ? (count / summary.total) * 100 : 0;
              return (
                <div
                  key={value}
                  className="flex items-center gap-2 text-xs font-medium text-text-secondary"
                >
                  <span className="w-3">{value}</span>
                  <Icon
                    icon="iconoir:star-solid"
                    className="size-3 text-primary"
                  />
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${width}%` }}
                    />
                  </span>
                  <span className="w-4 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="space-y-4">
          {editorOpen && (
            <div className="rounded-2xl border border-primary/30 bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-foreground">
                  {ownReview ? "Update your review" : "Share your experience"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="rounded-full p-1.5 text-text-secondary hover:bg-background"
                  aria-label="Close review form"
                >
                  <Icon icon="iconoir:xmark" className="size-5" />
                </button>
              </div>
              <div className="mt-4">
                <Stars rating={rating} interactive onChange={setRating} />
              </div>
              <label
                className="mt-4 block font-body-alt text-sm font-semibold text-foreground"
                htmlFor="review-body"
              >
                Your review
              </label>
              <textarea
                id="review-body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                minLength={10}
                maxLength={2000}
                rows={5}
                placeholder="What stood out about this trip?"
                className="mt-2 w-full resize-y rounded-xl border border-border bg-background p-3 font-body-alt text-sm leading-relaxed text-foreground outline-none transition focus:border-primary-active"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-3 py-2 font-body-alt text-sm font-semibold text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving || body.trim().length < 10}
                  onClick={() => void save()}
                  className="rounded-full bg-foreground px-4 py-2 font-body-alt text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save review"}
                </button>
              </div>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 font-body-alt text-sm text-red-700"
            >
              {error}
            </p>
          )}
          {loading ? (
            <p className="font-body-alt text-sm text-text-secondary">
              Loading reviews…
            </p>
          ) : null}
          {!loading && !data?.items.length && !testimonials.length ? (
            <p className="rounded-2xl border border-dashed border-border p-6 font-body-alt text-sm leading-relaxed text-text-secondary">
              No traveler reviews yet. Be the first to share your experience.
            </p>
          ) : null}
          {data?.items.map((review) => (
            <article
              key={review.id}
              className={`rounded-2xl border p-5 ${review.is_mine ? "border-primary/40 bg-[#f7fbf3]" : "border-border bg-surface"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      {review.is_mine ? "Your review" : review.author_name}
                    </h3>
                    {review.is_mine && (
                      <span className="rounded-full bg-primary-accent px-2 py-0.5 font-body-alt text-[10px] font-bold uppercase tracking-wide text-foreground">
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-body-alt text-xs text-text-muted">
                    {dateLabel(review.updated_at)}
                  </p>
                </div>
                <Stars rating={review.rating} />
              </div>
              <p className="mt-4 font-body-alt text-sm leading-relaxed text-text-secondary">
                {review.body}
              </p>
              {review.is_mine && (
                <div className="mt-4 flex gap-4 font-body-alt text-sm font-semibold">
                  <button
                    type="button"
                    onClick={openEditor}
                    className="text-primary-active underline underline-offset-4"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove()}
                    className="text-text-secondary underline underline-offset-4"
                  >
                    Delete
                  </button>
                </div>
              )}
            </article>
          ))}
          {testimonials.map((review) => (
            <article
              key={`testimonial-${review.id}`}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {review.author_name}
                  </h3>
                  <p className="mt-1 font-body-alt text-xs text-text-muted">
                    Lumora traveler
                  </p>
                </div>
                <Stars rating={review.rating} />
              </div>
              <p className="mt-4 font-body-alt text-sm leading-relaxed text-text-secondary">
                {review.quote}
              </p>
            </article>
          ))}
          {data &&
            data.meta.offset + data.items.length < data.meta.total_count && (
              <button
                type="button"
                disabled={loadingMore}
                onClick={() => {
                  setLoadingMore(true);
                  void load(data.items.length, true);
                }}
                className="rounded-full border border-border px-4 py-2 font-body-alt text-sm font-semibold text-foreground disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Load more reviews"}
              </button>
            )}
        </div>
      </div>
    </section>
  );
}
