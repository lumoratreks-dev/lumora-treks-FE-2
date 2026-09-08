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
