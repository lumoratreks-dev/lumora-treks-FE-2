/** Wagtail StreamField shapes. A page's `body` is an ordered list of blocks,
 * each `{ type, value, id }` (Wagtail API v2).
 *
 * `value.component` is the actual dispatch key (see backend
 * `apps/core/blocks.py` `SectionBlock.get_api_representation` — every
 * registered section echoes its React component name as `component`, PascalCase,
 * alongside its fields). `value.settings` is the shared presentation controls
 * every section carries (backend `SectionSettingsBlock`). `block.type` (the
 * StreamField block name, e.g. `intro_stats`) is only used for CMS-editor UX
 * and dev warnings — never for rendering dispatch. */
export type CmsSectionSettings = {
  anchor_id: string;
  background: "default" | "surface" | "dark" | "primary";
  spacing: "none" | "sm" | "md" | "lg";
  container: "default" | "narrow" | "full";
  hidden: boolean;
};

export type CmsBlockValue = {
  component: string;
  settings?: CmsSectionSettings;
  [field: string]: unknown;
};

/** `serialize_image` (backend `apps/core/serializers.py`) — the shape every
 * image chooser field serializes to. Sections only need `url`/`alt` so far;
 * add fields here as needed rather than in each component. */
export type CmsImage = {
  id?: number;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  src?: string;
} | null | undefined;

/** `HeadingGroupBlock` (backend `apps/core/blocks.py`) — the eyebrow /
 * heading / description trio most sections share. */
export type CmsHeadingGroup = {
  eyebrow?: string;
  heading?: string;
  description?: string;
  align?: "center" | "left";
};

/** `LumoraPagination`'s response envelope (backend `apps/core/api/pagination.py`)
 * — every list endpoint under `/api/v2/` (packages, destinations,
 * testimonials, videos) returns this shape. */
export type CmsListResponse<T> = {
  meta: { total_count: number; limit: number; offset: number };
  items: T[];
};

export type CmsPackageDetail = {
  id: number | string;
  slug: string;
  public_code: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  image: CmsImage;
  rating: number;
  review_count: number;
  duration: string;
  duration_days?: number | null;
  people_count: number;
  price: number;
  discount_price?: number | null;
  currency: string;
  group_pricing: Array<{
    min_people: number;
    max_people: number | null;
    price_per_person: number;
  }>;
  difficulty: string;
  href?: string;
  booking_url?: string;
  destination?: CmsDestinationDetail | null;
  highlights: Array<{ text: string; icon?: string }>;
  itinerary: Array<{
    day_label: string;
    title: string;
    description: string;
    image: CmsImage;
  }>;
  gallery: Array<{ image: CmsImage; caption: string }>;
  includes: string[];
  excludes: string[];
  included_items: Array<{ kind: "included" | "excluded"; text: string }>;
  testimonials: CmsTestimonial[];
};

export type CmsDestinationDetail = {
  id: number | string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  best_season: string;
  image: CmsImage;
  region: string;
  layout: string;
  highlights: string[];
  href?: string;
  packages: Array<{
    id: number | string;
    slug: string;
    title: string;
    summary?: string;
    image: CmsImage;
    price?: number;
    currency?: string;
    duration?: string;
    href?: string;
  }>;
};

export type CmsTestimonial = {
  id: number | string;
  quote: string;
  author_name: string;
  author_role: string;
  avatar: CmsImage;
  rating: number;
  package?: string | null;
  is_featured?: boolean;
};

export type CmsBlock = {
  type: string;
  value: CmsBlockValue;
  id: string;
};

export type CmsPage = {
  id: number;
  title: string;
  slug: string;
  body: CmsBlock[];
  seo?: {
    title?: string;
    description?: string;
    canonical_url?: string;
    noindex?: boolean;
    og_image?: CmsImage;
  };
};
