"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { formatBlogDate } from "@/components/ui/BlogCard";
import type { BlogPostData } from "@/types";

const EASE_EXPO_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** ArticleHero — cinematic full-bleed image with the headline layered over a
 * bottom gradient (same foreground/background layering language as the landing
 * Hero / CTABand), plus the category, byline, date and read-time. The image
 * settles from a gentle scale-up on load. */
export default function ArticleHero({ post }: { post: BlogPostData }) {
  return (
    <section className="relative w-full overflow-hidden">
      <motion.div
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: EASE_EXPO_OUT }}
        className="relative h-[62vh] min-h-[420px] w-full lg:h-[72vh]"
      >
        <Image
          src={post.image}
          alt={post.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e]/85 via-[#1e1e1e]/25 to-transparent" />
      </motion.div>

      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto max-w-[900px] px-6 pb-10 lg:pb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_EXPO_OUT, delay: 0.25 }}
            className="flex flex-col gap-5 text-background"
          >
            <Link
              href="/blog"
              className="flex w-fit items-center gap-1.5 text-sm font-semibold tracking-[-0.02em] text-background/80 transition-colors hover:text-background"
            >
              <Icon icon="iconoir:nav-arrow-left" className="size-4" />
              All stories
            </Link>

            <span className="w-fit rounded-full bg-primary-accent px-4 py-1.5 text-sm font-bold tracking-[-0.02em] text-foreground">
              {post.category}
            </span>

            <h1 className="max-w-3xl text-[clamp(1.9rem,4.5vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.05em]">
              {post.title}
            </h1>

            <div className="flex items-center gap-3">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={44}
                height={44}
                className="size-11 rounded-full border-2 border-background/80 object-cover"
              />
              <div>
                <p className="text-sm font-semibold tracking-[-0.02em]">
                  {post.author.name}
                  {post.author.role ? (
                    <span className="font-normal text-background/70">
                      {" "}
                      · {post.author.role}
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-background/70">
                  {formatBlogDate(post.date)} · {post.readTime}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
