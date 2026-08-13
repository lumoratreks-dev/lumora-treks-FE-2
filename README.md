# Lumora Treks frontend

Next.js App Router frontend for the Lumora Treks travel site. Content is supplied by the Wagtail API in `../lumora-treks-BE`.


## Local setup

```bash
npm ci
cp .env.local.example .env.local
npm run dev
```

Open <http://localhost:3000>.

The local environment should point to a local or staging CMS, not production:

```dotenv
NEXT_PUBLIC_WAGTAIL_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

Create a Google Web OAuth client and allow the frontend origins you use (for
example `http://localhost:3000` and the production site). Use the same client
ID as `GOOGLE_CLIENT_ID` in the backend. Account tokens are kept in an
HTTP-only same-origin cookie by the frontend auth bridge. The token belongs to
Lumora rather than Google; Google is one linked identity provider, so future
email/password or additional OAuth methods can reuse the same session contract.

## Verification

```bash
npm run typecheck
npm run lint
npm run check:contracts
npm run build
```

`check:contracts` compares Wagtail section component names with the frontend block registry.

## Main routes

- `/` — CMS-driven homepage with a fallback shell
- `/packages` and `/packages/[id]` — catalog listing and detail
- `/destinations` and `/destinations/[slug]` — destination listing and detail
- `/enquiry` — lead enquiry form
- `/join` — Google sign-in and traveler onboarding entry point
- `/checkout` — clearly labelled payment simulation; no card data is collected and no money is charged
- `/cms/[slug]` — CMS preview/demo route

See `FRONTEND_PLAN.md`, `INTEGRATION_PLAN.md`, and the repository-level `PROJECT_GAP_ANALYSIS.md` for architecture and remaining work.
