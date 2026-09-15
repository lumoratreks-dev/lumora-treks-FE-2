"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { sanitizeArticleHtml } from "@/lib/richText";
import type { BlogBodyBlock, BlogPostData } from "@/types";

/** Vertical share rail (presentational) — sticky beside the article on desktop. */
function ShareRail() {
  const links = [
    { icon: "prime:twitter", label: "Share on X" },
    { icon: "mdi:facebook", label: "Share on Facebook" },
    { icon: "mdi:whatsapp", label: "Share on WhatsApp" },
    { icon: "iconoir:link", label: "Copy link" },
  ];
  return (
    <div className="sticky top-24 hidden h-fit flex-col items-center gap-3 lg:flex">
      <span className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
        Share
      </span>
      {links.map((l) => (
        <button
          key={l.icon}
          type="button"
          aria-label={l.label}
          className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-foreground transition-colors hover:border-foreground/40 hover:bg-background"
        >
          <Icon icon={l.icon} className="size-5" />
        </button>
      ))}
    </div>
  );
}

/** Renders one article content block. */
function Block({ block }: { block: BlogBodyBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="mt-10 text-2xl font-bold tracking-[-0.04em] text-foreground md:text-[28px]">
          {block.text}
        </h2>
      );
    case "paragraph":
      // `text` is rich-text HTML from the CMS (or plain text from the dummy
      // dataset — which renders identically once sanitized).
      return (
        <div
          className="font-body-alt text-lg leading-[1.75] tracking-[-0.01em] text-text-secondary [&_a]:text-primary-active [&_a]:underline [&_strong]:font-semibold [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-foreground"
          dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(block.text) }}
        />
      );
    case "quote":
      return (
        <figure className="my-4 border-l-4 border-primary-accent pl-6">
          <blockquote className="font-script text-2xl leading-snug text-foreground md:text-[28px]">
            “{block.text}”
          </blockquote>
          {block.cite ? (
            <figcaption className="mt-3 text-sm font-medium text-text-muted">
              — {block.cite}
            </figcaption>
          ) : null}
        </figure>
      );
    case "image":
      return (
        <motion.figure
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="my-4"
        >
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src={block.src}
              alt={block.alt ?? ""}
              fill
              sizes="(max-width: 720px) 100vw, 720px"
              className="object-cover"
            />
          </div>
          {block.caption ? (
            <figcaption className="mt-3 text-center text-sm text-text-muted">
              {block.caption}
            </figcaption>
          ) : null}
        </motion.figure>
      );
    default:
      return null;
  }
}

/** ArticleBody — the reading experience: a narrow measure (~720px) of prose
 * with a sticky share rail on desktop and an author bio at the close. Renders
 * the post's StreamField-style `body` blocks; falls back to the excerpt. */
export default function ArticleBody({ post }: { post: BlogPostData }) {
  const blocks: BlogBodyBlock[] =
    post.body && post.body.length > 0
      ? post.body
      : [{ type: "paragraph", text: post.excerpt }];

  return (
    <section className="mx-auto flex max-w-[1000px] justify-center gap-10 px-6 py-14 lg:py-20">
      <ShareRail />

      <article className="w-full max-w-[720px]">
        <div className="flex flex-col gap-5">
          {blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        {/* Author bio */}
        <div className="mt-12 flex items-center gap-4 rounded-2xl border border-border bg-white p-6">
          <Image
            src={post.author.avatar}
            alt={post.author.name}
            width={56}
            height={56}
            className="size-14 shrink-0 rounded-full object-cover"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
              Written by
            </p>
            <p className="text-lg font-bold tracking-[-0.03em] text-foreground">
              {post.author.name}
            </p>
            {post.author.role ? (
              <p className="text-sm text-text-secondary">{post.author.role} · Lumora Treks</p>
            ) : null}
          </div>
        </div>
      </article>
    </section>
  );
}
