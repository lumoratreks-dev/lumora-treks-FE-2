"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import FilterTabs from "@/components/ui/FilterTabs";
import Pagination from "@/components/ui/Pagination";
import BlogCard from "@/components/ui/BlogCard";
import CardSkeleton from "@/components/ui/CardSkeleton";
import FeaturedStory from "@/components/sections/FeaturedStory";
import { BLOG_CATEGORIES } from "@/features/blog/blogData";
import {
  useBlogPostsQuery,
  useFeaturedPostQuery,
} from "@/features/blog/blogQueries";

const DEFAULT_PAGE_SIZE = 5;

/** BlogGrid — the editorial magazine index: a featured hero story, category
 * FilterTabs, then an asymmetric grid of BlogCards (every 4th tile goes wide)
 * with pagination. Cards fade-up in a stagger as the grid scrolls into view.
 *
 * Doubles as the `BlogListing` CMS block (backend `BlogListingBlock`) — hence
 * the snake_case optional props spread by `BlockRenderer`. */
type BlogGridProps = {
  heading?: string;
  categories?: string[];
  page_size?: number;
  show_featured?: boolean;
};

export default function BlogGrid({
  heading = "Latest stories",
  categories,
  page_size,
  show_featured = true,
}: BlogGridProps = {}) {
  const tabs = categories?.length ? categories : [...BLOG_CATEGORIES];
  const pageSize = page_size ?? DEFAULT_PAGE_SIZE;

  const [category, setCategory] = useState<string>(tabs[0]);
  const [page, setPage] = useState(1);

  const { data: featured } = useFeaturedPostQuery();
  const { data, isLoading } = useBlogPostsQuery({ category, page, pageSize });

  const posts = data?.items ?? [];
  const showFeatured = show_featured && featured && category === tabs[0] && page === 1;

  return (
    <div className="flex flex-col gap-12">
      {/* Featured story only on the unfiltered first page */}
      {showFeatured ? <FeaturedStory post={featured!} /> : null}

      <section className="mx-auto w-full max-w-[1400px] px-6 lg:px-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-[-0.05em] text-foreground sm:text-3xl">
            {heading}
          </h2>
          <FilterTabs
            tabs={tabs}
            defaultTab={category}
            onChange={(tab) => {
              setCategory(tab);
              setPage(1);
            }}
            className="text-base sm:text-lg"
          />
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: pageSize }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="py-16 text-center font-body-alt text-text-secondary">
            No stories in this category yet — check back soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => {
              const wide = i % pageSize === 3;
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                    delay: (i % 3) * 0.08,
                  }}
                  className={clsx(wide && "sm:col-span-2")}
                >
                  <BlogCard post={post} variant={wide ? "wide" : "default"} />
                </motion.div>
              );
            })}
          </div>
        )}

        <Pagination
          page={page}
          pages={data?.totalPages ?? 1}
          onChange={setPage}
          className="mt-12"
        />
      </section>
    </div>
  );
}
