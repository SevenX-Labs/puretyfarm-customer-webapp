ARCHITECTURE STYLE
Static SPA-style Next.js app, App Router, rendered via Static Site Generation (SSG) — no server runtime required for content.
No backend service is owned by this codebase. Backend (separate system) is built by other team members and not yet integrated.
COMPONENT DIAGRAM (textual)

[Browser]
|
v
[Next.js Static App]
|-- app/page.tsx (landing page, composes section components)
|-- app/terms/page.tsx (T&C route)
|-- components/sections/* (Hero, TrialOffer, WhyUs, HowItWorks, ...)
|-- components/ui/* (Button, Card, Section wrapper, StickyBar)
|-- lib/cta.ts (CTA slot functions: handleTrialClick, handleDownloadClick)
|-- lib/serviceArea.ts (static locality check, see service-area-check-spec)
|-- config/env.ts (PLAY_STORE_URL, WHATSAPP_NUMBER, etc.)
|
v (on CTA click)
[External: Play Store URL] — direct browser navigation, no API involved

FUTURE (not built now):
[Next.js Static App] --(API call via lib/cta.ts)--> [Backend API, owned by other team] --> [Database]

DATA FLOW (current phase)
All content is static/hardcoded at build time (no CMS, no fetch calls).
User interaction (CTA click) triggers a local function → browser navigation to an external URL. No request/response cycle with any backend.
Service area check: user input (text/select) → local array lookup in lib/serviceArea.ts → boolean + message returned synchronously, no network call.
DATA FLOW (future, deferred)
CTA slot function (lib/cta.ts) will be extended to POST to a backend endpoint (trial signup / click tracking) before or alongside the redirect.
Service area check may later call a backend endpoint instead of a static array, without changing the calling component (same function signature).
RENDERING STRATEGY
Use output: 'export' or default SSG for all routes — this site has no per-request dynamic data, so full static export is appropriate.
Images via next/image with static imports for logo/icons.
HOSTING (recommendation, confirm with team lead)
Vercel (native Next.js support, automatic preview deployments per PR).