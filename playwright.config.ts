import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Generous: dev mode compiles each route/action on first hit, and the
  // booking test chains several real network calls (Supabase, Resend).
  timeout: 45_000,
  fullyParallel: true,
  retries: 0,
  // HTML report in CI (uploaded as an artifact on failure — see
  // .github/workflows/e2e.yml); plain list output is more useful locally
  // than a report that has to be opened separately.
  reporter: process.env.CI ? "html" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
