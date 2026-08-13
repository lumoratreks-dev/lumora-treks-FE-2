# Packages Page — Build Spec


Working spec for the Packages page, agreed in conversation. Figma is the **single source of truth**; implement **pixel-by-pixel** against the exact Figma values (spacing, sizes, colors, fonts, tracking). This repo is the **frontend only** (Wagtail CMS lives in a separate repo).

Figma file: `wQqFmHdPd7V19J9OCypUHI` · Packages page frame: **`81:473`** ("packages", 1440×4467).

---

## Locked decisions
1. **Route:** `src/app/packages/page.tsx` → served at `/packages` (matches the existing Navbar "Packages" link; `usePathname` auto-activates the green dot).
2. **Search bar:** extract a **shared `ui/SearchBar.tsx`** and use it in BOTH the landing hero and the packages hero (refactor `Hero.tsx` to use it too).
3. **Tabs + pagination:** **presentational** for now — active state highlights on click, but no real filtering/paging (real data arrives later via Travories SDK / Wagtail).

---

## Stack / conventions (already established)
- **Next.js 16 (App Router) + TypeScript + Tailwind v4** (tokens in `src/app/globals.css` `@theme`, NOT a JS config).
- **Motion:** `framer-motion`. Reproduce Figma motion faithfully; where Figma has none, add subtle `whileInView` fade-up reveals (consistent with other sections). Any component using motion/hooks needs `"use client"`.
- **Icons:** Iconify (`@iconify/react`) using the exact glyph names Figma references (e.g. `proicons:location`, `iconoir:calendar`, `mingcute:search-line`, `ic:round-star`, `mdi:facebook`…). Lucide as fallback only.
- **Images:** download ONLY real imagery from Figma into `public/images/` (2× assets; note Figma serves JPEG bytes even with `.png` names — Next `<Image>` handles it). Icons/dots/arrows/small decor → icon lib or CSS, never downloaded.
- **Verify:** run `npx next build` after each section; keep tsc + lint clean.

### Design tokens (from `globals.css` — match Figma exactly)
- `#1e1e1e` → `text-foreground` · `#f5f5f5` → `background` · `#e0e4e8` → `border`
- `#47586e` → `text-secondary` · `#39ff14` → `primary-accent` (neon CTA green)
- `#909dad` and `#3d4c5e` → currently inline (tokenize `#909dad` as `--color-text-faint` in cleanup).
- Fonts: Plus Jakarta Sans (`font-sans`, default), Poppins (`font-body-alt`), Pattaya (`font-script`). Tracking is negative (~-0.04em to -0.06em); use exact `tracking-[…]` where it matters.

---

## Reusable components (DO NOT rebuild — reuse)
- `layout/Navbar.tsx` — floats over content; "Packages" auto-active on `/packages`.
- `layout/Footer.tsx` — identical to Figma `177:1111`.
- `sections/IntroStats.tsx` — identical to Figma `118:5774` ("We've helped thousands…"). Reuse verbatim.
- `ui/PackageCard.tsx` — image + white info box (title, description, `$400 per person` / `4 Days` / `★ 4.9` badges).
- `ui/CarouselNav.tsx` — prev (`bg-background`) / next (`bg-primary-accent`) circular arrows.

---

## Page structure (top → bottom) with Figma node ids

1. **Navbar** (`81:474`) — ♻️ reuse `Navbar`.

2. **Packages Hero** (`118:5899`) — 🆕 `sections/PackagesHero.tsx`. Flex row, gap 60, items-center, container ~1274 wide.
   - Left: puzzle-masked image (`118:5903`, `imgSubtract`, ~565×457) — download.
   - Right (`118:5912`, w-684, gap 32):
     - "**Our Packages**" — Plus Jakarta Sans Bold 40px, `#1e1e1e`, tracking -2.4px, + 12px accent dot.
     - Subtitle (`118:5926`) — Poppins Medium 24px `#3d4c5e`, tracking -0.96px, italic tail `#909dad`: "We design meaningful travel experiences that connect you with nature, culture, *and unforgettable journey at a time.*"
     - **Search bar** (`118:5930`) → shared `ui/SearchBar.tsx` (Location + Date fields, neon-green search button).
   - **Motion:** page flags animated nodes — pull `get_motion_context` for the hero (subtract/subtitle/search bar animate in).

3. **Popular Packages** (`83:656`) — 🆕 `sections/PopularPackagesGrid.tsx`; ♻️ `PackageCard` + `CarouselNav`. Flex-col gap 60.
   - Header (`84:1475`): "**Popular Packages**" Bold 32px tracking -1.28px + `CarouselNav` (right).
   - **Filter tabs** (`84:1448`, 🆕 `ui/FilterTabs.tsx`): `Trekking` (active: `bg-foreground` text `#f5f5f5`), `Sightseeing`, `Paragliding` (`bg-background` text `#1e1e1e`). rounded-4, p-12, SemiBold 18px, tracking -0.72px. Presentational.
   - Grid: **2 rows × 3** `PackageCard` (h-397, gap 24).
   - **Pagination** (`84:1254`, 🆕 `ui/Pagination.tsx`): prev arrow · `1` active (bg `#f5f5f5`, border `#1e1e1e`, SemiBold 18px) · `2` `3` (border `#e0e4e8`, Medium 18px `#47586e`, 40px squares, rounded-8) · next arrow. Presentational.

4. **Intro + Stats** (`118:5774`) — ♻️ reuse `IntroStats` verbatim.

5. **Cultural & Day Tours** (`84:1278`) — 🆕 `sections/CulturalDayTours.tsx`; ♻️ `PackageCard` + `CarouselNav`. Header "**Cultural & Day Tours**" Bold 32px + subtitle Poppins Regular 24px `#47586e` + `CarouselNav`; row of **3** `PackageCard`. (Essentially the landing "Our Packages" row pattern with different title/data — consider generalizing that into a shared `PackageCarousel`.)

6. **Footer** (`177:1111`) — ♻️ reuse `Footer` (watermark rises on scroll — already built).

---

## New components to create
- `ui/SearchBar.tsx` (shared; also refactor `Hero.tsx` to use it)
- `sections/PackagesHero.tsx`
- `ui/FilterTabs.tsx` (presentational active state)
- `ui/Pagination.tsx` (presentational)
- `sections/PopularPackagesGrid.tsx`
- `sections/CulturalDayTours.tsx` (or a shared `PackageCarousel` reused by landing + here)

## Known Figma copy placeholders / typos (kept faithful unless told otherwise)
- Lorem-ipsum descriptions + `$400`/`4 Days`/`4.9` on all cards.
- "**Cured Destinations**" (likely "Curated") in Intro stats.
- Card titles repeat (Dhorpatan / Pokhara / Ghandruk) — placeholder data.

## Workflow when designs arrive
User will provide all packages-page designs at once. For each: read design (+ motion) context → build to **exact** Figma values → reuse where mapped above → register real images → `next build` → verify. Then reconcile page order/spacing against the full-page screenshot (`81:473`).
