import { queryOptions, useQuery } from "@tanstack/react-query";
import type { RegionHighlight, SeasonalDestination } from "@/types";
import type { CmsImage } from "@/lib/blocks";

const WAGTAIL_URL =
  process.env.NEXT_PUBLIC_WAGTAIL_URL || "http://localhost:8000";

type CmsDestinationSummary = {
  id: number | string;
  title: string;
  image?: CmsImage;
  layout?: "tall" | "wide";
};

type DestinationListResponse = { items?: CmsDestinationSummary[] };

export async function fetchRegionHighlights(): Promise<RegionHighlight[]> {
  try {
    const res = await fetch(
      `${WAGTAIL_URL}/api/v2/destinations/?featured=1&limit=6`,
      {
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return [];
    const data: DestinationListResponse = await res.json();
    if (data.items) {
      return data.items.map((item) => ({
        id: String(item.id),
        title: item.title,
        image: item.image?.src ?? item.image?.url ?? "",
      }));
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch region highlights:", err);
    return [];
  }
}

export const regionHighlightsQueryOptions = () =>
  queryOptions({
    queryKey: ["regionHighlights"],
    queryFn: fetchRegionHighlights,
  });

export function useRegionHighlightsQuery() {
  return useQuery(regionHighlightsQueryOptions());
}

export async function fetchSeasonalDestinations(): Promise<
  SeasonalDestination[]
> {
  try {
    const res = await fetch(`${WAGTAIL_URL}/api/v2/destinations/?limit=6`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data: DestinationListResponse = await res.json();
    if (data.items) {
      return data.items.map((item) => ({
        id: String(item.id),
        title: item.title,
        image: item.image?.src ?? item.image?.url ?? "",
        layout: item.layout ?? "tall",
      }));
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch seasonal destinations:", err);
    return [];
  }
}

export const seasonalDestinationsQueryOptions = () =>
  queryOptions({
    queryKey: ["seasonalDestinations"],
    queryFn: fetchSeasonalDestinations,
  });

export function useSeasonalDestinationsQuery() {
  return useQuery(seasonalDestinationsQueryOptions());
}
