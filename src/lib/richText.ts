import sanitizeHtml from "sanitize-html";

/** Render the formatting enabled by the Wagtail package description editor. */
export function sanitizePackageDescription(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "h2", "h3", "strong", "b", "em", "i", "ol", "ul", "li", "a"],
    allowedAttributes: { a: ["href", "title"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
  });
}

/** Sanitize a blog article paragraph (rich-text HTML from the Wagtail
 * `article_body` paragraph block, or plain text from the dummy dataset). */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "ol", "ul", "li", "a", "blockquote", "sup", "sub"],
    allowedAttributes: { a: ["href", "title", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
  });
}
