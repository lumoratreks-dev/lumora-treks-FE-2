import { queryOptions, useQuery } from "@tanstack/react-query";
import type { PackageCardData, PackageListResult } from "@/types";
import { adaptCmsPackage, type CmsPackage } from "@/lib/adaptCmsPackage";
import type { CmsListResponse } from "@/lib/blocks";
import type { SelectPackagesParams } from "./packagesData";

const WAGTAIL_URL =
  process.env.NEXT_PUBLIC_WAGTAIL_URL || "http://localhost:8000";

export async function fetchPopularPackages(): Promise<PackageCardData[]> {
  try {
    const res = await fetch(
      `${WAGTAIL_URL}/api/v2/packages/?popular=1&limit=8`,
      {
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return [];
    const data: CmsListResponse<CmsPackage> = await res.json();
    return data.items.map(adaptCmsPackage);
  } catch (err) {
    console.error("Failed to fetch popular packages:", err);
    return [];
  }
}

export const popularPackagesQueryOptions = () =>
  queryOptions({
    queryKey: ["popularPackages"],
    queryFn: fetchPopularPackages,
  });

export function usePopularPackagesQuery() {
  return useQuery(popularPackagesQueryOptions());
}

export async function fetchPackages(
  params?: SelectPackagesParams,
): Promise<PackageListResult> {
  const { category, location, date, page = 1, pageSize = 6 } = params ?? {};
  const queryParams = new URLSearchParams({
    limit: String(pageSize),
    offset: String((page - 1) * pageSize),
  });
  if (location) queryParams.set("search", location);
  else if (category) queryParams.set("category", category);
  if (date) queryParams.set("date", date);

  try {
    const res = await fetch(
      `${WAGTAIL_URL}/api/v2/packages/?${queryParams.toString()}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) {
      return { items: [], page: 1, pageSize: 6, total: 0, totalPages: 1 };
    }
    const data: CmsListResponse<CmsPackage> = await res.json();
    return {
      items: data.items.map(adaptCmsPackage),
      page,
      pageSize,
      total: data.meta.total_count,
      totalPages: Math.max(1, Math.ceil(data.meta.total_count / pageSize)),
    };
  } catch (err) {
    console.error("Failed to fetch packages list:", err);
    return { items: [], page: 1, pageSize: 6, total: 0, totalPages: 1 };
  }
}

export const packagesListQueryOptions = (params?: SelectPackagesParams) =>
  queryOptions({
    queryKey: ["packagesList", params],
    queryFn: () => fetchPackages(params),
  });

export function usePackagesQuery(params?: SelectPackagesParams) {
  return useQuery(packagesListQueryOptions(params));
}

export async function fetchCulturalTours(): Promise<PackageCardData[]> {
  try {
    const res = await fetch(
      `${WAGTAIL_URL}/api/v2/packages/?category=Sightseeing&limit=6`,
      {
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return [];
    const data: CmsListResponse<CmsPackage> = await res.json();
    return data.items.map(adaptCmsPackage);
  } catch (err) {
    console.error("Failed to fetch cultural tours:", err);
    return [];
  }
}

export const culturalToursQueryOptions = () =>
  queryOptions({
    queryKey: ["culturalTours"],
    queryFn: fetchCulturalTours,
  });

export function useCulturalToursQuery() {
  return useQuery(culturalToursQueryOptions());
}
