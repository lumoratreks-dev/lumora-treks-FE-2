"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import type { BlogPostData } from "@/types";

/** Format an ISO date as e.g. "28 Aug 2026". Date-only values ("2026-08-28")
 * are formatted in UTC so every viewer (and the server) sees the same day. */
export function formatBlogDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? { timeZone: "UTC" } : {}),
  });
}

/** "28 Aug 2026 · 6 min read", skipping whichever part is missing. */
export function formatBlogMeta(post: { date: string; readTime: string }) {
  return [formatBlogDate(post.date), post.readTime].filter(Boolean).join(" · ");
}

/** BlogCard — image + category chip + title + excerpt + author/date/read-time.
 * The `wide` variant lays the image and text side-by-side (used as an accent
 * tile in the editorial grid). Hover lifts the card and slowly scales the image;
 * the whole card links to the article. */
type BlogCardProps = {
  post: BlogPostData;
  variant?: "default" | "wide";
  className?: string;
};

export default function BlogCard({
  post,
  variant = "default",
  className,
}: BlogCardProps) {
  const wide = variant === "wide";

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={clsx("group h-full", className)}
    >
      <Link
        href={`/blog/${post.slug}`}
        className={clsx(
          "flex h-full overflow-hidden rounded-2xl border border-border bg-white",
          wide ? "flex-col sm:flex-row" : "flex-col",
        )}
      >
        <div
          className={clsx(
            "relative shrink-0 overflow-hidden",
            wide ? "aspect-[16/10] sm:aspect-auto sm:w-1/2" : "aspect-[16/10]",
          )}
        >
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes={
              wide
                ? "(max-width: 640px) 100vw, 40vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {post.category ? (
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-[-0.02em] text-foreground backdrop-blur-sm">
              {post.category}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <h3
            className={clsx(
              "font-bold tracking-[-0.04em] text-foreground transition-colors group-hover:text-primary-active",
              wide ? "text-xl" : "text-lg",
            )}
          >
            {post.title}
          </h3>
          <p className="line-clamp-2 flex-1 font-body-alt text-sm tracking-[-0.02em] text-text-secondary">
            {post.excerpt}
          </p>

          <div className="mt-1 flex items-center gap-3 border-t border-border pt-4">
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={32}
              height={32}
              className="size-8 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold tracking-[-0.02em] text-foreground">
                {post.author.name}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-text-muted">
                {post.date ? <span>{formatBlogDate(post.date)}</span> : null}
                {post.date && post.readTime ? <span aria-hidden>·</span> : null}
                {post.readTime ? (
                  <span className="inline-flex items-center gap-1">
                    <Icon icon="iconoir:clock" className="size-3.5" />
                    {post.readTime}
                  </span>
                ) : null}
              </p>
            </div>
            <Icon
              icon="iconoir:arrow-up-right"
              className="size-5 shrink-0 text-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
