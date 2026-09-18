# Lumora Treks — Frontend Plan (Next.js)

The public travel-agency website. Editorial pages are assembled from **blocks** delivered by the **Wagtail CMS** and rendered by `<BlockRenderer>`.

> **Repo scope:** this repo is the **frontend only**. The **Wagtail/Django CMS lives in a separate repo** — we only consume its API here. Every block is registered on **both** sides (Wagtail StreamField + this frontend); see §4.

← Back to [`PLAN.md`](./PLAN.md)

---

## 1. Stack

| Concern     | Choice                                                               |
| ----------- | -------------------------------------------------------------------- |
| Framework   | **Next.js (App Router) + TypeScript**                                |
| Styling     | **Tailwind CSS**                                                     |
| CMS data    | Native `fetch` (server components), Wagtail API v2                   |
| Motion      | Figma motion reproduced in code (**Motion / `framer-motion`** — TBD) |
| Images      | `next/image`                                                         |
| Lint/format | ESLint + Prettier                                                    |

---

## 2. Setup steps

1. **Create the app**
   ```bash
   npx create-next-app@latest frontend --typescript --tailwind --eslint --app
   ```
2. **Env** — `frontend/.env.local`
   ```
   NEXT_PUBLIC_WAGTAIL_URL=http://localhost:8000
   WAGTAIL_API_TOKEN=<read-only token>
   ```
3. **Allow remote images** (Wagtail image hosts) in `next.config.js`.
4. **Run:** `npm run dev` → http://localhost:3000

---

## 3. Folder structure (proposed)

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # home (CMS page, by slug "home")
│   │   ├── [slug]/page.tsx          # any CMS page (about, landing, …)
│   ├── blocks/                      # one React component per CMS block
│   │   ├── Hero.tsx
│   │   ├── HeaderCard.tsx
│   │   ├── PackageGrid.tsx          # package grid block
│   │   ├── Testimonials.tsx
│   │   ├── Gallery.tsx
│   │   ├── FAQ.tsx
│   │   ├── CTABanner.tsx
│   │   └── ...
│   ├── components/                  # shared UI (Navbar, Footer, PackageCard)
│   ├── lib/
│   │   ├── wagtail.ts               # CMS API client (Wagtail API v2)
│   │   ├── block-registry.ts        # maps block.type → React block
│   │   └── types.ts
│   └── styles/
└── .env.local
```

---

## 4. The Block Renderer (core of the CMS side)

Wagtail's **StreamField** returns a page body as an ordered array of blocks, each shaped `{ type, value, id }` (e.g. `{ type: "hero", value: {...}, id: "..." }`). The renderer maps `type` → a React component and passes `value` as its props.

`src/lib/block-registry.ts`:

```ts
import Hero from "@/blocks/Hero";
import PackageGrid from "@/blocks/PackageGrid";
import Testimonials from "@/blocks/Testimonials";
import CTABanner from "@/blocks/CTABanner";
// ...import every registered block

export const blockRegistry = {
  hero: Hero,
  "package-grid": PackageGrid,
  testimonials: Testimonials,
  "cta-banner": CTABanner,
  // ...one entry per Wagtail StreamField block (key = block type)
} as const;
```

`src/components/BlockRenderer.tsx`:

```tsx
import { blockRegistry } from "@/lib/block-registry";

export default function BlockRenderer({ blocks }: { blocks: any[] }) {
  return (
    <>
      {blocks.map((block) => {
        const Component = blockRegistry[block.type];
        if (!Component) return null; // unknown block → skip (log in dev)
        return <Component key={block.id} {...block.value} />;
      })}
    </>
  );
}
```

Rendering a CMS page (`app/[slug]/page.tsx`):

```tsx
import { fetchAPI } from "@/lib/wagtail";
import BlockRenderer from "@/components/BlockRenderer";

export default async function Page({ params }: { params: { slug: string } }) {
  const { items } = await fetchAPI(`pages/?slug=${params.slug}&fields=*`);
  const page = items[0];
  return <BlockRenderer blocks={page.body} />; // StreamField field, e.g. `body`
}
```

> **Dual-registration rule:** every block must get (a) a Wagtail StreamField `StructBlock` in the CMS repo, (b) a React block in `src/blocks/`, and (c) an entry in `block-registry.ts`. The React props **mirror the Wagtail block's fields**. If they drift, unknown blocks are skipped.

---

## 5. CMS API client — `src/lib/wagtail.ts`

```ts
const WAGTAIL = process.env.NEXT_PUBLIC_WAGTAIL_URL;
export async function fetchAPI(path: string) {
  const res = await fetch(`${WAGTAIL}/api/v2/${path}`, {
    headers: { Authorization: `Bearer ${process.env.WAGTAIL_API_TOKEN}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Wagtail ${res.status}`);
  return res.json();
}
```

> Wagtail API v2 lives under `/api/v2/`. Use the **`fields`** param to pull nested block/relation/image data (e.g. `fields=*` for everything, or an explicit list). StreamField blocks come back as `{ type, value, id }`.

---

## 6. Pages / routes

| Route     | Source          | Purpose                    |
| --------- | --------------- | -------------------------- |
| `/`       | CMS page `home` | blocks-composed homepage   |
| `/[slug]` | CMS page        | about, landing pages, etc. |

Navbar/Footer: static or from a CMS "global" single type.

---

## 7. Build order (frontend)

- [ ] Scaffold Next.js + Tailwind, run dev server
- [ ] `wagtail.ts` + `types.ts` + `.env.local`
- [ ] `BlockRenderer` + `block-registry` with 2–3 blocks (Hero, RichText, CTA)
- [ ] Render a CMS page end-to-end (`/[slug]`)
- [ ] Build out the full block library (match Wagtail components)
- [ ] Navbar/Footer, loading/error states, responsive
- [ ] SEO metadata, image optimization
- [ ] Deploy to Vercel; wire Wagtail env

---

## 8. Gotchas

- Keep **Wagtail StreamField blocks and the block registry in sync** — a CMS block with no React counterpart (or vice versa) renders as nothing.
- Nested block/relation/image data is missing unless you request it via the **`fields`** param on the API v2 call.
- Block props must **mirror the Wagtail block's field names** exactly (props come straight from `block.value`).
- Never expose write/secret tokens client-side; call the CMS from **server components** where possible.

---

## 9. Figma → code (design + motion)

Components are implemented from **Figma**, and Figma designs carry **motion** we reproduce in code.

- Load the relevant Figma skill before the Figma MCP read tools (`figma-design-to-code`; `figma-implement-motion` for animated nodes).
- Per component: read design + motion context → build the React block in `src/blocks/` → register in `block-registry.ts` → mirror the fields as a Wagtail StreamField block (CMS repo) → verify in the running app.
- Motion library: **Motion / `framer-motion`** (TBD) — reproduces Figma transitions/easing/keyframes.
