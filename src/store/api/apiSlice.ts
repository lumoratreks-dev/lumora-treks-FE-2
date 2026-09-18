import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Single base API slice for the app. Feature endpoints are injected into this
 * via `apiSlice.injectEndpoints` (see src/features/*\/*.ts) instead of creating
 * separate `createApi` instances, so everything shares one cache/tag space.
 *
 * Points at the Wagtail backend's `/api/v2/` (see `lumora-treks-BE`,
 * `apps/core/api/urls.py`). Endpoints without a real backend counterpart yet
 * (e.g. cultural tours — no tag/category concept on the `Package` model)
 * still use a `queryFn` returning dummy data instead of `query`; both forms
 * share this one base query.
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_WAGTAIL_URL ?? ""}/api/v2/`,
  }),
  tagTypes: ["Package", "Destination", "GalleryItem", "Site"],
  endpoints: () => ({}),
});
