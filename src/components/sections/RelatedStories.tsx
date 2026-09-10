"use client";

import { motion } from "framer-motion";
import BlogCard from "@/components/ui/BlogCard";
import type { BlogPostData } from "@/types";

/** RelatedStories — a 3-up row of BlogCards below an article. Cards fade-up in
 * a light stagger as the section scrolls into view. */
export default function RelatedStories({ posts }: { posts: BlogPostData[] }) {
  if (!posts.length) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-6 pb-20 lg:px-10">
      <div className="border-t border-border pt-14">
        <h2 className="mb-8 text-2xl font-bold tracking-[-0.05em] text-foreground sm:text-3xl">
          Keep reading
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
            >
              <BlogCard post={post} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
