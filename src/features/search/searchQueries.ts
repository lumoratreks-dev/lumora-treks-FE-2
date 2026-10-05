import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import type { BlogPostData, DestinationCardData, PackageCardData } from "@/types";
import type { CmsImage, CmsListResponse } from "@/lib/blocks";
import { adaptCmsPackage, type CmsPackage } from "@/lib/adaptCmsPackage";
import { adaptCmsBlogPost, type CmsBlogPost } from "@/lib/adaptCmsBlogPost";

/**
 * Universal search — one query across packages, destinations and blog posts.
 * Powers the navbar search modal (live, as-you-type) and the `/search` results
 * page. Packages and posts use the backend `?search=` filter (word-by-word
 * across title/summary/destination — `apps/core/api/views.py::search_filter`);
 * destinations are a small catalogue, so the full list is fetched once and
 * matched here, which keeps them searchable by region/subtitle too.
 */

const WAGTAIL_URL =
  process.env.NEXT_PUBLIC_WAGTAIL_URL || "http://localhost:8000";

type CmsDestination = {
  id: number | string;
  slug: string;
  title: string;
  subtitle?: string;
  region?: string;
  image?: CmsImage;
  href?: string;
  starting_price?: number | null;
  currency?: string | null;
};

export type SearchDestination = DestinationCardData & { region?: string };

export type SearchResults = {
  query: string;
  packages: PackageCardData[];
  packagesTotal: number;
  destinations: SearchDestination[];
  posts: BlogPostData[];
};

const words = (text: string) =>
  text.toLowerCase().split(/\s+/).filter(Boolean);

/** All destinations (unfiltered) — cached; the catalogue is a few dozen rows. */
export async function fetchAllDestinations(): Promise<SearchDestination[]> {
  try {
    const res = await fetch(`${WAGTAIL_URL}/api/v2/destinations/?limit=100`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data: CmsListResponse<CmsDestination> = await res.json();
    return data.items.map((item) => ({
      id: String(item.id),
      slug: item.slug,
      title: item.title,
      subtitle: item.subtitle ?? "",
      region: item.region ?? "",
      image: item.image?.src ?? item.image?.url ?? "",
      href: item.href ?? `/destinations/${item.slug}`,
      price:
        item.starting_price == null
          ? undefined
          : `${item.currency ?? "USD"} ${item.starting_price}`,
    }));
  } catch (err) {
    console.error("Failed to fetch destinations for search:", err);
    return [];
  }
}

export const allDestinationsQueryOptions = () =>
  queryOptions({
    queryKey: ["destinations", "all"],
    queryFn: fetchAllDestinations,
    staleTime: 5 * 60 * 1000,
  });

export function useAllDestinationsQuery() {
  return useQuery(allDestinationsQueryOptions());
}

/** Every query word must appear somewhere in the destination; title hits rank
 * first, then title-prefix hits within those. */
export function matchDestinations(
  all: SearchDestination[],
  query: string,
): SearchDestination[] {
  const terms = words(query);
  if (!terms.length) return [];
  const score = (d: SearchDestination) => {
    const title = d.title.toLowerCase();
    const haystack = `${title} ${d.subtitle ?? ""} ${d.region ?? ""}`.toLowerCase();
    if (!terms.every((t) => haystack.includes(t))) return -1;
    let s = 0;
    if (title.startsWith(terms[0])) s += 4;
    s += terms.filter((t) => title.includes(t)).length * 2;
    if (terms.some((t) => (d.region ?? "").toLowerCase().includes(t))) s += 1;
    return s;
  };
  return all
    .map((d) => ({ d, s: score(d) }))
    .filter(({ s }) => s >= 0)
    .sort((a, b) => b.s - a.s)
    .map(({ d }) => d);
}

async function fetchPackageMatches(
  query: string,
  limit: number,
): Promise<{ items: PackageCardData[]; total: number }> {
  try {
    const params = new URLSearchParams({ search: query, limit: String(limit) });
    const res = await fetch(`${WAGTAIL_URL}/api/v2/packages/?${params}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { items: [], total: 0 };
    const data: CmsListResponse<CmsPackage> = await res.json();
    return { items: data.items.map(adaptCmsPackage), total: data.meta.total_count };
  } catch (err) {
    console.error("Failed to search packages:", err);
    return { items: [], total: 0 };
  }
}

async function fetchPackagesForDestination(
  slug: string,
  limit: number,
): Promise<PackageCardData[]> {
  try {
    const params = new URLSearchParams({ destination: slug, limit: String(limit) });
    const res = await fetch(`${WAGTAIL_URL}/api/v2/packages/?${params}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data: CmsListResponse<CmsPackage> = await res.json();
    return data.items.map(adaptCmsPackage);
  } catch {
    return [];
  }
}

async function fetchPostMatches(
  query: string,
  limit: number,
): Promise<BlogPostData[]> {
  if (!process.env.NEXT_PUBLIC_WAGTAIL_URL) {
    // No CMS configured (local dev): search the bundled dummy posts.
    const { BLOG_POSTS } = await import("@/features/blog/blogData");
    const terms = words(query);
    return BLOG_POSTS.filter((post) => {
      const haystack = `${post.title} ${post.excerpt} ${post.category}`.toLowerCase();
      return terms.every((t) => haystack.includes(t));
    }).slice(0, limit);
  }
  try {
    const params = new URLSearchParams({ search: query, limit: String(limit) });
    const res = await fetch(`${WAGTAIL_URL}/api/v2/blog/?${params}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data: CmsListResponse<CmsBlogPost> = await res.json();
    return data.items.map(adaptCmsBlogPost);
  } catch (err) {
    console.error("Failed to search blog posts:", err);
    return [];
  }
}

export async function fetchSearchResults(
  query: string,
  limit = 6,
): Promise<SearchResults> {
  const q = query.trim();
  if (!q) {
    return { query: q, packages: [], packagesTotal: 0, destinations: [], posts: [] };
  }
  const [packageMatches, allDestinations, posts] = await Promise.all([
    fetchPackageMatches(q, limit),
    fetchAllDestinations(),
    fetchPostMatches(q, limit),
  ]);
  const destinations = matchDestinations(allDestinations, q);

  // A search for a place ("pokhara") should also surface the trips that run
  // there even when the place isn't in the package title.
  let packages = packageMatches.items;
  let packagesTotal = packageMatches.total;
  if (packages.length < limit && destinations[0]?.slug) {
    const extra = await fetchPackagesForDestination(destinations[0].slug, limit);
    const seen = new Set(packages.map((p) => p.id));
    const fresh = extra.filter((p) => !seen.has(p.id));
    packages = [...packages, ...fresh].slice(0, limit);
    packagesTotal = Math.max(packagesTotal + fresh.length, packages.length);
  }

  return { query: q, packages, packagesTotal, destinations, posts };
}

export const searchQueryOptions = (query: string, limit = 6) =>
  queryOptions({
    queryKey: ["search", query.trim().toLowerCase(), limit],
    queryFn: () => fetchSearchResults(query, limit),
    staleTime: 60 * 1000,
  });

export function useSearchQuery(query: string, limit = 6) {
  return useQuery({
    ...searchQueryOptions(query, limit),
    enabled: query.trim().length > 0,
    placeholderData: keepPreviousData,
  });
}
