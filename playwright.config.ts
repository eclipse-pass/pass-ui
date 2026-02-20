import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  snapshotDir: './tests/visual/__screenshots__',
  fullyParallel: false,
  retries: 0,
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:4200/app/',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
