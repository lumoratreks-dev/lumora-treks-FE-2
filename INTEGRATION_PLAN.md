# Lumora Treks — Integration Plan (CTAs · APIs · RTK Query · Wagtail)

Plan for making the (currently presentational) frontend **functional**: wire interactions, move data behind RTK Query, define the API contract, and set up Wagtail block rendering. Companion to `BUILD_GUIDE.md`. The Figma build is done; this is the "conn0ect the seams" phase.

## Locked decisions (2026-08-11)

1. **Plan against mocks.** Backend (Wagtail + Travories) not ready. Wire everything now on dummy data; define the contract we need; swap to real endpoints later — no component changes.
2. **Hybrid fetching.** **CMS marketing content → server components** (SEO); **packages / destinations / booking / forms → client RTK Query**.
3. **Defer auth.** Bookings looked up by id/email; no user login yet. "View My Bookings" is a stub for now.

## Architecture — 3 data sources, one frontend

| Source                          | Owns                                                       | Frontend access                                   | Where             |
| ------------------------------- | ---------------------------------------------------------- | ------------------------------------------------- | ----------------- |
| **Wagtail CMS** (separate repo) | Editorial/marketing page content as **StreamField blocks** | `src/lib/cms.ts` (server fetch) + `BlockRenderer` | server components |
| **Travories** (SDK/API)         | **Package + destination data** (source of truth)           | `packagesApi`, `destinationsApi` (RTK Query)      | client            |
| **Booking/Payments API**        | Checkout, promo, bookings, receipts                        | `bookingApi`, `contactApi` (RTK Query)            | client            |

**Boundary rule:** CMS blocks store only _references_ (package ids / filters). The frontend fetches the actual package data from Travories.

---

## 1. Data layer (RTK Query) — extend the existing `apiSlice`

Keep the single `apiSlice` (`src/store/api/apiSlice.ts`) + `injectEndpoints` pattern. Add tag types `Booking`, `Page`. Keep dummy `queryFn`s now; swap `fakeBaseQuery()` → `fetchBaseQuery({ baseUrl })` in Phase B.

**Slices / endpoints to add** (`src/features/*`):

- `packagesApi`: `getPackages({ category?, location?, date?, page?, pageSize? })`, `getPackage(id)` (keep `getPopularPackages`).
- `destinationsApi`: `getDestinations({ category? })`, `getDestination(slug)`.
- `bookingApi`: `createBooking`, `applyPromo`, `getBooking(id)` (mutations/queries).
- `contactApi`: `submitContact`.

**CMS is NOT in RTK Query** (hybrid) — it's server-fetched via `src/lib/cms.ts`.

**Cheap first win:** move the hardcoded arrays in `PopularPackagesGrid`, `CulturalDayTours`, `DestinationsGrid`, `PackageCard` data, etc. into dummy RTK endpoints. Components consume hooks (`useGetPackagesQuery`) → swapping to real API later is one line per endpoint.

---

## 2. CTA / interaction wiring (inventory)

| Element                                      | Action                                                          | Source      | Phase |
| -------------------------------------------- | --------------------------------------------------------------- | ----------- | ----- |
| `PackageCard` / `DestinationCard`            | wrap in `Link` → `/packages/[id]` · `/destinations/[slug]`      | —           | A     |
| `SearchBar` submit                           | `/packages?location=&date=` (drives list query)                 | packagesApi | A     |
| `FilterTabs` (Trekking/…)                    | set `category` → refetch/filter list                            | packagesApi | A     |
| `Pagination`                                 | `?page=` → refetch                                              | packagesApi | A     |
| `CarouselNav` prev/next                      | wire to **Embla** (installed) on package/experience rows        | —           | A     |
| Reserve Now (navbar, detail, CTA band, form) | → `/packages/[id]/checkout` (carry package)                     | —           | A     |
| Checkout steps                               | validate → `createBooking` + `applyPromo` → `/checkout/success` | bookingApi  | A/B   |
| Promo "Apply"                                | `applyPromo(code, subtotal)`                                    | bookingApi  | A/B   |
| `ContactForm` submit                         | `submitContact`                                                 | contactApi  | A/B   |
| PaymentSuccess buttons                       | Download Receipt (receiptUrl) · View My Bookings (stub)         | bookingApi  | B     |
| Footer links                                 | `/privacy`, `/terms`, admin (external)                          | —           | A     |

Forms: use **react-hook-form + zod** (add deps) or native + minimal validation — decide at Phase A start. All submit to dummy mutations first (fake success → success route/state).

---

## 3. Wagtail block registration (hybrid)

Build the `BlockRenderer` + registry we specced in `FRONTEND_PLAN.md`.

- `src/lib/cms.ts` (server): `getPage(slug)`, `getGlobals()` — Wagtail **API v2** REST (`/api/v2/pages/?slug=…&fields=*`); returns `{ title, slug, body: [{type, value, id}], seo }`. Mock JSON now.
- `src/lib/block-registry.ts`: maps `block.type` → section component.
- `src/components/BlockRenderer.tsx`: `blocks.map` → `registry[block.type]`, spread `block.value`.
- CMS page route (e.g. `app/(cms)/[slug]/page.tsx`) server-fetches + `<BlockRenderer/>` + `generateMetadata` from `seo`.

**Block map (editorial → CMS-driven):** `hero`→Hero · `intro_stats`→IntroStats · `experience`→ExperienceSection · `why_choose_us`→WhyChooseUs · `authentic_experiences`→AuthenticExperiences · `cta_band`→CTABand · `faq`→FAQSection.
**Data blocks (value holds refs, frontend fetches Travories):** `package_grid`→PopularPackagesGrid · `destinations_grid`→DestinationsGrid · `destinations_bento`→DestinationsBento.
**Globals singleton:** Navbar links + Footer content.

Dual-registration rule stands: every block = Wagtail StructBlock (backend repo) + React block + registry entry (here); props mirror block field names.

---

## 4. API contract we NEED (define now, backend fulfills later)

```
Package { id, slug, title, image, images[], category, rating, reviewCount,
          duration, days, price, pricePerPerson, capacity, description,
          overview, highlights[], itinerary[], location, badges[] }
PackageList { items: Package[], page, pageSize, total, totalPages }
GetPackagesParams { category?, location?, date?, page?, pageSize?, sort? }

Destination { id, slug, title, image, startingPrice, category, description }

CreateBookingInput { packageId, fullName, dob, email, phone, date, adults, children, promoCode? }
Booking { id, package(summary), date, people, bookingDate, status, subtotal,
          discount, amountPaid, amountPct, total, receiptUrl }
ApplyPromoInput { code, subtotal } -> { valid, discount, message }
ContactInput { name, email, destination, message } -> { ok }

CMS: GET /api/v2/pages/?slug=<slug>&fields=* -> { items:[{ id,title,slug,body:[{type,value,id}], seo }] }
     Globals singleton -> { nav:[...], footer:{...} }
```

---

## 5. Env / config (Phase B)

`.env.local`: `NEXT_PUBLIC_WAGTAIL_URL`, `WAGTAIL_API_TOKEN` (server-only), `NEXT_PUBLIC_TRAVORIES_URL` + `TRAVORIES_API_KEY`, `NEXT_PUBLIC_BOOKING_API_URL`. Add remote image hosts to `next.config.ts`.

## 6. UX states

Every RTK query gets loading (skeletons), error, and empty states. Reuse card shapes for skeletons.

---

## Phasing

**Phase A — no backend (do now):**

- [x] RTK-ify section data (packages/destinations/cultural) into dummy endpoints; components use hooks. (`packagesApi` getPopularPackages/getPackages/getCulturalTours, `destinationsApi` getDestinations; sections consume hooks.)
- [x] Wire interactions: cards→Links ✅, FilterTabs + Pagination ✅, SearchBar→`/packages?location=` ✅, CarouselNav→Embla ✅ (`useCarousel` hook; landing Our Packages / Cultural / Destinations are carousels; packages-page arrows paginate). (ExperienceSection arrows still presentational — bespoke layout.)
- [x] Reserve flow routing → `/checkout` → `/checkout/success` (Navbar + CTABand Reserve → /checkout; DestinationDetail "Explore Packages" → /packages; Checkout agreement enables Next → /checkout/success). Route may move under `/packages/[id]/checkout` when it carries package context.
- [ ] Forms (contact, checkout, promo) with validation + client submit → dummy mutations + success states.
- [x] Scaffold `lib/cms.ts` (mock server `getPage`) + `lib/blocks.ts` (types) + `lib/block-registry.ts` (type→component) + `components/BlockRenderer.tsx`; demo route `app/cms/[slug]/page.tsx` renders `/cms/home` from mock (server-fetched, SEO metadata). → **Phase A COMPLETE.**
- [x] Loading/error/empty states — `ui/CardSkeleton` + `ui/QueryError`; all card sections handle isLoading/isError/empty (retry via `refetch`).

**Phase B — real APIs (needs contracts):**

- [ ] `fakeBaseQuery` → `fetchBaseQuery`; implement Travories + booking + contact endpoints; env; error handling.

**Phase C — Wagtail (their repo + here):**

- [ ] Backend: StreamField blocks per the block map. Here: point `lib/cms.ts` at real Wagtail API v2; verify `BlockRenderer` end-to-end; SEO metadata.

---

## Open items to confirm

- **Wagtail API flavor:** REST **API v2** (assumed) vs GraphQL (`wagtail-grapple`).
- **Travories:** real package name / methods / response shape (SDK vs REST) — needed for Phase B.
- **Checkout route:** keep `/checkout` or nest `/packages/[id]/checkout` (recommended, carries context).
- **Detail duplication:** `/destinations/[slug]` and `/packages/[id]` both render `DestinationDetail` — diverge when Travories package vs destination data differ.
- **Forms lib:** react-hook-form + zod vs native.
