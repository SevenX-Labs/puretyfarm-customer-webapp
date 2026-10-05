import { test, expect } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

test.describe("PuretyFarm Full User Flow Smoke Test", () => {
  const screenshotsDir = path.join(process.cwd(), "tests", "screenshots");

  test.beforeAll(() => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test("landing page, auth with dev OTP, onboarding flow, account tabs and logout", async ({
    page,
  }, testInfo) => {
    const proj = testInfo.project.name;
    const saveShot = async (name: string) => {
      await page.waitForTimeout(400); // Allow any pending frame animations to settle
      await page.screenshot({
        path: path.join(screenshotsDir, `${name}-${proj}.png`),
        fullPage: false,
      });
    };

    page.on("console", (msg) => console.log(`[${proj}] PAGE LOG:`, msg.text()));
    page.on("response", async (resp) => {
      if (resp.url().includes("/api/")) {
        try {
          const text = await resp.text();
          console.log(`[${proj}] API ${resp.status()} ${resp.url()}:`, text.slice(0, 120));
        } catch {
          console.log(`[${proj}] API ${resp.status()} ${resp.url()}`);
        }
      }
    });

    // ─── 1. LANDING PAGE ───
    await page.goto("/");
    await expect(page).toHaveTitle(/PuretyFarm/i);
    await expect(page.locator("text=Why PuretyFarm").first()).toBeVisible();
    await saveShot("landing");

    // ─── 2. AUTH PAGE (Phone Step) ───
    await page.goto("/auth");
    await expect(page.locator("#phone-input")).toBeVisible();
    await saveShot("auth-phone");

    // Generate fresh unique phone number to test fresh onboarding
    const uniqueDigits = Math.floor(10000 + Math.random() * 90000);
    const testPhone = `98765${uniqueDigits}`;

    await page.locator("#phone-input").fill(testPhone);
    await page.locator("button:has-text('Send OTP')").click();

    // ─── 2B. AUTH PAGE (OTP Step) ───
    await expect(page.locator("text=Verify Your Mobile")).toBeVisible({ timeout: 10000 });
    // In dev mode with ConsoleProvider, the Autofill button appears
    const autofillBtn = page.locator("button:has-text('Autofill')");
    await expect(autofillBtn).toBeVisible({ timeout: 5000 });
    await saveShot("auth-otp");

    await autofillBtn.click();
    await page.locator("button:has-text('Verify & Continue')").click();

    // ─── 3. ONBOARDING STEP 1 (Profile) ───
    await expect(page).toHaveURL(/.*\/onboarding/, { timeout: 15000 });
    await expect(page.locator("#profileNameInput")).toBeVisible({ timeout: 10000 });
    await saveShot("onboarding-profile");

    await page.locator("#profileNameInput").fill("Anand Agrawal");
    await page.locator("#profileEmailInput").fill("anand.agrawal@puretyfarm.test");
    await page.locator("button:has-text('Continue to Delivery Location')").click();

    // ─── 4. ONBOARDING STEP 2 (Delivery Location & Serviceability) ───
    await expect(page.locator("#pincodeInput")).toBeVisible({ timeout: 10000 });

    // 4A. Non-serviceable pincode check (110001 - Delhi)
    await page.locator("#pincodeInput").fill("110001");
    await page.locator("button:has-text('Check Availability')").click();
    await expect(
      page.getByRole("heading", { name: /Haven’t Reached Your Area/i })
    ).toBeVisible({ timeout: 10000 });
    await saveShot("onboarding-location-unserviceable");

    // Reset to try serviceable address
    await page.locator("button:has-text('Try a Different Address')").click();

    // 4B. Serviceable pincode check (492007 - Shankar Nagar, Raipur)
    await expect(page.locator("#pincodeInput")).toBeVisible({ timeout: 5000 });
    await page.locator("#pincodeInput").fill("492007");
    await page.locator("#localityInput").fill("Shankar Nagar");
    await page.locator("button:has-text('Check Availability')").click();

    await expect(page.locator("#houseNoInput")).toBeVisible({ timeout: 10000 });
    await page.locator("#houseNoInput").fill("Flat 302, Green Valley Apartments");
    await page.locator("#streetInput").fill("Main VIP Road");
    await page.locator("#landmarkInput").fill("Opposite Magneto Mall");
    await saveShot("onboarding-location-serviceable");

    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/addresses") && r.request().method() === "POST"),
      page.locator("button:has-text('Save Address & Choose Milk Plan')").click(),
    ]);

    // ─── 5. ONBOARDING STEP 3 (Plan Selection) ───
    await expect(page.locator("text=Select Your Fresh Milk Plan")).toBeVisible({ timeout: 10000 });
    await saveShot("onboarding-plans");

    // Select 7-Day Starter Trial Plan
    const selectPlanBtn = page.locator("button:has-text('Start 7-Day Trial')").first();
    await selectPlanBtn.scrollIntoViewIfNeeded();
    await selectPlanBtn.click();

    // ─── 6. ACCOUNT PORTAL ───
    await expect(page).toHaveURL(/.*\/account/, { timeout: 15000 });
    await expect(page.locator("text=Raipur Cold-Chain Customer")).toBeVisible({ timeout: 10000 });

    // Profile tab
    await expect(page.getByRole("heading", { name: "Personal Information" })).toBeVisible();
    await saveShot("account-profile");

    // Orders tab
    await page.locator("button:has-text('Orders')").click();
    await expect(page.getByRole("heading", { name: "Order History" })).toBeVisible();
    await saveShot("account-orders");

    // Addresses tab
    await page.locator("button:has-text('Addresses')").click();
    await expect(page.getByRole("heading", { name: "Delivery Addresses" })).toBeVisible();
    await saveShot("account-addresses");

    // Subscription tab
    await page.locator("button:has-text('Milk Subscription')").click();
    await expect(page.getByRole("heading", { name: /Daily Milk Plan/i })).toBeVisible({ timeout: 10000 });
    await saveShot("account-subscription");

    // ─── 7. LOGOUT ───
    await page.locator("button:has-text('Log Out')").click();
    // After logout from account page, unauthenticated redirect routes to /auth
    await expect(page).toHaveURL(/.*\/auth/, { timeout: 10000 });
    await expect(page.locator("#phone-input")).toBeVisible({ timeout: 10000 });
    await saveShot("logged-out");
  });
});
