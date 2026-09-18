import { queryOptions, useQuery } from "@tanstack/react-query";
import type { SiteSettings } from "./siteApi";

const WAGTAIL_URL =
  process.env.NEXT_PUBLIC_WAGTAIL_URL || "http://localhost:8000";

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  try {
    const res = await fetch(`${WAGTAIL_URL}/api/v2/site/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch site settings:", err);
    return null;
  }
}

export const siteSettingsQueryOptions = () =>
  queryOptions({
    queryKey: ["siteSettings"],
    queryFn: fetchSiteSettings,
  });

export function useSiteSettingsQuery() {
  return useQuery(siteSettingsQueryOptions());
}
