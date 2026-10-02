# Graph Report - puretyfarm-customer-webapp  (2026-09-26)

## Corpus Check
- 40 files · ~9,204 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 167 nodes · 194 edges · 37 communities (21 shown, 16 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3d7afca2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_TypeScript Compiler Configuration|TypeScript Compiler Configuration]]
- [[_COMMUNITY_Project Dependencies & Metadata|Project Dependencies & Metadata]]
- [[_COMMUNITY_Development Dependencies & Tooling|Development Dependencies & Tooling]]
- [[_COMMUNITY_CTA Conversion & API Contracts|CTA Conversion & API Contracts]]
- [[_COMMUNITY_Manthan Scope & Core User Stories|Manthan Scope & Core User Stories]]
- [[_COMMUNITY_Next.js App Layout & Configuration|Next.js App Layout & Configuration]]
- [[_COMMUNITY_Landing Page Architecture & Routing|Landing Page Architecture & Routing]]
- [[_COMMUNITY_Core Runtime Dependencies|Core Runtime Dependencies]]
- [[_COMMUNITY_Package Build Scripts|Package Build Scripts]]
- [[_COMMUNITY_ESLint Linter Configuration|ESLint Linter Configuration]]
- [[_COMMUNITY_PostCSS Style Pipeline|PostCSS Style Pipeline]]
- [[_COMMUNITY_Graphify Knowledge Graph Integration|Graphify Knowledge Graph Integration]]
- [[_COMMUNITY_Brand Color & Design Palette|Brand Color & Design Palette]]
- [[_COMMUNITY_Hitesh Engineering Scope|Hitesh Engineering Scope]]
- [[_COMMUNITY_Document File Icon Asset|Document File Icon Asset]]
- [[_COMMUNITY_Globe Network Icon Asset|Globe Network Icon Asset]]
- [[_COMMUNITY_Next.js Framework Logo|Next.js Framework Logo]]
- [[_COMMUNITY_Vercel Platform Logo|Vercel Platform Logo]]
- [[_COMMUNITY_Browser Window Icon Asset|Browser Window Icon Asset]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 36|Community 36]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `Section()` - 11 edges
3. `Button()` - 6 edges
4. `handleTrialClick()` - 6 edges
5. `scripts` - 5 edges
6. `Manthan Section Ownership Scope` - 5 edges
7. `handleDownloadClick()` - 4 edges
8. `CTA Client Interface Contract` - 4 edges
9. `Card()` - 3 edges
10. `ENV` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Play Store CTA Conversion Path` --implements--> `CTA Client Interface Contract`  [INFERRED]
  documentation/product-requirements.md → documentation/api-contracts.md
- `US-07 Sticky Mobile CTA Bar` --references--> `CTA Slot Pattern (lib/cta.ts)`  [INFERRED]
  documentation/user-stories-and-acceptance-criteria.md → documentation/system-architecture.md
- `Development Phases 0-5` --references--> `Manthan Section Ownership Scope`  [EXTRACTED]
  documentation/development-phases.md → documentation/engineering-scope-definition.md
- `Manthan Section Ownership Scope` --references--> `US-03 7-Day Trial Clarity`  [EXTRACTED]
  documentation/engineering-scope-definition.md → documentation/user-stories-and-acceptance-criteria.md
- `Manthan Section Ownership Scope` --references--> `US-04 Why PuretyFarm Feature Cards`  [EXTRACTED]
  documentation/engineering-scope-definition.md → documentation/user-stories-and-acceptance-criteria.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Conversion Funnel Flow** — documentation_product_requirements_trial_offer_7day, documentation_product_requirements_play_store_cta, documentation_user_stories_and_acceptance_criteria_us02_cta, documentation_user_stories_and_acceptance_criteria_us07_sticky_cta [EXTRACTED 0.95]
- **Manthan Core Deliverables** — documentation_engineering_scope_definition_manthan_scope, documentation_user_stories_and_acceptance_criteria_us01_hero, documentation_user_stories_and_acceptance_criteria_us03_trial, documentation_user_stories_and_acceptance_criteria_us04_why_us, documentation_user_stories_and_acceptance_criteria_us05_how_it_works [EXTRACTED 0.95]
- **Client-Side Abstraction Architecture** — documentation_system_architecture_cta_slot_pattern, documentation_api_contracts_cta_interface, documentation_service_area_check_spec_service_area_check, documentation_service_area_check_spec_serviceable_areas [INFERRED 0.85]

## Communities (37 total, 16 thin omitted)

### Community 0 - "TypeScript Compiler Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 1 - "Project Dependencies & Metadata"
Cohesion: 0.12
Nodes (19): APP_FEATURES, AppShowcase(), FAQ(), FAQ_ITEMS, FinalCTA(), Hero(), HowItWorks(), STEPS (+11 more)

### Community 2 - "Development Dependencies & Tooling"
Cohesion: 0.20
Nodes (10): devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+2 more)

### Community 3 - "CTA Conversion & API Contracts"
Cohesion: 0.11
Nodes (18): CTA Client Interface Contract, Future Trial Signup API Contract (Draft), Development Phases 0-5, Manthan Section Ownership Scope, Environment Config & CI/CD Pipeline, A2 Cow Milk Subscription (PuretyFarm), Play Store CTA Conversion Path, 7-Day Trial Offer (+10 more)

### Community 4 - "Manthan Scope & Core User Stories"
Cohesion: 0.22
Nodes (11): handleDownloadClick(), handleTrialClick(), PLANS, Pricing(), BENEFITS, Button(), ButtonProps, ButtonSize (+3 more)

### Community 6 - "Landing Page Architecture & Routing"
Cohesion: 0.67
Nodes (3): 12-Section Landing Page Information Architecture, Component Layout & Single App Convention, US-06 Terms & Conditions Route

### Community 7 - "Core Runtime Dependencies"
Cohesion: 0.33
Nodes (5): FEATURES, WhyUs(), Card(), CardProps, paddingClasses

### Community 8 - "Package Build Scripts"
Cohesion: 0.15
Nodes (12): dependencies, next, react, react-dom, name, private, scripts, build (+4 more)

### Community 19 - "Community 19"
Cohesion: 0.40
Nodes (3): bodyFont, headingFont, metadata

### Community 21 - "Community 21"
Cohesion: 0.40
Nodes (4): Deploy on Vercel, Getting Started, Learn More, puretyfarm-customer-webapp

## Knowledge Gaps
- **85 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+80 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Development Dependencies & Tooling` to `Package Build Scripts`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `Section()` connect `Project Dependencies & Metadata` to `Manthan Scope & Core User Stories`, `Core Runtime Dependencies`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _88 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TypeScript Compiler Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Project Dependencies & Metadata` be split into smaller, more focused modules?**
  _Cohesion score 0.1164021164021164 - nodes in this community are weakly interconnected._
- **Should `CTA Conversion & API Contracts` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._