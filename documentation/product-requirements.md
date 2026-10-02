PRODUCT: PuretyFarm Landing Page (Manthan's build scope)

PRODUCT SUMMARY
Single static landing page for PuretyFarm, an A2 cow milk subscription service in Raipur.
Purpose: convert visitors into either a 7-Day Trial starter or an app downloader. No other conversion path exists.
Built as a Next.js (TypeScript) + Tailwind CSS static SPA. No backend calls in this phase.
TARGET USERS
Primary: Raipur residents arriving via Instagram, WhatsApp, or Google Search on mobile.
Secondary: desktop visitors researching before subscribing.
CORE VALUE PROPOSITION
Fresh, genuine A2 cow milk delivered daily to your door in Raipur, with a low-risk 7-day trial before committing to a subscription.
IN SCOPE (this phase)
Static single-page site + one additional static route (/terms).
Two CTAs only: "Start 7-Day Trial" and "Download App" — both currently resolve to the same Play Store link.
Fully static content — no forms submitting to a live backend, no user accounts, no payments.
Service-area check is a static client-side lookup (see service-area-check-spec), not an API call.
OUT OF SCOPE (this phase)
Backend API integration (deferred — see api-contracts).
Authentication, payments, database, admin panel.
iOS/App Store link (deferred until app developer ships iOS build).
APK hosting/distribution (explicitly rejected — Play Store link only).
FUNCTIONAL REQUIREMENTS (Manthan's owned sections)
Hero: headline, subheadline, trust line, both CTAs visible above the fold on mobile without scrolling.
7-Day Trial Offer: value pitch + 4 benefit bullets + CTA repeated.
Why PuretyFarm: 4-6 feature cards with icon, title, one-line description.
How It Works: ordered 5-step process (Download app → Choose plan → Start trial → Set delivery preference → Receive milk before 11am).
NON-FUNCTIONAL REQUIREMENTS
Mobile-first responsive design (360px–1440px breakpoints minimum).
Lighthouse targets: Performance ≥ 90, Accessibility ≥ 90, SEO ≥ 95 (mobile).
Page weight budget: < 1.5MB initial load (images compressed/next/image optimized).
No layout shift on CTA buttons (fixed height/skeleton where async content might load later).
CONSTRAINTS
No backend exists yet — all "dynamic" behavior (service area check, CTA action) must be structured as swappable client-side logic (see api-contracts, service-area-check-spec).
Play Store URL and T&C content are external dependencies not yet delivered by team lead.
SUCCESS METRICS (intended, not yet instrumented)
CTA click-through rate (Trial vs Download) — to be wired to analytics once available.
Bounce rate on hero section.
Scroll depth to pricing/FAQ sections.