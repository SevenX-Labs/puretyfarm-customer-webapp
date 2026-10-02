Phase	Deliverables	Owner	Exit Criteria
0 — Setup	Repo init, Next.js+TS+Tailwind boilerplate, Tailwind config with brand colors, folder structure, .env.example	Both	Boilerplate builds and deploys a blank page to a preview URL
1 — Shared primitives	Button, Card, Section wrapper, StickyCtaBar, lib/cta.ts, lib/serviceArea.ts	Both	Primitives render in isolation (Storybook optional) and pass basic unit tests
2a — Manthan sections	Hero, Trial Offer, Why PuretyFarm, How It Works	Manthan	All 4 sections responsive at 360px/768px/1440px, CTAs functional
2b — Hitesh sections	Problem→Solution, App Showcase, Pricing, Social Proof, Trust, FAQ, Final CTA, Footer	Hitesh	All sections responsive, /terms link present
3 — Integration	Merge both branches into app/page.tsx in IA order, resolve style conflicts, sticky bar QA across full scroll	Both	Full page renders top-to-bottom with no visual breaks
4 — Pre-launch polish	SEO metadata, Lighthouse pass (≥90 perf/a11y/SEO), placeholder content swapped for real (T&C, locality list, Play Store URL) once received	Both	Lighthouse targets met, no placeholder content remaining
5 — Deferred (future, not this engagement)	Backend integration via lib/cta.ts and lib/serviceArea.ts extension points	Backend team + Manthan/Hitesh	N/A — out of current scope