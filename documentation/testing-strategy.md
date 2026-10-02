TEST LEVELS
Level	Tooling	Coverage Target
Unit	Jest	lib/cta.ts, lib/serviceArea.ts — 100% (pure functions, no excuse to skip)
Component	React Testing Library	UI primitives (Button, Card, StickyCtaBar) and Manthan's 4 sections
E2E	Playwright	Critical path: CTA click → correct redirect; sticky bar appears/disappears correctly on scroll
Manual QA	Browser/device matrix	Full responsive pass, Lighthouse audit
UNIT TEST EXAMPLES (lib/serviceArea.ts)
typescript
describe('checkServiceArea', () => {
  it('returns serviceable true for an exact listed locality', () => {
    expect(checkServiceArea('Civil Lines').serviceable).toBe(true);
  });
  it('is case-insensitive', () => {
    expect(checkServiceArea('civil lines').serviceable).toBe(true);
  });
  it('does not partial-match', () => {
    expect(checkServiceArea('Civil').serviceable).toBe(false);
  });
  it('handles empty input', () => {
    expect(checkServiceArea('').message).toBe('Please enter your locality.');
  });
});
E2E TEST EXAMPLE (Playwright)
typescript
test('Trial CTA navigates to Play Store URL', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Start My 7-Day Trial');
  await expect(page).toHaveURL(/play\.google\.com/);
});

test('Sticky CTA bar appears after scrolling past hero', async ({ page }) => {
  await page.goto('/');
  await page.mouse.wheel(0, 1000);
  await expect(page.locator('[data-testid="sticky-cta-bar"]')).toBeVisible();
});
MANUAL QA CHECKLIST (per section, before merge to dev)
Renders correctly at 360px, 768px, 1024px, 1440px.
No horizontal scroll at any breakpoint.
All CTA buttons clickable and redirect correctly.
Lighthouse: Performance ≥ 90, Accessibility ≥ 90, SEO ≥ 95 (mobile, production build).
No console errors/warnings on load.
ACCEPTANCE CRITERIA TRACEABILITY
Every AC in user-stories-and-acceptance-criteria must map to at least one automated test (unit, component, or E2E) or an explicit manual QA checklist item — no AC should be untested.