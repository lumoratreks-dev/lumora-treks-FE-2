import type { PackageCardData } from "@/types";

/** Shape of `serialize_package()` (backend `apps/catalog/serializers.py`) —
 * what `resolved_packages` on `PopularPackagesBlock`/`PackageGridBlock`
 * (apps/cms/blocks/sections.py) contains. Snake_case, raw numbers — the
 * frontend's card components want camelCase, pre-formatted strings, so this
 * is the adapter boundary. Same shape the real `packagesApi` endpoints will
 * return in Phase B (see INTEGRATION_PLAN.md), so this adapter is reusable
 * there, not just for CMS blocks. */
export type CmsPackage = {
  id: number | string;
  slug?: string;
  title: string;
  category?: string;
  summary?: string;
  image?: { url: string } | null;
  rating?: number;
  duration?: string;
  price?: number;
  currency?: string;
  href?: string;
};

export function adaptCmsPackage(pkg: CmsPackage): PackageCardData {
  return {
    id: String(pkg.id),
    title: pkg.title,
    image: pkg.image?.url || "",
    description: pkg.summary || "",
    price:
      pkg.price != null
        ? `${formatCurrency(pkg.currency)}${pkg.price} per person`
        : "",
    duration: pkg.duration || "",
    rating: pkg.rating != null ? pkg.rating.toFixed(1) : "",
    category: pkg.category,
    href: pkg.href,
  };
}

function formatCurrency(currency: string | undefined): string {
  return currency === "USD" || !currency ? "$" : `${currency} `;
}
