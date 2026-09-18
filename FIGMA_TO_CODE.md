# Figma → Code — reusable workflow

A **project-agnostic** system for turning Figma designs into code. Copy this into any repo; fill the two TEMPLATE sections per project. The portable version of this also lives as the **`figma-to-code` skill** (`~/.claude/skills/figma-to-code/`) so it travels across projects.

> **Stack assumptions (opinionated, on purpose):** Next.js (App Router) + TypeScript + **Tailwind v4** (`@theme` tokens) + **framer-motion** + **Iconify** (Lucide fallback), with the **Figma MCP** available. If a project uses a different stack, adapt the mechanics but keep the workflow + rules.

---

## Prerequisites — what makes the "build from just a link" flow work

The core capability is: **paste one Figma node link → the agent drills the layer tree itself and builds the page** (you never hand-list layers). That only works when all of these are true:

- **Figma MCP connected & authenticated** — the Figma plugin/MCP server is installed and logged in to Figma (Dev Mode). It provides `get_design_context`, `get_motion_context`, `get_metadata`, `get_screenshot`. **Without it, none of the workflow runs** — the doc just describes tools that aren't there.
- **The official `figma-design-to-code` skill is available** (ships with the Figma MCP plugin) — load it before `get_design_context`.
- **Figma access** — view/Dev Mode access to the file. The `fileKey` + `nodeId` come straight from the URL: `figma.com/design/<fileKey>/…?node-id=<id>` (dash → colon: `1-2` → `1:2`).
- **This method is actually loaded by the agent** — referenced in `CLAUDE.md` (`@import`) or installed as the **`figma-to-code` skill**. A loose `.md` in a folder is passive; it only shapes behavior if it's in context.
- **Stack + deps present** — Next.js App Router + Tailwind v4, with `framer-motion` and `@iconify/react` (+ `clsx`) installed (or adapt the mechanics).

If all of the above hold, a new repo / another person gets the _same_ layer-by-layer-from-a-link experience. If any are missing, they get the philosophy but not the machine.

---

## Workflow — build any page/section/component from a Figma link

1. **Load the `figma-design-to-code` skill** (Skill tool) BEFORE any Figma read tool.
2. **`get_design_context({ nodeId, fileKey, skillNames:"figma-design-to-code" })`** — returns reference React/Tailwind + screenshot + tokens. Treat as REFERENCE, adapt to the project's stack/components. For big pages it returns the structure (may truncate raw code) — still enough to get child node ids + asset URLs.
3. If the output says **"contains animated nodes"** → **`get_motion_context({ nodeId, fileKey, recursive:true })`**. The top frame is usually empty; child nodes hold the keyframes/easing/timing.
4. **Access layers yourself** with **`get_metadata({ nodeId, fileKey })`** (layer tree: ids, names, types, sizes). Quirk: the frame _currently selected_ in the Figma app returns shallow — drill via a child id or `get_design_context`. You never need the user to hand-list layers.
5. **Reuse first** (check the project registry). Only build new when nothing fits. Keep it **modular**: `ui/` primitives · `sections/` sections · `layout/` chrome.
6. **Images:** download ONLY real imagery to `public/images/` (`curl` the asset URL; valid ~7 days). Icons/dots/arrows/small decor → Iconify/CSS, never downloaded. Notes: Figma serves **JPEG bytes even for `.png` names** — `next/image` decodes by content, so it's fine; **foreground cutouts** (for text-behind-image tricks) come back as **RGBA PNG** (transparency preserved).
7. **Verify:** `npx next build` (from repo root) after each section; keep `tsc` + lint clean.
8. **Update the project registry** (below) whenever you add a reusable component.

## Conventions

- **Tailwind v4:** design tokens live in `globals.css` `@theme` (NOT a JS config). Map every Figma color to a token.
- **Pixel-faithful:** match Figma spacing, sizes, colors, fonts, and **tracking** (usually negative) exactly. Use `tracking-[…]` arbitrary values where it matters.
- **Motion (framer-motion):** reproduce Figma motion faithfully, BUT —
  - Figma **boomerang/`repeat` loops → implement as play-once on load**.
  - **Long timelines** (e.g. 4s) → **compress to a snappy ~0.8–1.5s**.
  - Where Figma has **no motion**, add subtle **`whileInView` fade-up** reveals (`initial {opacity:0,y:24}` → `whileInView {opacity:1,y:0}`, `viewport {once:true}`).
  - Any component using motion/hooks needs `"use client"`.
- **Icons:** Iconify (`@iconify/react`) using the **exact glyph names Figma references** (e.g. `proicons:location`, `iconoir:calendar`, `mingcute:search-line`, `ic:round-star`, `mdi:facebook`). Lucide (`lucide-react`) is the fallback.
- **Copy:** keep faithful to Figma text **including typos/placeholders** unless told otherwise — but **flag them**.
- **Reuse > rebuild.** Generalize a component with props before duplicating (e.g. a `PageHero` used by multiple pages). Extract shared primitives (SearchBar, cards, nav).

## Motion cheat-sheet

- **Entrance:** `initial {opacity:0, y:24}` → `animate`/`whileInView {opacity:1, y:0}`.
- **Scroll reveal:** `whileInView` + `viewport={{ once:true, amount:0.2–0.5 }}`; stagger via `delay: i * 0.1`.
- **"Text behind foreground" trick** (hero/CTA bands): z-layer them — bg image `z-0` < heading `z-10` < **foreground RGBA cutout** `z-20` < controls `z-30`. Animate the heading rising (`y`) so it emerges from behind the foreground.
- Read exact easing/duration/delay from `get_motion_context`; don't invent when Figma provides it.

## Phasing (design → functional)

1. **Design pass:** build everything presentational on dummy/hardcoded data, pixel-faithful. Verify with `next build`.
2. **Integration pass:** move data behind the data layer (e.g. RTK Query), wire CTAs/routes/forms, define the API contract, add loading/error/empty states, CMS block rendering. (Track this in a project `INTEGRATION_PLAN.md`.)

---

## TEMPLATE 1 — Design tokens (fill per project)

Extract from the Figma file's variables/styles; map each hex → a Tailwind `@theme` token in `globals.css`.

```
| Figma hex | Token / usage                 |
|-----------|-------------------------------|
| #xxxxxx   | text-foreground / bg-...       |
| #xxxxxx   | bg-background                  |
| #xxxxxx   | border                         |
| #xxxxxx   | primary-accent (CTA)           |
| ...       | inline for one-offs, tokenize when reused |
```

Fonts: wire via `next/font` in `layout.tsx`; note the family → utility mapping (e.g. `font-sans`, `font-body-alt`).

## TEMPLATE 2 — Reusable components registry (fill per project)

Reuse these before building anything new. Update whenever a reusable component is added.

```
### Layout (src/components/layout/)
| Component | Figma node | Purpose / notes |

### UI primitives (src/components/ui/)
| Component | Purpose | Key props |

### Sections (src/components/sections/)
| Component | Figma node | Notes |
```

## Per-project setup checklist

- [ ] Record Figma **file key** + key frame node ids.
- [ ] Extract **tokens** → `globals.css` `@theme` (TEMPLATE 1).
- [ ] Wire **fonts** via `next/font`.
- [ ] Start the **component registry** (TEMPLATE 2).
- [ ] Confirm **icon library** + install if needed.
- [ ] Create a project guide (like `BUILD_GUIDE.md`) that references THIS workflow and holds the filled-in tokens + registry.
