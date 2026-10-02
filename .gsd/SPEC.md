# PuretyFarm Milk Delivery Website Redesign

**Status: FINALIZED**

## Objective

Redesign the Home page for PuretyFarm (single-page conversion architecture with Home, Service Area, Privacy, and Terms), preserving its existing identity as a milk delivery business. Build trust with content grounded in the repository or explicitly marked placeholders, and make it easy to contact or order by WhatsApp or phone. This is not a produce store.

## Goals

- Deliver a premium, natural, mobile-first, responsive design.
- Reuse the existing font setup and contact configuration.
- Keep a clear conversion action: WhatsApp or phone contact/order.
- Use Framer Motion through `LazyMotion` and `m` for lightweight motion.
- Respect `prefers-reduced-motion`; content must be available without waiting for animation.
- Preserve existing image assets. Use a placeholder only when no suitable existing image is available.

## Scope

### Pages and current content to keep

- **Home:** Keep the PuretyFarm milk-delivery identity; current A2 / Gir milk wording; current delivery-time and locality coverage wording; existing trial/subscription information and How It Works wording where retained; app / Play Store reference; and existing WhatsApp, phone, and email contact options. Factual wording must remain verbatim from existing repo copy. Preserve existing privacy, terms, service-area, and empty-state links where appropriate. Single-page conversion architecture retained; standalone `/about` and `/contact` pages are dropped by user decision.

### Factual copy and claims

- Any factual claim shown on the scoped pages must either be copied verbatim from existing repository copy or be visibly marked `[PLACEHOLDER: ...]` pending user confirmation.
- Do not write, infer, strengthen, paraphrase, or introduce quality, purity, health, certification, review, sourcing, process, delivery, customer-count, or other factual claims.
- Keep existing claims only as verbatim source text; their presence in the repo does not establish that they are verified. Flag them for user verification rather than presenting them as independently confirmed.
- Headings and descriptive text may be newly written only when they make no factual assertion.

### Layout scope recommendation

Use an App Router route group, `src/app/(marketing)/`, for Home, with its own layout containing the redesigned header and footer. Route groups organize routes without adding a URL segment, so the public path remains `/`. This keeps the new navigation and footer limited to the Home page and reduces the risk of changing existing legal, service-area, empty-state, or not-found experiences. Preserve the root layout for global fonts, metadata, structured data, and other current shared behavior.

Move the existing Home page into the route group with `git mv` and verify there is exactly one page route resolving to `/`. Inspect the root layout and ensure it does not render a header or footer of its own; the marketing route-group layout owns those elements. Include footer links to `/privacy`, `/terms`, and `/service-area`.

Keep marketing styles scoped to a wrapper class/data attribute or CSS Modules. Do not add or change global `:root` rules or bare-element selectors for this redesign.

Redesign the Home page with a full-bleed hero, alternating image/text sections, and card grids with generous whitespace. Add a sticky header that condenses on scroll and a smooth mobile-menu transition. Ensure the layout is accessible and works on mobile, tablet, and desktop.

### Animation and image performance

- Use Framer Motion `LazyMotion` and `m` components.
- The hero image must be priority-loaded, preserve its intrinsic dimensions/aspect ratio, and never start at `opacity: 0`.
- Hero text entrance must not depend on client JavaScript and may animate **transform only**. Do not animate opacity in CSS keyframes, Framer Motion, or any other mechanism; server-rendered hero text must never have `opacity: 0`.
- Use scroll reveals only for below-the-fold content: fade plus 20px translate with staggered children. Do not make content depend on animation before it can be read.
- Add subtle hero-image parallax, card hover lift, and animated underline on navigation links.
- Parallax may animate transforms only; reserve image layout space before load and ensure it causes no cumulative layout shift (CLS). Disable parallax when reduced motion is requested.
- Motion must not delay content or materially degrade Lighthouse performance.

### Motion dependency compatibility check

Repository package versions checked for this draft: Next.js `16.3.6`, React `19.2.8`, React DOM `19.2.8`, and Framer Motion `13.5.0`. The installed Framer Motion package declares React and React DOM peer support `^18.0.0 || ^19.0.0`; its installed type declarations expose `LazyMotion` and `m`. The installed Next.js package accepts React / React DOM `^18.2.0 || ^19.0.0`. These declared peer ranges are compatible with the installed React 19 versions. Recheck the resolved versions if dependencies change before implementation.

## Existing routes, APIs, and features to preserve

Current App Router pages found in `src/app`:

- `/` — Home (in scope; located under `(marketing)` with public URL `/`)
- `/service-area` — delivery coverage page
- `/privacy` — privacy policy
- `/terms` — terms and conditions
- `/empty-state` — locality empty state
- Custom not-found route — `not-found.tsx`
- (Standalone `/about` and `/contact` routes are DROPPED by user decision in favor of the single-page conversion architecture).

No API route handlers or `src/app/api` routes were found in the current `src/app` inventory. Do not add APIs for this work.

Preserve existing out-of-scope functionality and presentation, including:

- Service-area lookup and locality data (`src/lib/serviceArea.ts`, `src/data/serviceableAreas.ts`).
- Privacy and terms content and their contact links.
- Empty-state and custom not-found experiences.
- Root layout fonts, global metadata/OpenGraph, structured data, favicon and manifest references, and environment/contact configuration.
- Existing app / Play Store links and configured phone, WhatsApp, email, and site URL values.
- Existing image files and assets; do not delete or overwrite them.

## Images and placeholder convention

- Preserve the existing files in `public/` and reuse a suitable existing image for each scoped section where available. Do not replace a suitable existing image with placeholder imagery.
- Only use placeholder imagery when no suitable existing asset exists. Put new placeholders under `public/images/placeholders/`, use filenames that include `placeholder`, and use alt text beginning `Placeholder image:`. Never present placeholder imagery as an actual PuretyFarm farm, product, facility, or customer.
- Every temporary factual text value must appear with a literal marker in this form: `[PLACEHOLDER: describe the missing verified content]`.
- Before completion, search scoped page/component content for `[PLACEHOLDER:` and placeholder asset paths. Report each remaining marker and location. Replace a marker only when the user supplies or confirms its content.
- Final content checklist: confirm every factual claim is either verbatim existing repository copy or visibly marked placeholder; identify retained claims that need user verification; confirm no unsupported testimonial, certification, award, customer count, guarantee, health, purity, sourcing, or process claim has been introduced; report any remaining text/image placeholders; confirm no existing image assets were removed or overwritten.

## Proposed file tree

Names reflect the actual Milestone 2 components in the codebase and scoped additions. This tree shows the intended scoped additions/changes and the existing routes/assets to preserve; it is not permission to remove existing files.

```text
src/
  app/
    (marketing)/
      layout.tsx                      # Home layout with header and footer
      marketing.css                   # Scoped styling only; no global selectors
      page.tsx                        # Redesigned Home; URL stays /
    layout.tsx                        # Preserve root fonts, metadata, structured data
    globals.css                       # Preserve existing global styles
    service-area/page.tsx             # Preserve existing route and behavior
    privacy/page.tsx                  # Preserve existing route and behavior
    terms/page.tsx                    # Preserve existing route and behavior
    empty-state/page.tsx              # Preserve existing route and behavior
    not-found.tsx                     # Preserve existing not-found experience
  components/
    layout/
      SiteHeader.tsx                  # Sticky, condensing header, mobile menu, and /service-area link
      SiteFooter.tsx                  # Footer for marketing route group only
      MarketingMotion.tsx             # LazyMotion features loader
      MarketingShell.module.css       # Scoped layout styles
    sections/
      Hero.tsx                        # Full-bleed milk-delivery hero using existing image asset
      HeroBottle3D.tsx                # Hero bottle 3D presentation
      WhyUs.tsx                       # Creative bento grid redesign; verbatim copy
      HowItWorks.tsx                  # Vertical stepper timeline; verbatim copy
      TrialOffer.tsx                  # Trial offer conversion section
      Pricing.tsx                     # Pricing comparison cards; verbatim data
      ServiceAreaChecker.tsx          # Locality delivery check section
      SocialProof.tsx                 # Trust signals and customer reviews
      AppShowcase.tsx                 # Mobile app download showcase
      FaqCtaFooter.tsx                # FAQ accordion and final conversion CTA
    ui/
      BrandLogo.tsx                   # Server component for brand mark; callers pass size or condensed state
      Button.tsx                      # Primary and secondary button primitives
      Card.tsx                        # Styled card container primitive
      MarqueeTicker.tsx               # Announcement/trust ticker
      Navbar.tsx                      # Secondary navbar for /service-area and /empty-state
      Reveal.tsx                      # Below-fold reveal using LazyMotion/m
      ScrollProgress.tsx              # Reading progress bar
      Section.tsx                     # Semantic section wrapper with container bounds
      StickyCtaBar.tsx                # Mobile sticky CTA bar
      ThreeBackgroundCanvas.tsx       # Ambient background canvas
      TiltCard.tsx                    # Interactive card hover primitive
  config/
    env.ts                            # Preserve current contact configuration
  data/
    serviceableAreas.ts               # Preserve existing locality data
  lib/
    animations.ts                     # Shared animation helpers; created in Foundation
    cta.ts                            # Preserve existing contact URL helpers
    serviceArea.ts                    # Preserve existing lookup logic
public/
  (existing image assets, logos, icons, manifest remain in place)
  images/
    placeholders/                     # Add only when a suitable existing image is absent
```

## Milestone order

1. **Foundation [COMPLETED]:** Established design tokens and `(marketing)` route-group layout (`src/app/(marketing)/layout.tsx`); preserved root layout, fonts, and contact config; implemented `Reveal.tsx` and animation helpers using `LazyMotion`/`m`, reduced-motion handling, transform-only hero text entrance, and image layout/performance rules.
2. **Home [COMPLETED]:** Redesigned the Home page and sections (`Hero.tsx`, `WhyUs.tsx`, `HowItWorks.tsx`, `TrialOffer.tsx`, `Pricing.tsx`, `ServiceAreaChecker.tsx`, `SocialProof.tsx`, `AppShowcase.tsx`), retaining factual copy verbatim. Built priority-loaded hero bottle and WhatsApp/phone conversion actions.
3. **About and Contact [DROPPED BY USER DECISION]:** Dropped by user decision in favor of the single-page conversion architecture. The current site embeds farm heritage/practices directly into the Home page's Why Us section (Pillar 1: Sacred Gir Heritage, Ahimsa care, organic diet, calves drink first) and handles contact via direct WhatsApp consultation links (`getWhatsAppUrl()`), click-to-call phone links (`tel:`), FAQ accordions, and the footer. Header navigation currently links only to in-page section anchors (`/#why-puretyfarm`, `/#how-it-works`, `/#trial-offer`, `/#pricing`, `/#faq`) and `/service-area`. Header nav must not link to missing pages.
4. **Review [IN PROGRESS]:** Re-opened under the follow-up Design Refinements phase below. All production build checks pass; Lighthouse audits to be conducted upon completion of design refinement items.

## Git handling

- Stage only the exact files changed for the approved work, naming each path explicitly in `git add` commands.
- Never use `git add -A` or `git commit -a`.
- Leave all pre-existing unrelated user changes unstaged and uncommitted.

## Acceptance criteria

- PuretyFarm remains the existing milk delivery business.
- The redesigned header/footer appear on `/` (and marketing route group); standalone `/about` and `/contact` routes are DROPPED by user decision (single-page architecture) and excluded from review; existing route URLs (`/service-area`, `/privacy`, `/terms`, `/empty-state`) remain unchanged.
- Home is moved with `git mv`, exactly one route resolves to `/`, the root layout has no header/footer of its own, and the marketing footer links to `/privacy`, `/terms`, and `/service-area`.
- Marketing CSS is isolated under a wrapper class/data attribute or CSS Modules; no redesign styles use `:root` or bare-element selectors.
- Standalone `/about` and `/contact` routes dropped by user decision; metadata is verified for active routes (`/`, `/service-area`, `/privacy`, `/terms`).
- Out-of-scope routes, APIs, features, global root behavior, and existing image files are preserved.
- Contact conversion uses a WhatsApp prefilled-message link and a phone link; a map is withheld until the user provides the real address.
- The hero image is priority-loaded, has reserved layout dimensions, and never starts at zero opacity. Hero text entrance works without client JavaScript, animates transform only, and never has server-rendered zero opacity. Scroll reveals are below the fold only.
- The header includes a `/service-area` link.
- `LazyMotion/m` are used; reduced motion is respected; hero parallax uses transforms and causes no CLS.
- Images use `next/image` where applicable and have appropriate alternative text.
- Factual copy meets the verbatim-source-or-visible-placeholder rule. Placeholder checklist and user-verification notes are reported.
- Lighthouse is measured on `next build` + `next start` using the mobile profile, with three runs per scoped page and median scores reported.
- Work pauses for user review immediately after Foundation and again immediately after Home.
- Git staging names only changed paths explicitly; unrelated pre-existing changes remain unstaged and uncommitted.

## Review gate

Base specification milestones (Milestone 1: Foundation and Milestone 2: Home) are complete. Milestone 3 (About and Contact) has been dropped by user decision in favor of the single-page conversion architecture. Milestone 4 (Review) is active under the follow-up Design Refinements specification below, which proceeds through four staged review gates (Gates 1–4). Implementation code for Design Refinements begins once this draft is approved as FINALIZED.

## Design refinements

**Status: FINALIZED**

This follow-up design pass refines the PuretyFarm milk delivery website. All existing spec rules remain active: milk delivery business identity, verbatim copy from repo or explicit `[PLACEHOLDER: ...]` markers, preserve existing routes/assets, scoped marketing CSS, Framer Motion `LazyMotion`/`m`, `prefers-reduced-motion` support, no `opacity: 0` above the fold, explicit-path git staging, and never `git add -A` or `git commit -a`.

### Item 1: Navbar Logo Visibility
- **Diagnosis requirement:** Inspect both header states (top expanded and condensed on scroll) and the mobile slide-out menu. Diagnose root cause of logo invisibility (e.g., dark logo on dark or transparent header, wrong `next/image` sizing, SVG without dimensions, lost contrast when the header condenses).
- **Remediation & Shared Component Proposal:**
  - Propose one shared `BrandLogo` component (`src/components/ui/BrandLogo.tsx`) used across all five header implementations:
    1. `SiteHeader.tsx` (Home `/`)
    2. `Navbar.tsx` (`/service-area` and `/empty-state`)
    3. `privacy/page.tsx`
    4. `terms/page.tsx`
    5. `not-found.tsx`
  - `BrandLogo` is a React Server Component (no `'use client'`); callers pass `size` (e.g. `'sm' | 'md' | 'lg'` or numeric dimensions) or `condensed` state. It encapsulates the maroon `#5C1B13` border ring, image sizing, accessible alt text, brand typography, and minimum 44×44px tap target.
  - **Explicit approved exception:** An explicit exception to "preserve out-of-scope pages" is granted strictly limited to updating the logo markup on `privacy/page.tsx`, `terms/page.tsx`, `not-found.tsx`, `service-area/page.tsx`, and `empty-state/page.tsx` to use the shared `BrandLogo` component. All other content, styling, and behavior on these pages remain completely untouched.
- **Constraints, vector status & allowance:**
  - **Vector / High-res status:** No original vector (SVG) or high-res logo file exists in the repository (the only existing files are 1024×1024 raster `logo.webp` and 384×384 raster `logo-mark.webp`). If the user provides a vector or clean high-res asset, use it. Do NOT cut a transparent derivative from the 384px raster without showing the user the result first.
  - Allow a transparent derivative (upon showing the user the result first) OR a styled background chip container (e.g., high-contrast bordered chip) to guarantee crisp contrast and legibility across all header states.
  - **Logo Chip Ring:** The logo chip ring/border must be maroon (`#5C1B13`).
    - Measured contrast: Maroon `#5C1B13` border against `#FFFDF7` cream is **12.73:1** (exceeds WCAG AAA).
    - Measured contrast: Maroon `#5C1B13` border against internal `#FDEE57`/`#F5E729` yellow fill is **10.08:1** (exceeds WCAG AAA).
  - No new or redesigned mark. The cow and calf brand mark geometry must remain verbatim from the existing logo asset.
  - **Alt text:** Confirmed alt text uses `alt="PuretyFarm Logo"` verbatim from existing repository copy (`Navbar.tsx:77`, `terms/page.tsx:23`, `privacy/page.tsx:23`, `not-found.tsx:21`).
  - Ensure a minimum tap and visible touch target size (minimum 44×44px clickable target).

### Item 2: Favicon Set Regeneration
- **Icon declarations inventory & single source of truth:**
  - `src/app/layout.tsx`: `metadata.icons` declares `/favicon.svg`, `/favicon.ico`, `/logo-mark.webp` (192×192), and apple icon `/logo-mark.webp` (180×180). Currently duplicates manual `<link>` tags in `<head>` (lines 182–184).
  - `public/manifest.json`: Declares `/logo-mark.webp` with `"sizes": "380x380"` (size mismatch against actual 384×384 file) and `/logo.webp` (1024×1024). Missing 192×192, 512×512, and maskable icons.
  - Static files in `public/`: `favicon.ico`, `favicon.svg` (currently an inconsistent milk bottle graphic differing from the logo mark).
  - **Approved exception:** Explicit approval granted to edit icon declarations in `src/app/layout.tsx` and `public/manifest.json`. Consolidate to Next.js App Router metadata API as the single source of truth; eliminate duplicate hardcoded `<link>` tags in `src/app/layout.tsx`.
- **Assets to generate:** Regenerate standard favicon set from the existing logo mark (or user-provided vector/high-res source):
  - App icon: `src/app/icon.png` (or SVG/PNG in `src/app/`)
  - Apple touch icon: `src/app/apple-icon.png` (180×180)
  - Web App Manifest icons: `/icon-192.png`, `/icon-512.png`. Note: The 512px icon (`/icon-512.png` and manifest 512 entry) must be sourced from `public/logo.webp` (1024×1024) or the user's original master file, NOT by upscaling the 384px raster file.
  - Maskable icons: Separate entry in `public/manifest.json` with `"purpose": "maskable"` and safe padding.
  - Fix the 380 vs 384 size mismatch in `manifest.json`.
- **Scope exception:** Approved exception to "preserve favicon references": update the underlying icon asset files while keeping the existing reference paths functional.
- **Legibility check & production verification:** Verify legibility at 16×16 and 32×32. Simplify to the clean circular brand mark only if the full logotype is unreadable at micro sizes. Verify the rendered `<head>` on the production build (`npm run build` + inspect output).

### Item 3: Why Us Section Creative Redesign
- **Design direction:** Editorial, premium-natural. Bento grid with mixed card sizes, large numerals or oversized editorial typography, soft layered surfaces (`#FFFDF7`, `#FAF3EA`, `#FAF6F0`), and subtle hover depth.
- **Single Accent Color Token & Measured Contrast Rules:**
  - Exactly ONE accent value named: **`#F5E729` (PuretyFarm Golden Saffron)**.
  - **Fills Only:** Accent `#F5E729` is strictly for background fills (badges, pill highlights), with maroon (`#5C1B13`) content on top.
    - Measured contrast for `#F5E729`: Maroon `#5C1B13` content on `#F5E729` fill is **9.89:1** (WCAG AAA compliant). Dark text `#1A1008` on `#F5E729` fill is **14.35:1** (WCAG AAA compliant). On cream `#FFFDF7`, `#F5E729` measures **1.27:1** (FAILS contrast; strictly prohibited as text, borders, or numerals on light backgrounds).
    - Measured contrast for `#FDEE57` (reference logo yellow): Maroon `#5C1B13` content on `#FDEE57` fill is **10.66:1** (WCAG AAA compliant). Dark text `#1A1008` on `#FDEE57` fill is **15.46:1** (WCAG AAA compliant). On cream `#FFFDF7`, `#FDEE57` measures **1.18:1** (FAILS contrast; strictly prohibited as text, borders, or numerals on light backgrounds).
  - **Text and Small Icons:** Must use **`#5C1B13` ONLY**.
  - **Borders and Numerals on Cream:** Must use maroon (`#5C1B13`, measured **12.73:1** on `#FFFDF7`) or darker amber (`#B45309`, measured **4.94:1** on `#FFFDF7`, WCAG AA).
  - **Yellow Numerals:** Allowed **ONLY on dark surfaces** (e.g., yellow `#F5E729` on maroon `#5C1B13` background, measured **9.89:1**, WCAG AAA; `#FDEE57` on maroon `#5C1B13` background, measured **10.66:1**, WCAG AAA).
- **Copy constraints & Gate 2 Claims Rules:**
  - Keep every claim verbatim from existing repository copy. No new quality, purity, health, certification, or sourcing claims. Headings may be newly written only if they make no factual assertions.
  - **Gate 2 claims needing owner verification & documentation criteria:**
    1. *"Organic" claims:* Claims of "organic" (e.g., "organic herbal diet", "organic pastures") need formal certification documentation (e.g., NPOP / Jaivik Bharat). Unverified organic claims become `[PLACEHOLDER: organic certification body or verified diet]` or owner-supplied wording only. Speculative rewordings are prohibited.
    2. *"100%" figures:* Figures like "100% Gir Genetics", "100% Pure A2", and "100% Natural" need an empirical/scientific basis (e.g., breed registry documentation, DNA testing, certified lab assay); without a verified basis, they cannot be asserted or enlarged as proven facts.
    3. *Solar-energy / Surya Ketu Nadi claim:* The claim that cow humps synthesize solar energy / Surya Ketu Nadi energy **must NOT be enlarged or featured** in the redesign.
    4. *Ahimsa & calf priority:* Statements like "Ahimsa Sacred Gaushala" and "calves drink first" must have owner confirmation; unconfirmed details become `[PLACEHOLDER: ...]`.
  - **Owner confirmation rule:** Owner confirmation alone does NOT clear organic certifications, 100% scientific claims, or solar energy claims. Formal certification documentation or owner-supplied wording is strictly required. Anything unverified becomes `[PLACEHOLDER: ...]` before enlarging in the editorial bento design.
- **Motion constraints:** Below-the-fold reveals via `Reveal.tsx` only (no ad-hoc reveal mechanisms). Subtle hover lift allowed. Respect reduced motion.

### Item 4: Systematic Icon Replacement
- **Audit & Removal:** Audit scoped marketing pages and remove every AI-looking icon, emoji used as an icon, and generic inline placeholder icon across the scoped pages.
- **Standardization:** Install and use `react-icons`. Single icon family: **Lucide (`react-icons/lu`)** exclusively; never mix icon families.
- **Bundle hygiene:** Use named imports only to prevent bundling unused icons.
- **Accessibility & Tracking:** Provide a complete audit table listing every swapped icon (`File`, `Old Icon / Emoji`, `New react-icons Component`). Decorative icons must have `aria-hidden="true"`; interactive or meaningful icons must have accessible labels.

### Item 5: How It Works: Horizontal to Vertical
- **Layout overhaul:** Convert from horizontal cards to a vertical timeline/stepper.
  - Mobile: Continuous connecting line running down the left side with numbered step nodes and adjacent content cards.
  - Desktop: Alternating left/right timeline cards along a central vertical spine with numbered step nodes.
- **Progressive enhancement:** Optional scroll-driven progress line drawing using `scaleY` transform only (with `prefers-reduced-motion` fallback to a static line).
- **Copy & Accessibility:** Keep step text 100% verbatim from existing copy. Must be an ordered list (`<ol>` with `<li>` elements) in the DOM for accessibility.

### Item 6: Pricing Section Presentation Redesign
- **Presentation update:** Redesign visual hierarchy and layout presentation without altering business data.
- **Strict constraints:** Do not change plans, prices, units, or inclusions. Do not add discounts, "best value" badges, or savings claims unless already present in existing repo copy.
- **Design direction:** Clean comparison cards with clear price hierarchy (large price numeral, small unit/cadence label), consistent card heights, visual distinction only if a plan is already marked as featured in the data, always-visible WhatsApp or phone CTA per card.
- **Mobile responsiveness:** Flawless stacking on 360px viewports with zero horizontal scrolling. Original layout inspired by clean modern subscription pricing cards.

### Acceptance & Verification Protocol
- Layouts verified on 360px, 768px, and 1280px browser viewports.
- Keyboard navigation and visible focus rings verified; contrast ratio meets WCAG AA standards; `prefers-reduced-motion` strictly honored.
- Production build (`npm run build`) succeeds cleanly without warnings.
- Mobile Lighthouse audit (3 runs on production server, reporting median score) targeting 90+ for Performance, Accessibility, and SEO.
- Full reporting of any `[PLACEHOLDER: ...]` markers added and any retained claims requiring user verification.

### Staged Review Gates
- **Review Gate 1:** Items 1 & 2 (Navbar Logo Visibility & Favicon Set) completed — **PAUSE for user review**.
- **Review Gate 2:** Item 3 (Why Us Section Creative Redesign) with Claims Needing Owner Verification report — **PAUSE for user review**.
- **Review Gate 3:** Items 4 & 5 (Systematic Icon Replacement & How It Works Vertical Stepper) completed — **PAUSE for user review**.
- **Review Gate 4:** Item 6 (Pricing Section Presentation Redesign) completed — **PAUSE for user review**.



