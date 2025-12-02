import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for P0 Fix Verification
 *
 * Production testing configuration with:
 * - Visual testing (screenshots + video)
 * - Performance monitoring
 * - Console log capture
 * - Responsive design testing
 */
export default defineConfig({
  testDir: './',
  testMatch: 'playwright-p0-*.ts',

  // Timeout settings
  timeout: 60000, // 60 seconds per test
  expect: {
    timeout: 10000 // 10 seconds for assertions
  },

  // Run tests sequentially (not in parallel)
  fullyParallel: false,
  workers: 1,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/test-results.json' }],
    ['list']
  ],

  // Output settings
  use: {
    // Base URL for production
    baseURL: 'https://yesheyball.vercel.app',

    // Browser context options
    trace: 'on', // Record trace for debugging
    screenshot: 'on', // Take screenshots on failure
    video: 'on', // Record video of test execution

    // Viewport
    viewport: { width: 1280, height: 720 },

    // Locale and timezone
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',

    // Network
    offline: false,

    // Permissions
    permissions: ['clipboard-read', 'clipboard-write']
  },

  // Projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  // Output folder
  outputDir: 'test-results/'
});
