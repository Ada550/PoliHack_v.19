# P.S. — Personal Stylist · Tech Stack

> A virtual personal stylist that recommends curated outfits and lets you **see them on yourself** with AI-driven virtual try-on.

## Architecture at a glance

```
┌──────────────────────────────────┐         ┌──────────────────────────────┐
│  React + Vite SPA  (port 5173)   │         │  Express API  (port 5000)    │
│                                  │  /api   │                              │
│  • Profile / Outfit / Cart pages │ ──────► │  • /api/products  (filter)   │
│  • Zustand global store          │         │  • /api/recommend (scoring)  │
│  • Tailwind UI, Framer Motion    │         │  • /api/tryon     (proxy)    │
│  • localStorage persistence      │         │  • In-memory products.json   │
└──────────────────────────────────┘         └──────────────┬───────────────┘
                                                            │
                                                            ▼
                                                ┌──────────────────────┐
                                                │  Segmind IDM-VTON    │
                                                │  Virtual try-on AI   │
                                                └──────────────────────┘
```

Monorepo layout: `server/` (Node API) + `client/` (Vite SPA). One `npm run dev` starts both.

---

## Backend — Node.js + Express

| Tech | Version | What it does | How we use it |
|---|---|---|---|
| **Node.js** | 20+ (ESM) | JavaScript runtime | All server code is ES modules (`"type": "module"`). Uses **native `fetch`** (no `axios`/`node-fetch` dependency) and **`node --watch`** for hot reload during dev. |
| **Express** | 4.x | HTTP server / routing | Three route files: `routes/products.js` (filtering + recommendations), `routes/tryon.js` (Segmind proxy). Single mount point at `/api`. |
| **Zod** | 3.x | Schema validation | Validates every incoming query string and body. Type-safe error messages out of the box (e.g. `category` must be one of `upper_body | lower_body | outerwear | dress`). |
| **dotenv** | 16.x | Env var loading | `import 'dotenv/config'` loads `server/.env` so secrets like `SEGMIND_API_KEY` never touch source. |
| **cors** | 2.x | Cross-origin headers | Allows the Vite dev origin (`localhost:5173`) to call the API. |
| **compression** | 1.x | gzip responses | All responses compressed; cuts payload by ~70% for product listings. |
| **morgan** | 1.x | Request logging | Dev-only `'dev'` format for fast visibility into API traffic. |

### Custom backend logic

- **Recommendation engine** (`server/src/lib/recommend.js`) — a hand-rolled scoring model:
  - Style keyword match (`Casual`, `Formal`, `Business`, `Sport`, `Streetwear`)
  - Body-type fit awareness (slim/tailored cuts boosted for slim/athletic; relaxed/oversized boosted for plus)
  - Budget-aware: `+8` if ≤ 40% of budget, `−25` if over
  - Returns each item with a 0–100 `score` and human-readable `reasons[]` (e.g. *"Tailored cut suits athletic build"*)
- **Outfit assembly** — picks the best top + bottom (+ optional outerwear), or a dress for women, optimizing for total cost ≤ budget.
- **Mulberry32 PRNG** — seedable random function so the *Reshuffle* button gives reproducible variation.
- **In-memory product cache** — `products.json` (30 H&M + Zara items) read once at startup; no DB round-trips.

---

## Frontend — React + Vite + Tailwind

| Tech | Version | What it does | How we use it |
|---|---|---|---|
| **React** | 18 | UI library | Functional components + hooks throughout. Strict mode on. `React.lazy` + `Suspense` to code-split the Cart and Recommendations routes. |
| **Vite** | 5 | Dev server + bundler | Instant HMR. Production build with **manual chunks** (`react`, `motion`) for better caching. Total gzipped bundle ~110 KB. |
| **Tailwind CSS** | 3 | Utility styling | Custom theme (burgundy palette `#660033`, Playfair Display + Poppins fonts) defined in `tailwind.config.js`. Reusable component classes (`.btn-primary`, `.card`, `.chip`) in `@layer components`. |
| **PostCSS + autoprefixer** | — | CSS processing | Auto-prefixes vendor styles for browser compat. |
| **React Router** | 6 | Client-side routing | Three routes: `/` (Profile), `/outfit` (Recommendations), `/cart`. Route guards redirect to `/` if profile is incomplete. |
| **Zustand** | 5 | Global state | One store (`useStylistStore`) holds profile, recommendations, cart, and try-on state. Tiny (~1 KB) and avoids Redux boilerplate. |
| **Zustand `persist`** | — | localStorage sync | Profile + cart survive a page refresh (try-on results are explicitly excluded — they're megabytes of base64). |
| **Framer Motion** | 11 | Animations | Page transitions, modal enter/exit, animated cart list (`AnimatePresence`), hover lift on product cards. Lazy-loaded as a separate chunk. |

### Custom UX touches

- **Editorial outfit hero** — the recommended look is presented as a curated 3-up image collage with category labels, not just a list.
- **Live budget meter** — a progress bar that flips from burgundy → red when total exceeds budget.
- **Skeleton loaders + lazy images** — `loading="lazy"`, `decoding="async"`, animated paper-grey placeholders, and an SVG fallback if a CDN image 404s.
- **Drag-and-drop photo upload** with `FileReader` → data URL → preview, all client-side.
- **Accessibility** — focus rings via `:focus-visible`, dialog roles on modals, `aria-pressed` on toggle pills, `prefers-reduced-motion` respected globally.
- **Persisted state** — close the tab, reopen, your profile and cart are still there.

---

## AI integration — Segmind IDM-VTON

The headline feature: **virtual try-on**. Upload a photo, click "Try on me" on any garment, and see yourself wearing it.

| Detail | Value |
|---|---|
| Model | **IDM-VTON** ("Improving Diffusion Models for Authentic Virtual Try-on in the Wild") |
| Provider | [Segmind](https://www.segmind.com/models/idm-vton) |
| Endpoint | `POST https://api.segmind.com/v1/idm-vton` |
| Auth | `x-api-key` header |
| Latency | ~25–35s per garment (single diffusion pass) |
| Cost | ~$0.04 per call |

### How we wired it up

1. **Backend proxy** (`server/src/routes/tryon.js`) — the API key never touches the client. The frontend POSTs to `/api/tryon`, the server forwards to Segmind with the secret header.
2. **Category remap** — our `outerwear` (jackets/blazers) → Segmind's `upper_body`; our `dress` → Segmind's `dresses`.
3. **Image format handling** — user photos arrive as data URIs (`data:image/jpeg;base64,...`); we strip the `data:...,` prefix and send only the raw base64 string, which is what Segmind's `File (URL)` fields actually accept (something the public docs do not make clear).
4. **Layered stacking** — for a full outfit, we apply garments **sequentially** in layer order (`lower_body` → `upper_body` → `outerwear`), feeding each output back as the next call's `human_img`. The result: one synthesized image of the user wearing the entire look.
5. **Progress UI** — the modal shows step-by-step progress ("Applying Slim-Fit Chinos… 2 of 3"), a stacked-layers history breadcrumb, a Reset button, and a Download link.
6. **Graceful degradation** — if `SEGMIND_API_KEY` is missing, the server returns 503 with a user-friendly hint; the UI surfaces a clean error rather than a stack trace.

---

## Performance optimizations

| Optimization | Impact |
|---|---|
| Vite **manual chunks** (`react`, `motion`) | Better browser cache hit rate across deploys |
| `React.lazy` for non-initial routes | Profile page paints with ~7 KB JS, not the full bundle |
| `compression` middleware on Express | ~70% smaller JSON payloads |
| In-memory product cache | Zero per-request file reads |
| `React.memo` on `ProductCard` | Avoids re-rendering 8 cards when one is added to cart |
| Zustand selectors (`s => s.cart`) | Components only re-render when their slice changes |
| `loading="lazy"` + `decoding="async"` on all product images | Faster LCP, lower bandwidth |
| Skeleton placeholders | No layout shift while images load |
| Tailwind purge via Vite content config | Final CSS is 24 KB (5 KB gzipped) |

---

## Dev experience

| Tool | Purpose |
|---|---|
| **concurrently** | Single `npm run dev` starts the Express server and Vite dev server side-by-side with colored prefixes. |
| **node --watch** | Backend auto-reloads on file changes, no nodemon dep. |
| **Vite HMR** | Sub-second refresh on frontend edits. |
| **Vite proxy** | Frontend calls `/api/*` directly; Vite proxies to `:5000` so there's no CORS friction in dev. |

---

## Demo flow / talking points

1. **Open `localhost:5173`** — show the editorial Profile page.
2. **Upload a photo, fill measurements** → highlight the live budget slider, body-type pills.
3. **Click "See my outfit"** — POST to `/api/recommend`, results render with compatibility scores and human-readable reasons.
4. **Show the curated 3-up hero outfit** with category badges and the per-item breakdown.
5. **Click "✨ Try on me"** — open the modal, walk through the multi-step generation. *("Each item runs IDM-VTON, a diffusion model that synthesizes a photoreal image of you wearing the garment. We chain them together to layer a complete look.")*
6. **Reshuffle** — same recommendation engine, different seed, different look in <100ms.
7. **Add to cart, watch the budget meter**, place an order — confetti modal.
8. **Refresh the page** — profile and cart persisted.

---

## What we'd ship next

- Real auth + multi-user persistence (Postgres, Auth0)
- Real checkout (Stripe)
- More garment data (Shopify integration → live catalog)
- Cache try-on results by `(photoHash, garmId)` to avoid duplicate $0.04 calls
- Photo hosting (Cloudinary) so the original photo is reusable across try-on chains without re-uploading base64
- Mobile-native version (React Native) — most of the UI logic is already platform-agnostic
