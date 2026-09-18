import { apiSlice } from "@/store/api/apiSlice";
import type { DestinationCardData } from "@/types";
import type { CmsImage, CmsListResponse } from "@/lib/blocks";

/** Shape of `serialize_destination()` (backend `apps/catalog/serializers.py`). */
type CmsDestination = {
  id: number | string;
  slug: string;
  title: string;
  image?: CmsImage;
  region: string;
  href?: string | null;
  starting_price?: number | null;
  currency?: string | null;
};

function adaptCmsDestination(d: CmsDestination): DestinationCardData {
  return {
    id: String(d.id),
    slug: d.slug,
    title: d.title,
    image: d.image?.src || d.image?.url || "",
    href: d.href || `/destinations/${d.slug}`,
    price:
      d.starting_price == null
        ? undefined
        : `${d.currency || "USD"} ${d.starting_price}`,
  };
}

/** Destination endpoints (backend `apps/core/api/views.py::DestinationViewSet`).
 * `category` isn't a real filter server-side (Destination has `region`, not
 * a category taxonomy) — kept in the signature for API stability, but
 * `DestinationsGrid`'s FilterTabs are already documented as presentational-only
 * and never pass it, so this is inert today, not a guess baked into a query. */
export const destinationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDestinations: builder.query<
      DestinationCardData[],
      { category?: string } | void
    >({
      query: () => "destinations/",
      transformResponse: (res: CmsListResponse<CmsDestination>) =>
        res.items.map(adaptCmsDestination),
      providesTags: ["Destination"],
    }),
  }),
});

export const { useGetDestinationsQuery } = destinationsApi;
