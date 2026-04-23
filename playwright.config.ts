import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://localhost:3001",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      'powershell -NoLogo -Command "$env:NEXT_PUBLIC_ENABLE_DEMO_AUTH=\'true\'; $env:ENABLE_DEMO_AUTH=\'true\'; $env:PLAYWRIGHT=\'true\'; $env:NODE_ENV=\'development\'; npx next dev -p 3001"',
    url: "http://localhost:3001",
    reuseExistingServer: false,
    timeout: 180_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
