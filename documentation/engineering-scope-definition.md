IN SCOPE
Static Next.js (TypeScript) + Tailwind landing page, single route + /terms.
All 12 page sections per information-architecture.
CTA slot pattern (handleTrialClick / handleDownloadClick) redirecting to a config-driven Play Store URL.
Static service-area check (no backend).
Responsive design, mobile-first.
Basic SEO metadata (title, description, OG tags) — content per brief section 18.
OUT OF SCOPE (explicitly)
Any backend API, database, or authentication — owned by a separate team, not this codebase.
Payment processing.
iOS/App Store link and any platform-detection CTA logic.
APK hosting or download.
Analytics/tracking implementation beyond leaving clearly-defined hook points (lib/cta.ts) for later wiring.
CMS integration for content editing (all content hardcoded/static for this phase).
ASSUMPTIONS
Play Store listing will exist and be publicly accessible by the time this ships.
Team lead will supply final T&C copy and the serviceable-locality list before launch (placeholders used until then).
No design system exists elsewhere to conform to — this project defines its own (see color palette established earlier: off-white 
#FFFDF7 background, maroon 
#5C1B13 primary CTA, yellow 
#F5E729 accent).
EXTERNAL DEPENDENCIES (blocking launch, not blocking development start)
| Dependency | Owner | Status |
|---|---|---|
| Play Store URL | Team lead / app developer | Pending |
| Terms & Conditions content | Team lead | Pending |
| Full serviceable-locality list | Team lead | Pending |
| Source logo file | Team lead | Pending |
OWNERSHIP SPLIT
Section	Owner
Hero, Trial Offer, Why PuretyFarm, How It Works	Manthan
Problem→Solution, App Showcase, Pricing, Social Proof, Trust, FAQ, Final CTA, Footer	Hitesh
Shared UI primitives (Button, Card, Section, StickyCtaBar), lib/cta.ts, lib/serviceArea.ts	Both (build together first)