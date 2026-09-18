import type { CmsDestinationDetail, CmsPackageDetail } from "./blocks";

const WAGTAIL_URL = process.env.NEXT_PUBLIC_WAGTAIL_URL;

async function getCatalogItem<T>(
  resource: string,
  slug: string,
): Promise<T | null> {
  if (!WAGTAIL_URL) return null;

  try {
    const response = await fetch(
      `${WAGTAIL_URL}/api/v2/${resource}/${encodeURIComponent(slug)}/`,
      { next: { revalidate: 60 } },
    );
    if (!response.ok) return null;
    return response.json() as Promise<T>;
  } catch {
    return null;
  }
}

export function getPackageBySlug(slug: string) {
  return getCatalogItem<CmsPackageDetail>("packages", slug);
}

export function getDestinationBySlug(slug: string) {
  return getCatalogItem<CmsDestinationDetail>("destinations", slug);
}
