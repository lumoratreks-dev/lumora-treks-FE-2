import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SearchResults from "@/components/search/SearchResults";
import {
  fetchAllDestinations,
  fetchSearchResults,
} from "@/features/search/searchQueries";

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

const readQuery = (q?: string | string[]) =>
  (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 100) ?? "";

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const q = readQuery((await searchParams).q);
  return {
    title: q ? `“${q}” — Search | Lumora Treks` : "Search | Lumora Treks",
    robots: { index: false, follow: true },
  };
}

/** `/search?q=` — universal results across packages, destinations and blog
 * stories (see `SearchResults`). Old `/packages?location=` links redirect
 * here. */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const q = readQuery((await searchParams).q);
  const [results, destinations] = await Promise.all([
    fetchSearchResults(q, 24),
    fetchAllDestinations(),
  ]);
  const suggestions = destinations.slice(0, 6).map((d) => d.title);

  return (
    <>
      <main className="flex-1">
        <Navbar />
        <SearchResults key={q} results={results} suggestions={suggestions} />
      </main>
      <Footer />
    </>
  );
}
