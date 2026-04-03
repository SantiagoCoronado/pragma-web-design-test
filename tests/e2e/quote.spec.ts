/**
 * E2E: Quote lifecycle — create → shareable link → PDF download
 *
 * Prerequisites:
 *   - Dev server running (or started automatically by playwright.config.ts)
 *   - ADMIN_PASSWORD_HASH set in .env.local
 *   - Dev database accessible (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN)
 *
 * Run: npx playwright test
 */

import { test, expect } from "@playwright/test";

const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "changeme";
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("Quote lifecycle", () => {
  test.beforeEach(async ({ page }) => {
    // Log in to admin
    await page.goto(`${BASE_URL}/en/admin`);
    await page.getByPlaceholder("Password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/admin/);
  });

  test("create a line-items quote and view the public link", async ({ page }) => {
    // Navigate to new quote form
    await page.getByRole("link", { name: /new quote/i }).click();
    await expect(page).toHaveURL(/\/admin\/quotes\/new/);

    // Fill in client info
    await page.getByLabel(/client name/i).fill("E2E Test Client");
    await page.getByLabel(/client email/i).fill("e2e@test.com");
    await page.getByLabel(/company/i).fill("E2E Corp");

    // Fill in quote details
    await page.getByLabel(/quote title/i).fill("E2E Test Quote");

    // Add a line item (first one is pre-populated)
    const descInputs = page.locator("input[placeholder='Description...']");
    await descInputs.first().fill("E2E Service");

    // Save as draft
    await page.getByRole("button", { name: /save as draft/i }).click();

    // Should redirect back to admin dashboard
    await expect(page).toHaveURL(/\/admin/);

    // The new quote should appear in the list
    await expect(page.getByText("E2E Test Quote")).toBeVisible();
  });

  test("view quote public page via shareable link", async ({ page, context }) => {
    // Create a quote first via the API seed (or assume one exists from previous test)
    // For isolation, use the dev seed endpoint
    const seedRes = await page.request.get(`${BASE_URL}/api/dev/seed`);
    expect(seedRes.ok()).toBeTruthy();
    const { quotes } = await seedRes.json();
    expect(quotes.length).toBeGreaterThan(0);

    const firstQuote = quotes[0];

    // Open the public quote view
    const quotePage = await context.newPage();
    await quotePage.goto(`${BASE_URL}${firstQuote.viewUrl}`);

    // Quote page should load with the quote title
    await expect(quotePage.getByRole("heading", { level: 1 })).toBeVisible();

    // Should show the Download PDF button
    await expect(quotePage.getByRole("link", { name: /download pdf/i })).toBeVisible();
  });

  test("PDF download returns a PDF file", async ({ page }) => {
    // Seed to get a quote id
    const seedRes = await page.request.get(`${BASE_URL}/api/dev/seed`);
    expect(seedRes.ok()).toBeTruthy();
    const { quotes } = await seedRes.json();
    const quoteId = quotes[0].id;

    // Fetch the PDF endpoint directly
    const pdfRes = await page.request.get(`${BASE_URL}/api/quote/${quoteId}/pdf`);
    expect(pdfRes.ok()).toBeTruthy();
    expect(pdfRes.headers()["content-type"]).toBe("application/pdf");

    const body = await pdfRes.body();
    // PDF files start with the %PDF magic bytes
    expect(body.slice(0, 4).toString()).toBe("%PDF");
  });

  test("public quote page is not indexed by search engines", async ({ page }) => {
    const seedRes = await page.request.get(`${BASE_URL}/api/dev/seed`);
    const { quotes } = await seedRes.json();
    await page.goto(`${BASE_URL}${quotes[0].viewUrl}`);

    const robots = await page.$eval(
      'meta[name="robots"]',
      (el) => el.getAttribute("content")
    );
    expect(robots).toContain("noindex");
  });
});
