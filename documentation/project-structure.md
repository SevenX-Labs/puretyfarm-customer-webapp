NOTE: Adapted from "monorepo-structure" — this is a single Next.js application, not a monorepo. A monorepo would be over-engineering for one static app with one owning team.

purety-farm-landing/
├── app/
│   ├── page.tsx                  # Landing page — composes all sections (Manthan + Hitesh)
│   ├── terms/
│   │   └── page.tsx              # T&C route (Manthan sets up route, Hitesh links from footer)
│   ├── layout.tsx                # Root layout, fonts, metadata
│   └── globals.css               # Tailwind base
├── components/
│   ├── sections/
│   │   ├── Hero.tsx              # Manthan
│   │   ├── TrialOffer.tsx        # Manthan
│   │   ├── ProblemSolution.tsx   # Hitesh
│   │   ├── WhyUs.tsx             # Manthan
│   │   ├── HowItWorks.tsx        # Manthan
│   │   ├── AppShowcase.tsx       # Hitesh
│   │   ├── Pricing.tsx           # Hitesh
│   │   ├── SocialProof.tsx       # Hitesh
│   │   ├── TrustSection.tsx      # Hitesh
│   │   ├── FAQ.tsx               # Hitesh
│   │   └── FinalCTA.tsx          # Hitesh
│   └── ui/
│       ├── Button.tsx            # Shared primitive — build together first
│       ├── Card.tsx              # Shared primitive
│       ├── Section.tsx           # Shared wrapper (max-width, padding)
│       └── StickyCtaBar.tsx      # Shared, global
├── lib/
│   ├── cta.ts                    # CTA slot functions
│   └── serviceArea.ts            # Static locality check
├── config/
│   └── env.ts                    # Typed env accessors
├── data/
│   └── serviceableAreas.ts       # Static array of Raipur localities
├── public/
│   └── logo/                     # Source logo assets
├── .env.example
├── tailwind.config.ts
├── tsconfig.json
└── package.json

Naming conventions:

Components: PascalCase, one component per file, matching filename.
Utility functions: camelCase, grouped by domain in lib/.
No default exports for utility functions (named exports only, for consistent imports).