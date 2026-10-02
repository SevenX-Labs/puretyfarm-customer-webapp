# Graph Report - puretyfarm-customer-webapp  (2026-09-28)

## Corpus Check
- Corpus is ~10,099 words - fits in a single context window. You may not need a graph.

## Summary
- 143 nodes · 159 edges · 21 communities (10 shown, 10 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Project Documentation
- CTA & Trial Flow
- TypeScript Configuration
- Package Dependencies
- UI Component Library
- Dev Dependencies
- App Layout & Config
- Brand Identity
- Build Scripts
- Service Area Check
- Information Architecture
- ESLint Configuration
- PostCSS Configuration
- Brand Color Palette
- Hitesh Scope Definition
- File Icon
- Globe Icon
- Next Icon
- Vercel Icon
- Window Icon

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `scripts` - 5 edges
3. `react` - 5 edges
4. `Manthan Section Ownership Scope` - 5 edges
5. `Purety Farm Brand Identity` - 5 edges
6. `Button()` - 4 edges
7. `Section()` - 4 edges
8. `handleTrialClick()` - 4 edges
9. `CTA Client Interface Contract` - 4 edges
10. `next` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Purety Farm Primary Logo` --semantically_similar_to--> `Purety Farm Horizontal Logo`  [INFERRED] [semantically similar]
  public/logo.jpg → public/logo-horizontal.jpg
- `Purety Farm Primary Logo` --semantically_similar_to--> `Purety Farm Logo Mark`  [INFERRED] [semantically similar]
  public/logo.jpg → public/logo-mark.jpg
- `Play Store CTA Conversion Path` --implements--> `CTA Client Interface Contract`  [INFERRED]
  documentation/product-requirements.md → documentation/api-contracts.md
- `Development Phases 0-5` --references--> `Manthan Section Ownership Scope`  [EXTRACTED]
  documentation/development-phases.md → documentation/engineering-scope-definition.md
- `Manthan Section Ownership Scope` --references--> `US-03 7-Day Trial Clarity`  [EXTRACTED]
  documentation/engineering-scope-definition.md → documentation/user-stories-and-acceptance-criteria.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Manthan Core Deliverables** — documentation_engineering_scope_definition_manthan_scope, documentation_user_stories_and_acceptance_criteria_us01_hero, documentation_user_stories_and_acceptance_criteria_us03_trial, documentation_user_stories_and_acceptance_criteria_us04_why_us, documentation_user_stories_and_acceptance_criteria_us05_how_it_works [EXTRACTED 0.95]
- **Conversion Funnel Flow** — documentation_product_requirements_trial_offer_7day, documentation_product_requirements_play_store_cta, documentation_user_stories_and_acceptance_criteria_us02_cta, documentation_user_stories_and_acceptance_criteria_us07_sticky_cta [EXTRACTED 0.95]
- **Client-Side Abstraction Architecture** — documentation_system_architecture_cta_slot_pattern, documentation_api_contracts_cta_interface, documentation_service_area_check_spec_service_area_check, documentation_service_area_check_spec_serviceable_areas [INFERRED 0.85]
- **Purety Farm Logo Variant System** — public_logo, public_logo_horizontal, public_logo_mark [EXTRACTED 1.00]

## Communities (21 total, 10 thin omitted)

### Community 0 - "Project Documentation"
Cohesion: 0.15
Nodes (15): PuretyFarm Webapp Readme, Hero(), BENEFITS, TrialOffer(), WhyUs(), Button(), ButtonProps, ButtonSize (+7 more)

### Community 1 - "CTA & Trial Flow"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 2 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (18): CTA Client Interface Contract, Future Trial Signup API Contract (Draft), Development Phases 0-5, Manthan Section Ownership Scope, Environment Config & CI/CD Pipeline, A2 Cow Milk Subscription (PuretyFarm), Play Store CTA Conversion Path, 7-Day Trial Offer (+10 more)

### Community 3 - "Package Dependencies"
Cohesion: 0.11
Nodes (17): dependencies, next, react, react-dom, name, private, version, babel-plugin-react-compiler (+9 more)

### Community 4 - "UI Component Library"
Cohesion: 0.19
Nodes (10): react, HowItWorks(), STEPS, FEATURES, Card(), CardProps, paddingClasses, bgClasses (+2 more)

### Community 5 - "Dev Dependencies"
Cohesion: 0.20
Nodes (10): devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+2 more)

### Community 6 - "App Layout & Config"
Cohesion: 0.22
Nodes (6): Static SPA Next.js Architecture, nextConfig, next, bodyFont, headingFont, metadata

### Community 7 - "Brand Identity"
Cohesion: 0.47
Nodes (6): A2 Milk Product Offering, Purety Farm Brand Identity, Desi Cow and Calf Illustration, Purety Farm Primary Logo, Purety Farm Horizontal Logo, Purety Farm Logo Mark

### Community 8 - "Build Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 10 - "Information Architecture"
Cohesion: 0.67
Nodes (3): 12-Section Landing Page Information Architecture, Component Layout & Single App Convention, US-06 Terms & Conditions Route

## Knowledge Gaps
- **84 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+79 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 93 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `UI Component Library` to `Project Documentation`, `Package Dependencies`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Dependencies` to `Package Dependencies`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `next` connect `App Layout & Config` to `Package Dependencies`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _84 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CTA & Trial Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `TypeScript Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._