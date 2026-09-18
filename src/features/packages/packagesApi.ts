import { apiSlice } from "@/store/api/apiSlice";
import type { PackageCardData, PackageListResult } from "@/types";
import { adaptCmsPackage, type CmsPackage } from "@/lib/adaptCmsPackage";
import type { CmsListResponse } from "@/lib/blocks";
import type { SelectPackagesParams } from "./packagesData";

/**
 * Package endpoints. `getPopularPackages`/`getPackages` hit the real backend
 * catalog API (`/api/v2/packages/`, `apps/core/api/views.py::PackageViewSet`).
 *
 * `getCulturalTours` stays on dummy data — the backend `Package` model has no
 * "cultural tour" concept (no tag/curated-list field), so there's nothing
 * real to fetch yet; needs a product decision like the /packages category
 * field did, not a guess baked into a query param.
 */
export const packagesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPopularPackages: builder.query<PackageCardData[], void>({
      query: () => "packages/?popular=1&limit=8",
      transformResponse: (res: CmsListResponse<CmsPackage>) =>
        res.items.map(adaptCmsPackage),
      providesTags: ["Package"],
    }),
    getPackages: builder.query<PackageListResult, SelectPackagesParams | void>({
      query: (arg) => {
        const { category, location, date, page = 1, pageSize = 6 } = arg ?? {};
        const params = new URLSearchParams({
          limit: String(pageSize),
          offset: String((page - 1) * pageSize),
        });
        if (location) params.set("search", location);
        else if (category) params.set("category", category);
        if (date) params.set("date", date);
        return `packages/?${params.toString()}`;
      },
      transformResponse: (
        res: CmsListResponse<CmsPackage>,
        _meta,
        arg,
      ): PackageListResult => {
        const { page = 1, pageSize = 6 } = arg ?? {};
        return {
          items: res.items.map(adaptCmsPackage),
          page,
          pageSize,
          total: res.meta.total_count,
          totalPages: Math.max(1, Math.ceil(res.meta.total_count / pageSize)),
        };
      },
      providesTags: ["Package"],
    }),
    getCulturalTours: builder.query<PackageCardData[], void>({
      query: () => "packages/?limit=6",
      transformResponse: (res: CmsListResponse<CmsPackage>) =>
        res.items.map(adaptCmsPackage),
      providesTags: ["Package"],
    }),
  }),
});

export const {
  useGetPopularPackagesQuery,
  useGetPackagesQuery,
  useGetCulturalToursQuery,
} = packagesApi;
