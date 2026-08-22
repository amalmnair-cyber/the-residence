import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("homepage has no automated accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test("guest can submit a booking request", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Book Now" }).first().click();

  // Jump a month ahead so the visible grid is never "today" or partly in
  // the past, regardless of what day this test happens to run on.
  await page.getByRole("button", { name: "Next month" }).click();
  await page.getByRole("button", { name: "10", exact: true }).click();
  await page.getByRole("button", { name: "15", exact: true }).click();

  await page.getByLabel("Full Name").fill("Playwright Test Guest");
  await page.getByLabel("Email").fill("playwright-test@example.com");
  await page.getByLabel("Phone").fill("+44 7700 900222");
  await page.getByLabel("Country").selectOption("United Kingdom");

  await page.getByRole("button", { name: "Request to Book" }).click();

  // Generous timeout: submitBooking chains three real network calls
  // (rate-limit check, DB insert, Resend email) sequentially, plus dev
  // mode compiles the Server Action on first invocation.
  await expect(page.getByText(/Request received, Playwright\./)).toBeVisible({
    timeout: 15_000,
  });
});
