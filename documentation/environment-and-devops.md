ENVIRONMENT VARIABLES
Variable	Purpose	Required
NEXT_PUBLIC_PLAY_STORE_URL	Target URL for both CTAs	Yes
NEXT_PUBLIC_WHATSAPP_NUMBER	WhatsApp support link (with country code)	Yes
NEXT_PUBLIC_SITE_URL	Canonical URL for SEO/OG tags	Yes

.env.example:

NEXT_PUBLIC_PLAY_STORE_URL=https://play.google.com/store/apps/details?id=REPLACE_ME
NEXT_PUBLIC_WHATSAPP_NUMBER=91XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://puretyfarm.example.com
BRANCHING STRATEGY
main — always deployable.
dev — integration branch, both push feature branches here first.
feature/hero, feature/trial-offer, feature/why-us, etc. — one branch per section.
PR required into dev with at least one reviewer (the other teammate) before merge.
CI (GitHub Actions example)
yaml
name: CI
on: [pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run build
HOSTING / DEPLOYMENT
Recommended: Vercel — connect repo, automatic preview deployment per PR, production deploy on merge to main.
Static export (next build with output: 'export') if hosting anywhere other than Vercel (e.g. Netlify, GitHub Pages) is later required.
VERSIONING
Node.js pinned via .nvmrc (Node 20 LTS).
Package manager: npm (or agree with Hitesh on pnpm/yarn before first commit — pick one, don't mix).