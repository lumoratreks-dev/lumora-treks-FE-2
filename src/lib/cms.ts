import type { CmsPage } from "./blocks";

/**
 * CMS data access (SERVER-ONLY by convention — import only from server
 * components; hybrid strategy: Wagtail content is fetched in server
 * components for SEO).
 *
 * Backend contract (`lumora-treks-BE`, `apps/core/api/views.py`):
 * `GET /api/v2/page-by-path/?path=<route>` returns one page's full detail
 * payload in a single request — `{ id, title, seo, body: [{type,value,id}], ... }`
 * — for whatever page type lives at that route (HomePage, StandardPage, …).
 * `body` is only present on Lumora's own page types (they inherit `BasePage`);
 * the bare Wagtail root page has no `body`/`seo`, hence the fallbacks below.
 */

const WAGTAIL_URL = process.env.NEXT_PUBLIC_WAGTAIL_URL;

/** Fetch a CMS page by its frontend route (e.g. "/", "/about"). Returns null
 * if there's no page there, the page isn't published, or the CMS is unreachable. */
export async function getPageByPath(path: string): Promise<CmsPage | null> {
  if (!WAGTAIL_URL) return null;

  try {
    const res = await fetch(
      `${WAGTAIL_URL}/api/v2/page-by-path/?path=${encodeURIComponent(path)}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    return {
      id: data.id,
      title: data.title,
      slug: data.meta?.slug ?? "",
      body: data.body ?? [],
      seo: data.seo,
    };
  } catch {
    return null;
  }
}

/** Fetch a CMS page by slug (used by the `/cms/[slug]` demo route).
 *
 * Gotcha: Wagtail's pages *listing* endpoint only returns custom `api_fields`
 * (body, seo, …) via `fields=*` when the queryset is narrowed to one page
 * type with `type=<app.Model>` — with a mixed listing it silently falls back
 * to the base `Page` fields. Since the slug alone doesn't tell us the type,
 * look the page up first, then re-fetch it by id on the *detail* endpoint,
 * which always returns the full type-specific payload (this is exactly what
 * `page-by-path` does internally — see `getPageByPath` above). */
export async function getPage(slug: string): Promise<CmsPage | null> {
  if (!WAGTAIL_URL) return null;

  try {
    const listRes = await fetch(
      `${WAGTAIL_URL}/api/v2/pages/?slug=${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } }
    );
    if (!listRes.ok) return null;

    const { items } = await listRes.json();
    const found = items?.[0];
    if (!found) return null;

    const detailRes = await fetch(`${WAGTAIL_URL}/api/v2/pages/${found.id}/`, {
      next: { revalidate: 60 },
    });
    if (!detailRes.ok) return null;

    const page = await detailRes.json();
    return {
      id: page.id,
      title: page.title,
      slug: page.meta?.slug ?? slug,
      body: page.body ?? [],
      seo: page.seo,
    };
  } catch {
    return null;
  }
}
