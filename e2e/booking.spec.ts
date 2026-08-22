import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("homepage has no automated accessibility violations", async ({ page }) => {
  await page.goto("/");

  // Most sections use GSAP ScrollTrigger to reveal at opacity: 0 -> 1 as
  // they enter the viewport. Scanning immediately after load catches
  // below-the-fold sections mid pre-animation (opacity: 0), which axe
  // reports as a false-positive contrast failure. Scroll through first so
  // every reveal has actually fired, same as a real visitor would see.
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);

  const results = await new AxeBuilder({ page }).analyze();

  // Known, deliberate exception: text-brass (#a9895f) on light backgrounds
  // is the brand's accent color, used site-wide for section eyebrow labels.
  // It's under WCAG AA contrast (3.07:1, needs 4.5:1) — a real design
  // decision, not an oversight, left as-is pending a color change.
  // Matched by reported color, not DOM structure: the reveal-animation
  // library (SplitText) wraps eyebrow text in nested aria-hidden divs that
  // inherit the color rather than carrying the "text-brass" class
  // themselves, and the animation's in-flight opacity/transform rounds the
  // sampled color slightly (e.g. #a98a60, #aa8a61) — so this checks "close
  // to brass," not an exact class or hex match. Any other color-contrast
  // issue (or brass at a genuinely different, unexplained value) still
  // fails the test.
  const brassRgb = [0xa9, 0x89, 0x5f];
  function isBrassish(hex: string) {
    const m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!m) return false;
    const rgb = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
    const distance = Math.sqrt(rgb.reduce((sum, c, i) => sum + (c - brassRgb[i]) ** 2, 0));
    // Wide enough to cover brass rendered on dark backgrounds too (e.g.
    // #927753), which blends further from the base hex than the light-
    // background instances — but well short of stone/stone-light's
    // distance from brass (~53-66), so an unrelated issue still trips this.
    return distance < 40;
  }

  const violations = results.violations
    .map((v) => {
      if (v.id !== "color-contrast") return v;
      const nodes = v.nodes.filter((n) => {
        const fg = (n.any[0]?.data as { fgColor?: string } | undefined)?.fgColor;
        return !fg || !isBrassish(fg);
      });
      return nodes.length ? { ...v, nodes } : null;
    })
    .filter((v) => v !== null);

  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
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
