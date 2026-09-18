/**
 * WhatsApp click-to-chat deep links for enquiries.
 *
 * On top of the `/api/v2/leads/` submission, every enquiry also opens a
 * pre-filled WhatsApp chat to the Lumora Treks number so the message lands in
 * the team's WhatsApp inbox too. Used by both inquiry types on the site — the
 * package enquiry form (`form_key: "enquiry"`) and the contact form
 * (`form_key: "contact"`).
 */

/** wa.me needs the number in international format, digits only (no `+`/spaces). */
export const WHATSAPP_ENQUIRY_NUMBER = "9779847259352";

export type EnquiryLine = { label: string; value?: string | number | null };

/** Build the pre-filled message from an intro + labelled lines (blanks dropped). */
function buildEnquiryText(intro: string, lines: EnquiryLine[]): string {
  const body = lines
    .filter((line) => String(line.value ?? "").trim() !== "")
    .map((line) => `${line.label}: ${String(line.value).trim()}`)
    .join("\n");
  return body ? `${intro}\n\n${body}` : intro;
}

/** `https://wa.me/<number>?text=<encoded message>` for the given enquiry. */
export function buildWhatsAppEnquiryUrl(
  intro: string,
  lines: EnquiryLine[],
): string {
  const text = encodeURIComponent(buildEnquiryText(intro, lines));
  return `https://wa.me/${WHATSAPP_ENQUIRY_NUMBER}?text=${text}`;
}

/**
 * Open the pre-filled WhatsApp chat in a new tab. Popup blockers may stop this
 * when it fires after an async submission, so callers should also surface the
 * URL as a tappable link — see `buildWhatsAppEnquiryUrl`.
 */
export function openWhatsAppEnquiry(url: string): void {
  if (typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer");
}
