import type { BlogBodyBlock, BlogPostData } from "@/types";
import type { CmsImage } from "@/lib/blocks";

/** Shape of `serialize_blog_post()` (backend `apps/cms/serializers.py`) — what
 * `/api/v2/blog/` returns. Snake_case + raw image objects; the frontend cards
 * want a flat image URL + a formatted read time, so this is the adapter
 * boundary (mirrors `adaptCmsPackage`). */
export type CmsArticleBlock =
  | { type: "heading"; value: string; id?: string }
  | { type: "paragraph"; value: string; id?: string }
  | { type: "quote"; value: { text: string; cite?: string }; id?: string }
  | { type: "image"; value: { src?: string; image?: CmsImage; alt?: string; caption?: string }; id?: string };

export type CmsBlogPost = {
  id: number | string;
  slug: string;
  title: string;
  excerpt?: string;
  image?: CmsImage;
  category?: string;
  author?: { name?: string; avatar?: CmsImage; role?: string } | null;
  date?: string | null;
  read_time_minutes?: number | null;
  featured?: boolean;
  href?: string;
  body?: CmsArticleBlock[]; // detail only (article_body)
};

const FALLBACK_AVATAR = "/images/avatar-1.png";

function imageUrl(image: CmsImage): string {
  return image?.src || image?.url || "";
}

function adaptArticleBody(blocks: CmsArticleBlock[]): BlogBodyBlock[] {
  return blocks
    .map((block): BlogBodyBlock | null => {
      switch (block.type) {
        case "heading":
          return { type: "heading", text: block.value };
        case "paragraph":
          return { type: "paragraph", text: block.value }; // rich-text HTML
        case "quote":
          return { type: "quote", text: block.value.text, cite: block.value.cite || undefined };
        case "image":
          return {
            type: "image",
            src: block.value.src || imageUrl(block.value.image),
            alt: block.value.alt,
            caption: block.value.caption,
          };
        default:
          return null;
      }
    })
    .filter((block): block is BlogBodyBlock => block !== null);
}

export function adaptCmsBlogPost(post: CmsBlogPost): BlogPostData {
  const minutes = post.read_time_minutes;
  return {
    id: String(post.id),
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    image: imageUrl(post.image),
    category: post.category || "",
    author: {
      name: post.author?.name || "Lumora Treks",
      avatar: imageUrl(post.author?.avatar) || FALLBACK_AVATAR,
      role: post.author?.role || undefined,
    },
    date: post.date || "",
    readTime: minutes ? `${minutes} min read` : "",
    featured: post.featured,
    ...(post.body ? { body: adaptArticleBody(post.body) } : {}),
  };
}
