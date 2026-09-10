import { queryOptions, useQuery } from "@tanstack/react-query";
import type { BlogListResult, BlogPostData } from "@/types";
import type { CmsListResponse } from "@/lib/blocks";
import { adaptCmsBlogPost, type CmsBlogPost } from "@/lib/adaptCmsBlogPost";
import {
  selectBlogPost,
  selectBlogPosts,
  selectFeaturedPost,
  selectRelatedPosts,
  type SelectBlogParams,
} from "./blogData";

/**
 * Blog data access. Fetches the Wagtail `/api/v2/blog/` endpoint
 * (backend `BlogPostViewSet`) when `NEXT_PUBLIC_WAGTAIL_URL` is set and
 * reachable, and falls back to the local dummy dataset (`blogData.ts`)
 * otherwise — so the blog renders in local dev without the CMS running, and
 * switches to real content with no page/section changes. Mirrors the
 * `packageQueries` pattern; the adapter is `adaptCmsBlogPost`.
 */

const WAGTAIL_URL = process.env.NEXT_PUBLIC_WAGTAIL_URL;

async function cmsBlogList(qs: string): Promise<CmsListResponse<CmsBlogPost> | null> {
  if (!WAGTAIL_URL) return null;
  try {
    const res = await fetch(`${WAGTAIL_URL}/api/v2/blog/${qs}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as CmsListResponse<CmsBlogPost>;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ featured

export async function fetchFeaturedPost(): Promise<BlogPostData | null> {
  const featured = await cmsBlogList("?featured=1&limit=1");
  // `null` = CMS unreachable (dev/offline) → dummy. A response with an empty
  // items array = CMS reachable but no posts yet → show nothing (no dummy on
  // production).
  if (featured === null) return selectFeaturedPost();
  if (featured.items.length) return adaptCmsBlogPost(featured.items[0]);
  // Reachable, but nothing flagged featured: fall back to the most recent post.
  const latest = await cmsBlogList("?limit=1");
  return latest?.items?.length ? adaptCmsBlogPost(latest.items[0]) : null;
}

export const featuredPostQueryOptions = () =>
  queryOptions({ queryKey: ["blog", "featured"], queryFn: fetchFeaturedPost });

export function useFeaturedPostQuery() {
  return useQuery(featuredPostQueryOptions());
}

// ---------------------------------------------------------------------- list

export async function fetchBlogPosts(params?: SelectBlogParams): Promise<BlogListResult> {
  const { category, page = 1, pageSize = 6 } = params ?? {};
  const search = new URLSearchParams({
    limit: String(pageSize),
    offset: String((page - 1) * pageSize),
  });
  if (category && category !== "All") search.set("category", category);

  const data = await cmsBlogList(`?${search.toString()}`);
  if (data) {
    return {
      items: data.items.map(adaptCmsBlogPost),
      page,
      pageSize,
      total: data.meta.total_count,
      totalPages: Math.max(1, Math.ceil(data.meta.total_count / pageSize)),
    };
  }
  return selectBlogPosts(params);
}

export const blogPostsQueryOptions = (params?: SelectBlogParams) =>
  queryOptions({ queryKey: ["blog", "list", params ?? {}], queryFn: () => fetchBlogPosts(params) });

export function useBlogPostsQuery(params?: SelectBlogParams) {
  return useQuery(blogPostsQueryOptions(params));
}

// ------------------------------------------------------------------- related

export async function fetchRelatedPosts(slug: string, count = 3): Promise<BlogPostData[]> {
  const data = await cmsBlogList(`?exclude=${encodeURIComponent(slug)}&limit=${count}`);
  if (data) return data.items.map(adaptCmsBlogPost);
  return selectRelatedPosts(slug, count);
}

export const relatedPostsQueryOptions = (slug: string, count = 3) =>
  queryOptions({ queryKey: ["blog", "related", slug, count], queryFn: () => fetchRelatedPosts(slug, count) });

export function useRelatedPostsQuery(slug: string, count = 3) {
  return useQuery(relatedPostsQueryOptions(slug, count));
}

// -------------------------------------------------------------------- detail

/** A single article by slug (with its prose `body`). Returns undefined when the
 * slug is unknown both in the CMS and the dummy dataset. */
export async function fetchBlogPost(slug: string): Promise<BlogPostData | undefined> {
  if (WAGTAIL_URL) {
    try {
      const res = await fetch(`${WAGTAIL_URL}/api/v2/blog/${encodeURIComponent(slug)}/`, {
        next: { revalidate: 60 },
      });
      if (res.ok) return adaptCmsBlogPost((await res.json()) as CmsBlogPost);
      // Reachable but no such post → genuinely not found (don't mask a 404 with
      // a dummy article on production).
      if (res.status === 404) return undefined;
    } catch {
      // Network error / CMS unreachable → dummy fallback (dev/offline).
      return selectBlogPost(slug);
    }
    return undefined;
  }
  return selectBlogPost(slug);
}

/** All known slugs for static generation (CMS list, falling back to dummy). */
export async function fetchBlogSlugs(): Promise<string[]> {
  const data = await cmsBlogList("?limit=200");
  if (data) return data.items.map((post) => post.slug);
  const { BLOG_POSTS } = await import("./blogData");
  return BLOG_POSTS.map((post) => post.slug);
}
