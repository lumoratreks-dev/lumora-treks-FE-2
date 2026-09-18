import type { PackageCardData, PackageListResult } from "@/types";

/**
 * Package dummy data + selection logic — a neutral module shared by the RTK
 * Query endpoints (client) and the server components that pass initial data for
 * SSR. Swap the arrays/`selectPackages` for the Travories API later; both the
 * server `getPage`-style fetch and the client `queryFn` route through here.
 */

const DESC =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor .";
const withDefaults = (
  p: Pick<PackageCardData, "id" | "title" | "image"> & { category?: string },
): PackageCardData => ({
  ...p,
  description: DESC,
  price: "$400 per person",
  duration: "4 Days",
  rating: "4.9",
});

export const POPULAR_PACKAGES: PackageCardData[] = [
  {
    id: "dhorpatan-region",
    title: "Dhorpatan Region",
    image: "/images/pkg-dhorpatan.png",
  },
  {
    id: "pokhara-tours",
    title: "Pokhara Tours",
    image: "/images/pkg-pokhara.png",
  },
  {
    id: "ghandruk-annapurna",
    title: "Ghandruk and Annapurna region",
    image: "/images/pkg-annapurna.png",
  },
].map(withDefaults);

const TITLES = [
  "Dhorpatan Region",
  "Pokhara Tours",
  "Ghandruk and Annapurna region",
];

/** Build `count` dummy packages for a category (images cycle through pkgp-1..6). */
const build = (
  count: number,
  category: string,
  prefix: string,
): PackageCardData[] =>
  Array.from({ length: count }, (_, i) =>
    withDefaults({
      id: `${prefix}-${i + 1}`,
      title: TITLES[i % TITLES.length],
      image: `/images/pkgp-${(i % 6) + 1}.png`,
      category,
    }),
  );

// 15 packages across the three FilterTabs categories → real pagination.
const PACKAGES: PackageCardData[] = [
  ...build(8, "Trekking", "trek"),
  ...build(4, "Sightseeing", "sight"),
  ...build(3, "Paragliding", "para"),
];

export const CULTURAL_TOURS: PackageCardData[] = [
  {
    id: "cultural-dhorpatan",
    title: "Dhorpatan Region",
    image: "/images/cultural-1.png",
  },
  {
    id: "cultural-pokhara",
    title: "Pokhara Tours",
    image: "/images/cultural-2.png",
  },
  {
    id: "cultural-ghandruk",
    title: "Ghandruk and Annapurna region",
    image: "/images/pkgp-3.png",
  },
].map(withDefaults);

export type SelectPackagesParams = {
  category?: string;
  location?: string;
  date?: string;
  page?: number;
  pageSize?: number;
};

/** Filter (a location search matches titles and overrides category) + paginate. */
export function selectPackages(
  params: SelectPackagesParams = {},
): PackageListResult {
  const { category, location, page = 1, pageSize = 6 } = params;
  let filtered = PACKAGES;
  if (location) {
    const q = location.toLowerCase();
    filtered = filtered.filter((p) => p.title.toLowerCase().includes(q));
  } else if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  return { items, page, pageSize, total, totalPages };
}
