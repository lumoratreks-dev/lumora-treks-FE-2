const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  "https://lumora.rivetsoft.com";

export const siteUrl = configuredSiteUrl.startsWith("http")
  ? configuredSiteUrl.replace(/\/$/, "")
  : `https://${configuredSiteUrl.replace(/\/$/, "")}`;

export function absoluteSiteUrl(path: string) {
  return new URL(path, `${siteUrl}/`).toString();
}

export function absoluteAssetUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : absoluteSiteUrl(url);
}
