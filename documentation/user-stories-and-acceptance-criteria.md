SCOPE: Manthan-owned sections + shared/global behaviors that affect the whole page.

US-01: Hero visibility
As a mobile visitor, I want to see the offer and both CTAs immediately on landing, so that I don't have to scroll to decide.
AC:

GIVEN a viewport width of 360px–430px, WHEN the page loads, THEN headline, subheadline, trust line, and both CTA buttons are fully visible without scrolling.
GIVEN the hero renders, THEN "Start 7-Day Trial" is visually dominant (solid maroon) and "Download App" is visually secondary (outlined).

US-02: CTA click behavior
As a visitor, I want clicking either CTA to take me to the app immediately, so that I can act without friction.
AC:

GIVEN either CTA is clicked, WHEN no backend is wired, THEN the click handler calls a named function (handleTrialClick / handleDownloadClick) that navigates to the configured Play Store URL.
GIVEN the Play Store URL changes, WHEN a developer updates it, THEN only one config value changes — no component code changes.
GIVEN a CTA is rendered, THEN it is never disabled or non-interactive, regardless of backend readiness.

US-03: 7-Day Trial offer clarity
As a visitor, I want to understand what the trial includes, so that I can decide to start it.
AC:

GIVEN the trial section renders, THEN exactly 4 benefit bullets are shown, each one line, non-truncated on mobile.
GIVEN the section renders, THEN a CTA button is present at the bottom of the section, not only in the hero.

US-04: Why PuretyFarm feature cards
As a visitor, I want to see why this brand is trustworthy, so that I feel confident starting a trial.
AC:

GIVEN the section renders, THEN between 4 and 6 cards are shown, each with an icon, a title (≤ 4 words), and a description (≤ 15 words).
GIVEN viewport < 640px, THEN cards stack in a single column; GIVEN viewport ≥ 1024px, THEN cards display in a 3-column grid.

US-05: How It Works clarity
As a visitor, I want a simple step-by-step explanation, so that I understand the process before committing.
AC:

GIVEN the section renders, THEN exactly 5 numbered steps are shown in order, each with a short title and one-line description.
GIVEN mobile viewport, THEN steps stack vertically with visible step numbers.

US-06: Terms & Conditions access
As a visitor, I want to read the terms before subscribing, so that I know what I'm agreeing to.
AC:

GIVEN the footer renders, THEN a "Terms & Conditions" link is present and routes to /terms (separate route, not a page section).
GIVEN /terms has no content yet, THEN it renders a placeholder state, not a 404 or broken page.

US-07: Sticky mobile CTA bar
As a mobile visitor, I want the CTA always reachable, so that I can convert at any scroll position.
AC:

GIVEN viewport < 768px, WHEN the user scrolls past the hero, THEN a sticky bottom bar appears with both CTAs.
GIVEN the sticky bar is visible, THEN it does not overlap or block other interactive elements (e.g., FAQ accordion toggles).