# Graph Report - puretyfarm-customer-webapp  (2026-09-30)

## Corpus Check
- 47 files · ~63,013 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 218 nodes · 360 edges · 37 communities (23 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f866ebe5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Project Documentation|Project Documentation]]
- [[_COMMUNITY_CTA & Trial Flow|CTA & Trial Flow]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_UI Component Library|UI Component Library]]
- [[_COMMUNITY_Dev Dependencies|Dev Dependencies]]
- [[_COMMUNITY_App Layout & Config|App Layout & Config]]
- [[_COMMUNITY_Brand Identity|Brand Identity]]
- [[_COMMUNITY_Build Scripts|Build Scripts]]
- [[_COMMUNITY_Service Area Check|Service Area Check]]
- [[_COMMUNITY_Information Architecture|Information Architecture]]
- [[_COMMUNITY_ESLint Configuration|ESLint Configuration]]
- [[_COMMUNITY_PostCSS Configuration|PostCSS Configuration]]
- [[_COMMUNITY_Terms Page|Terms Page]]
- [[_COMMUNITY_Brand Color Palette|Brand Color Palette]]
- [[_COMMUNITY_Hitesh Scope Definition|Hitesh Scope Definition]]
- [[_COMMUNITY_File Icon|File Icon]]
- [[_COMMUNITY_Globe Icon|Globe Icon]]
- [[_COMMUNITY_Next Icon|Next Icon]]
- [[_COMMUNITY_Vercel Icon|Vercel Icon]]
- [[_COMMUNITY_Window Icon|Window Icon]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 36|Community 36]]

## God Nodes (most connected - your core abstractions)
1. `getWhatsAppUrl()` - 16 edges
2. `compilerOptions` - 16 edges
3. `useScrollReveal()` - 15 edges
4. `useStaggerReveal()` - 15 edges
5. `getPhoneUrl()` - 13 edges
6. `getEmailUrl()` - 12 edges
7. `FaqCtaFooter()` - 9 edges
8. `Button()` - 9 edges
9. `Section()` - 9 edges
10. `ENV` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Purety Farm Primary Logo` --semantically_similar_to--> `Purety Farm Horizontal Logo`  [INFERRED] [semantically similar]
  public/logo.jpg → public/logo-horizontal.jpg
- `Purety Farm Primary Logo` --semantically_similar_to--> `Purety Farm Logo Mark`  [INFERRED] [semantically similar]
  public/logo.jpg → public/logo-mark.jpg
- `EmptyStatePage()` --calls--> `getWhatsAppUrl()`  [EXTRACTED]
  src/app/empty-state/page.tsx → src/lib/cta.ts
- `FaqCtaFooter()` --calls--> `useParallax()`  [EXTRACTED]
  src/components/sections/FaqCtaFooter.tsx → src/lib/animations.ts
- `FaqCtaFooter()` --calls--> `useScrollReveal()`  [EXTRACTED]
  src/components/sections/FaqCtaFooter.tsx → src/lib/animations.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Conversion Funnel Flow** — documentation_product_requirements_trial_offer_7day, documentation_product_requirements_play_store_cta, documentation_user_stories_and_acceptance_criteria_us02_cta, documentation_user_stories_and_acceptance_criteria_us07_sticky_cta [EXTRACTED 0.95]
- **Manthan Core Deliverables** — documentation_engineering_scope_definition_manthan_scope, documentation_user_stories_and_acceptance_criteria_us01_hero, documentation_user_stories_and_acceptance_criteria_us03_trial, documentation_user_stories_and_acceptance_criteria_us04_why_us, documentation_user_stories_and_acceptance_criteria_us05_how_it_works [EXTRACTED 0.95]
- **Purety Farm Logo Variant System** — public_logo, public_logo_horizontal, public_logo_mark [EXTRACTED 1.00]
- **Client-Side Abstraction Architecture** — documentation_system_architecture_cta_slot_pattern, documentation_api_contracts_cta_interface, documentation_service_area_check_spec_service_area_check, documentation_service_area_check_spec_serviceable_areas [INFERRED 0.85]

## Communities (37 total, 14 thin omitted)

### Community 1 - "CTA & Trial Flow"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 2 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (18): CTA Client Interface Contract, Future Trial Signup API Contract (Draft), Development Phases 0-5, Manthan Section Ownership Scope, Environment Config & CI/CD Pipeline, A2 Cow Milk Subscription (PuretyFarm), Play Store CTA Conversion Path, 7-Day Trial Offer (+10 more)

### Community 3 - "Package Dependencies"
Cohesion: 0.08
Nodes (24): dependencies, gsap, @gsap/react, next, react, react-dom, devDependencies, babel-plugin-react-compiler (+16 more)

### Community 4 - "UI Component Library"
Cohesion: 0.10
Nodes (31): useDrawLine(), useScrollReveal(), useStaggerReveal(), handleTrialClick(), APP_SCREENS, AppShowcase(), FEATURES, HowItWorks() (+23 more)

### Community 5 - "Dev Dependencies"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 7 - "Brand Identity"
Cohesion: 0.47
Nodes (6): A2 Milk Product Offering, Purety Farm Brand Identity, Desi Cow and Calf Illustration, Purety Farm Primary Logo, Purety Farm Horizontal Logo, Purety Farm Logo Mark

### Community 8 - "Build Scripts"
Cohesion: 0.20
Nodes (20): metadata, NotFound(), ENV, EmptyStatePage(), metadata, getEmailUrl(), getPhoneUrl(), getWhatsAppUrl() (+12 more)

### Community 9 - "Service Area Check"
Cohesion: 0.27
Nodes (6): useFloating(), useHeroEntrance(), useParallax(), Hero(), HeroBottle3D(), HeroBottle3DProps

### Community 10 - "Information Architecture"
Cohesion: 0.67
Nodes (3): 12-Section Landing Page Information Architecture, Component Layout & Single App Convention, US-06 Terms & Conditions Route

### Community 13 - "Terms Page"
Cohesion: 0.33
Nodes (4): bodyFont, headingFont, metadata, viewport

### Community 21 - "Community 21"
Cohesion: 0.29
Nodes (6): SERVICEABLE_AREAS, checkServiceArea(), ServiceAreaResult, POPULAR_AREAS, ServiceAreaChecker(), metadata

### Community 22 - "Community 22"
Cohesion: 0.40
Nodes (4): Deploy on Vercel, Getting Started, Learn More, puretyfarm-customer-webapp

## Knowledge Gaps
- **104 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+99 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ENV` connect `Build Scripts` to `Terms Page`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `getWhatsAppUrl()` connect `Build Scripts` to `Community 21`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `useScrollReveal()` connect `UI Component Library` to `Build Scripts`, `Service Area Check`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _107 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CTA & Trial Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `TypeScript Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._