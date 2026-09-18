import { queryOptions, useQuery } from "@tanstack/react-query";
import type { CmsImage } from "@/lib/blocks";
import type { DestinationCardData } from "@/types";

const WAGTAIL_URL =
  process.env.NEXT_PUBLIC_WAGTAIL_URL || "http://localhost:8000";
export type DestinationQueryParams = {
  region?: string;
};

type CmsDestination = {
  id: number | string;
  slug: string;
  title: string;
  subtitle?: string;
  image?: CmsImage;
  href?: string;
  starting_price?: number | null;
  currency?: string | null;
};

export async function fetchDestinations(
  params?: DestinationQueryParams,
): Promise<DestinationCardData[]> {
  const queryParams = new URLSearchParams();
  queryParams.set("featured", "true");
  if (params?.region) queryParams.set("region", params.region);

  try {
    const endpoint =
      queryParams.size > 0
        ? `${WAGTAIL_URL}/api/v2/destinations/?${queryParams.toString()}`
        : `${WAGTAIL_URL}/api/v2/destinations/`;
    const res = await fetch(endpoint, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data: { items?: CmsDestination[] } = await res.json();
    if (data.items && data.items.length > 0) {
      return data.items.map((item) => ({
        id: String(item.id),
        slug: item.slug,
        title: item.title,
        subtitle: item.subtitle ?? "",
        image: item.image?.src ?? item.image?.url ?? "",
        href: item.href ?? `/destinations/${item.slug}`,
        price:
          item.starting_price == null
            ? undefined
            : `${item.currency ?? "USD"} ${item.starting_price}`,
      }));
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch destinations:", err);
    return [];
  }
}

export const destinationsQueryOptions = (params?: DestinationQueryParams) =>
  queryOptions({
    queryKey: ["destinations", params],
    queryFn: () => fetchDestinations(params),
  });

export function useDestinationsQuery(params?: DestinationQueryParams) {
  return useQuery(destinationsQueryOptions(params));
}
