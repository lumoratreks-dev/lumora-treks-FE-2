import type { BlogBodyBlock, BlogListResult, BlogPostData } from "@/types";

/**
 * Blog dummy data + selection logic — the neutral module shared by the client
 * query hooks and the server components that prefetch for SSR. This is the seam
 * for the Wagtail `BlogPostPage` StreamField / Travories content later: swap
 * `BLOG_POSTS` + the selectors for a real fetch (see `blogQueries.ts`), and the
 * `body` blocks map 1:1 onto the CMS article blocks (heading/paragraph/quote/image).
 */

/** FilterTabs categories for the blog index ("All" is the reset pill). */
export const BLOG_CATEGORIES = [
  "All",
  "Trekking",
  "Culture",
  "Food & Stays",
  "Guides",
] as const;

const AUTHORS = {
  aarav: {
    name: "Aarav Thapa",
    avatar: "/images/avatar-1.png",
    role: "Lead Guide",
  },
  mira: {
    name: "Mira Gurung",
    avatar: "/images/avatar-1.png",
    role: "Travel Writer",
  },
  kiran: {
    name: "Kiran Rai",
    avatar: "/images/avatar-1.png",
    role: "Culture Editor",
  },
};

/** A reusable article body so every post renders a full reading experience. */
const buildBody = (title: string): BlogBodyBlock[] => [
  {
    type: "paragraph",
    text: `${title} begins the way every great Himalayan journey does — early, cold, and quietly hopeful. Before the sun crests the ridgeline, the trail is yours alone, and the mountains feel less like a destination and more like a conversation you are only just beginning.`,
  },
  {
    type: "paragraph",
    text: "We designed this route to slow you down. Fewer kilometres, more moments: a tea house where the owner remembers your name, a pass that opens onto a valley no photograph does justice, a night sky so dense with stars it feels close enough to touch.",
  },
  { type: "heading", text: "When to go" },
  {
    type: "paragraph",
    text: "Autumn (late September to November) brings the clearest skies and the sharpest mountain views, while spring (March to May) trades a little haze for hillsides of blooming rhododendron. Both seasons are kind to first-time trekkers; the monsoon months in between are best left to the truly adventurous.",
  },
  {
    type: "image",
    src: "/images/exp-big.png",
    alt: "Golden light over the Himalayan foothills",
    caption: "First light on the ridge — the reward for an early start.",
  },
  { type: "heading", text: "What makes it different" },
  {
    type: "paragraph",
    text: "This isn't a race to the highest point. It's a route built around the people and places along the way — local homestays over anonymous lodges, seasonal food over packaged meals, and guides who grew up on these trails and read the weather like a familiar page.",
  },
  {
    type: "quote",
    text: "You don't conquer a mountain. You are simply allowed, for a few days, to walk in its company.",
    cite: "A saying from the trail",
  },
  {
    type: "paragraph",
    text: "By the time you descend, something has shifted. The photos will be beautiful — they always are — but what stays with you is quieter: the rhythm of your own footsteps, the warmth of shared tea, the particular silence of high places. That is the journey we hope to give you.",
  },
];

export const BLOG_POSTS: BlogPostData[] = [
  {
    id: "annapurna-slow-trek",
    slug: "annapurna-the-case-for-going-slow",
    title: "Annapurna: The Case for Going Slow",
    excerpt:
      "Why the most rewarding way through the Annapurna region isn't the fastest one — a field guide to walking with intention.",
    image: "/images/pkg-annapurna.png",
    category: "Trekking",
    author: AUTHORS.aarav,
    date: "2026-08-28",
    readTime: "8 min read",
    featured: true,
    body: buildBody("The Annapurna Circuit"),
  },
  {
    id: "kathmandu-durbar-guide",
    slug: "a-morning-in-kathmandu-durbar-square",
    title: "A Morning in Kathmandu Durbar Square",
    excerpt:
      "Temples, courtyards, and living history — how to experience the old heart of the city before the crowds arrive.",
    image: "/images/dest-kathmandu.png",
    category: "Culture",
    author: AUTHORS.kiran,
    date: "2026-08-19",
    readTime: "6 min read",
    body: buildBody("Kathmandu Durbar Square"),
  },
  {
    id: "tea-house-food",
    slug: "what-to-eat-on-the-trail",
    title: "What to Eat on the Trail: A Tea-House Menu",
    excerpt:
      "Dal bhat power, garlic soup for altitude, and the quiet ritual of milk tea at 3,000 metres.",
    image: "/images/experience-patan.png",
    category: "Food & Stays",
    author: AUTHORS.mira,
    date: "2026-08-11",
    readTime: "5 min read",
    body: buildBody("A tea-house table"),
  },
  {
    id: "poon-hill-sunrise",
    slug: "the-poon-hill-sunrise-is-worth-the-alarm",
    title: "The Poon Hill Sunrise Is Worth the Alarm",
    excerpt:
      "A 4am start, a candle-lit climb, and one of the most generous mountain panoramas in the world.",
    image: "/images/dest-poonhills.png",
    category: "Trekking",
    author: AUTHORS.aarav,
    date: "2026-07-30",
    readTime: "4 min read",
    body: buildBody("The Poon Hill viewpoint"),
  },
  {
    id: "packing-list",
    slug: "the-only-packing-list-you-need",
    title: "The Only Himalayan Packing List You Need",
    excerpt:
      "Layers, not luggage. Everything that earns its place in your pack — and the things that don't.",
    image: "/images/pkgp-4.png",
    category: "Guides",
    author: AUTHORS.mira,
    date: "2026-07-18",
    readTime: "7 min read",
    body: buildBody("A well-packed trekking bag"),
  },
  {
    id: "homestay-culture",
    slug: "staying-with-a-family-in-ghandruk",
    title: "Staying With a Family in Ghandruk",
    excerpt:
      "What a night in a Gurung homestay taught us about hospitality, and why we build it into every trip.",
    image: "/images/experience-dhorpatan.png",
    category: "Culture",
    author: AUTHORS.kiran,
    date: "2026-07-05",
    readTime: "6 min read",
    body: buildBody("A Ghandruk homestay"),
  },
  {
    id: "best-season",
    slug: "when-is-the-best-time-to-trek-nepal",
    title: "When Is the Best Time to Trek in Nepal?",
    excerpt:
      "Autumn clarity vs. spring blooms vs. quiet-season solitude — an honest month-by-month breakdown.",
    image: "/images/dest-annapurna.png",
    category: "Guides",
    author: AUTHORS.aarav,
    date: "2026-06-22",
    readTime: "9 min read",
    body: buildBody("A seasonal Himalayan trail"),
  },
];

export type SelectBlogParams = {
  category?: string;
  page?: number;
  pageSize?: number;
};

/** The featured hero story for the index (falls back to the first post). */
export function selectFeaturedPost(): BlogPostData {
  return BLOG_POSTS.find((p) => p.featured) ?? BLOG_POSTS[0];
}

/** Filter by category + paginate the non-featured stories for the grid. */
export function selectBlogPosts(params: SelectBlogParams = {}): BlogListResult {
  const { category, page = 1, pageSize = 6 } = params;
  let filtered = BLOG_POSTS.filter((p) => !p.featured);
  if (category && category !== "All") {
    filtered = filtered.filter((p) => p.category === category);
  }
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  return { items, page, pageSize, total, totalPages };
}

/** Look up a single post by slug (article page). */
export function selectBlogPost(slug: string): BlogPostData | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** Up to `count` related stories (same category first, then recent). */
export function selectRelatedPosts(slug: string, count = 3): BlogPostData[] {
  const current = selectBlogPost(slug);
  const others = BLOG_POSTS.filter((p) => p.slug !== slug);
  const sameCategory = others.filter((p) => p.category === current?.category);
  const rest = others.filter((p) => p.category !== current?.category);
  return [...sameCategory, ...rest].slice(0, count);
}
