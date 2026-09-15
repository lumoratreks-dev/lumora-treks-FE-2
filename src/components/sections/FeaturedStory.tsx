"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { formatBlogDate } from "@/components/ui/BlogCard";
import type { BlogPostData } from "@/types";

/** FeaturedStory — the oversized hero card at the top of the blog index
 * (editorial magazine layout): full-bleed image on the left, headline + excerpt
 * + byline + neon "Read story" CTA on the right. Reveals with a whileInView
 * fade-up; the image scales gently on hover. */
export default function FeaturedStory({ post }: { post: BlogPostData }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-[1400px] px-6 lg:px-10"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group grid overflow-hidden rounded-3xl border border-border bg-white lg:grid-cols-2"
      >
        <div className="relative aspect-[16/11] overflow-hidden lg:aspect-auto">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <span className="absolute left-6 top-6 rounded-full bg-primary-accent px-4 py-1.5 text-sm font-bold tracking-[-0.02em] text-foreground">
            Featured
          </span>
        </div>

        <div className="flex flex-col justify-center gap-5 p-8 lg:p-12">
          <span className="text-sm font-semibold uppercase tracking-[0.08em] text-primary-active">
            {post.category}
          </span>
          <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight tracking-[-0.05em] text-foreground">
            {post.title}
          </h2>
          <p className="font-body-alt text-base tracking-[-0.02em] text-text-secondary md:text-lg">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold tracking-[-0.02em] text-foreground">
                {post.author.name}
              </p>
              <p className="text-xs text-text-muted">
                {formatBlogDate(post.date)} · {post.readTime}
              </p>
            </div>
          </div>

          <span className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold tracking-[-0.02em] text-background transition-colors group-hover:bg-secondary-hover">
            Read story
            <Icon
              icon="iconoir:arrow-up-right"
              className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </Link>
    </motion.section>
  );
}
