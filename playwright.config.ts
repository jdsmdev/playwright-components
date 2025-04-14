import { defineConfig, devices } from "@playwright/test";
import path from "path";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",

  webServer: {
    command: "npm run start:http2",
    url: "https://localhost:3000",
    reuseExistingServer: true,
    ignoreHTTPSErrors: true,
  },

  /* Configure projects */
  projects: [
    {
      name: "components",
      testDir: "./tests/components",
      use: {
        ...devices["Desktop Chrome"],
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: `file://${path.resolve("./tests")}`,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        screenshot: "only-on-failure",
      },
    },
    {
      name: "fixtures",
      testDir: "./tests/fixtures",
      use: {
        baseURL: "https://localhost:3000",
        ignoreHTTPSErrors: true,
      },
    },
    {
      name: "utils",
      testDir: "./tests/utils",
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
