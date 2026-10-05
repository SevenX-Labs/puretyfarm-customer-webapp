# PuretyFarm Frontend Architecture & Engineering Guide

## 1. Architectural Overview

PuretyFarm's customer web application is built on a domain-driven, feature-sliced architecture optimized for long-term scalability, clean separation of concerns, and seamless future backend decoupling.

### Technology Stack
- **Framework:** Next.js 15 (App Router with React Server Components)
- **Runtime:** React 19
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS v4 using native `@theme` CSS tokens in [src/app/globals.css](file:///c:/Users/manthan/Desktop/dev%20projects/puretyfarm-customer-webapp/src/app/globals.css)
- **Icons:** React Icons (`react-icons/fi`)
- **Animation:** Framer Motion (`framer-motion`)
- **Testing:** Playwright E2E & Visual Regression Test Suite

---

## 2. Directory Structure & Domain Organization

```
puretyfarm-customer-webapp/
├── public/                     # Static assets (logos, illustrations, webp photos)
├── tests/                      # Playwright smoke & visual regression tests
│   ├── screenshots/            # Verified visual renders (desktop 1440px & mobile 390px)
│   └── smoke.spec.ts           # End-to-end full user journey test suite
├── src/
│   ├── app/                    # Routing, layouts, and thin Server Component wrappers
│   │   ├── (marketing)/        # Landing page route group
│   │   ├── auth/               # Thin server page wrapping <AuthView />
│   │   ├── account/            # Thin server page wrapping <AccountView />
│   │   ├── onboarding/         # Thin server page wrapping <OnboardingView />
│   │   ├── terms-and-conditions/
│   │   ├── privacy-policy/
│   │   ├── globals.css         # Tailwind v4 @theme design tokens
│   │   └── layout.tsx          # Root HTML skeleton, font loading, providers
│   ├── features/               # Domain-driven feature slices
│   │   ├── auth/               # Mobile OTP authentication & session initialization
│   │   │   ├── api/            # authApi.ts
│   │   │   ├── components/     # PhoneStep, OtpStep, OnboardingStep, AuthView
│   │   │   ├── hooks/          # useAuthFlow.ts
│   │   │   └── types.ts
│   │   ├── account/            # Customer portal (Profile, Orders, Addresses, Subscription)
│   │   │   ├── api/            # accountApi.ts
│   │   │   ├── components/     # ProfileTab, OrdersTab, AddressesTab, SubscriptionTab, Modals
│   │   │   ├── hooks/          # useAccountData.ts
│   │   │   └── types.ts
│   │   ├── onboarding/         # 3-step post-login customer onboarding
│   │   │   ├── api/            # onboardingApi.ts
│   │   │   ├── components/     # ProfileStep, LocationStep, PlanStep, OnboardingView
│   │   │   ├── hooks/          # useOnboardingFlow.ts
│   │   │   └── types.ts
│   │   ├── landing/            # High-conversion marketing landing sections
│   │   │   └── components/     # Hero, TrialOffer, Pricing, WhyUs, HowItWorks, etc.
│   │   └── plans/              # Unified plan definitions and constants
│   ├── components/             # Reusable generic UI and layout primitives
│   │   ├── layout/             # Navbar, SiteFooter, BrandLogo
│   │   └── ui/                 # Button, Skeleton, ErrorBoundary, Modal, AvatarUpload
│   ├── content/                # Single source of truth for text/copy/contact info
│   │   ├── contact.ts          # Centralized support phones, emails, and WhatsApp numbers
│   │   ├── serviceAreas.ts     # Pincodes & locality lists for Raipur serviceability
│   │   ├── faq.ts              # Canonical FAQ questions and answers
│   │   ├── navigation.ts       # Main navbar and footer links
│   │   └── testimonials.ts     # Customer quotes and reviews
│   ├── context/                # Client state contexts (AuthContext)
│   ├── lib/                    # Shared utilities and infrastructure
│   │   ├── api/                # Universal typed apiClient (timeout, JSON parsing, 401 handling)
│   │   ├── config/             # Environment variable parsing and type validation (env.ts)
│   │   ├── utils/              # cn (clsx + twMerge), formatters, validators
│   ├── server/                 # Isolated backend implementation (to be cut over)
│   │   ├── auth/               # JWT session signing (HS256) & security
│   │   ├── db/                 # store.ts, types, seeding scripts
│   │   └── geocoding/          # Mock and Google reverse geocoders
│   └── types/                  # Shared data models (User, Order, Address, Subscription)
```

---

## 3. Server & Client Component Boundaries

1. **Thin Server Component Wrappers:**
   - All `page.tsx` files (`src/app/auth/page.tsx`, `src/app/account/page.tsx`, `src/app/onboarding/page.tsx`) are thin Server Components exporting metadata and wrapping their client feature views inside `<Suspense>`.
2. **Client-Side Auth & Session Logic:**
   - All session state, user authentication, and interactive navigation checks remain strictly client-side within `AuthContext.tsx` and custom hooks (`useAuthFlow`, `useAccountData`, `useOnboardingFlow`).
3. **Dev-Mode OTP Autofill:**
   - The dev OTP autofill hint is gated to non-production environments (`process.env.NODE_ENV !== "production"`).
4. **Server Isolation:**
   - Modules in `src/server/` import `"server-only"`, guaranteeing that no server-only logic or database stores can be accidentally imported by client components.

---

## 4. Design Tokens & Styling (Tailwind v4)

Tailwind CSS v4 is used with tokens defined via `@theme` directly in [src/app/globals.css](file:///c:/Users/manthan/Desktop/dev%20projects/puretyfarm-customer-webapp/src/app/globals.css).
Key design tokens include:
- `--color-brand-maroon: #5C1B13` (and variants `--color-brand-maroon-dark: #40110D`, `--color-brand-maroon-light: #8B2B20`)
- `--color-brand-gold: #F5E729`
- `--color-brand-cream: #FAF3EA` (and background tint `--color-brand-cream-bg: #FFFDF7`)
- `--color-brand-brown: #3A241C`
- `--color-brand-dark: #1A1008`
- `--font-serif: var(--font-playfair)`
- `--font-sans: var(--font-outfit)`

Arbitrary inline hex values in layouts are aligned to these token classes.

---

## 5. Backend Decoupling & Cutover Plan

The frontend is fully prepared for an external backend repository cutover.

### Step 1: External Backend Readiness
The backend repository is deployed and verifies 100% compliance with the HTTP endpoints, payload structures, session cookies, and JWT signing specifications detailed in [BACKEND_CONTRACT.md](file:///c:/Users/manthan/Desktop/dev%20projects/puretyfarm-customer-webapp/BACKEND_CONTRACT.md).

### Step 2: Set Environment Variable
Configure the target backend URL in the production environment:
```env
BACKEND_URL=https://api.puretyfarm.com
```

### Step 3: Remove In-Repo Server Code
Execute a single deletion of the in-repo mock server and API routes:
```bash
git rm -r src/app/api src/server
git commit -m "chore(cutover): remove in-repo api and server mock"
```

### Step 4: Proxy Handover
In [next.config.ts](file:///c:/Users/manthan/Desktop/dev%20projects/puretyfarm-customer-webapp/next.config.ts), the default array rewrites (`afterFiles`) take effect:
```typescript
async rewrites() {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return [];
  return [
    {
      source: "/api/:path*",
      destination: `${backendUrl}/api/:path*`,
    },
  ];
}
```
Because the in-repo `/api` routes no longer exist, Next.js proxies all `/api/*` requests directly to `BACKEND_URL`. Client code requires zero modifications.

---

## 6. Route Aliases & Redirects

To prevent broken links from external campaigns or legacy bookmarks, permanent redirects (`308`) are configured in [next.config.ts](file:///c:/Users/manthan/Desktop/dev%20projects/puretyfarm-customer-webapp/next.config.ts):
- `/terms` → `/terms-and-conditions`
- `/privacy` → `/privacy-policy`
