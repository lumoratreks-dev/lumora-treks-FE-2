export type TravelPackage = {
  id: string;
  title: string;
  image: string;
  rating: number;
  duration: string;
  peopleCount: number;
  price: number;
};

/** Shape consumed by `PackageCard` (Our Packages / Popular / Cultural rows). */
export type PackageCardData = {
  id: string;
  title: string;
  image: string;
  description: string;
  price: string; // e.g. "$400 per person"
  duration: string; // e.g. "4 Days"
  rating: string; // e.g. "4.9"
  category?: string; // e.g. "Trekking" (for FilterTabs)
  href?: string;
};

/** Paginated package list response. */
export type PackageListResult = {
  items: PackageCardData[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

/** Shape consumed by `DestinationCard`. */
export type DestinationCardData = {
  id: string;
  slug?: string;
  title: string;
  subtitle?: string;
  image: string;
  price?: string; // formatted real starting price, e.g. "USD 400"
  href?: string;
};

export type RegionHighlight = {
  id: string;
  title: string;
  image: string;
};

export type SeasonalDestination = {
  id: string;
  title: string;
  image: string;
  layout: "tall" | "wide";
};

/** Author byline shown on blog cards + article headers. */
export type BlogAuthor = {
  name: string;
  avatar: string;
  role?: string;
};

/** A single content block in a blog post body (mirrors the Wagtail
 * StreamField article blocks — heading / paragraph / quote / image). */
export type BlogBodyBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "image"; src: string; alt?: string; caption?: string };

/** Shape consumed by `BlogCard`, `FeaturedStory`, and the article page. */
export type BlogPostData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string; // e.g. "Trekking" (drives FilterTabs)
  author: BlogAuthor;
  date: string; // ISO date, e.g. "2026-08-28"
  readTime: string; // e.g. "6 min read"
  featured?: boolean;
  body?: BlogBodyBlock[];
};

/** Paginated blog list response (parallels `PackageListResult`). */
export type BlogListResult = {
  items: BlogPostData[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
