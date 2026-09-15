import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "line",
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: [
    {
      command:
        "../lumora-treks-BE/.venv/bin/python ../lumora-treks-BE/manage.py runserver 127.0.0.1:8000 --noreload",
      url: "http://127.0.0.1:8000/api/v2/packages/?limit=1",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command:
        "NEXT_PUBLIC_WAGTAIL_URL=http://127.0.0.1:8000 npm run dev -- --port 3100",
      url: "http://localhost:3100/packages",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
