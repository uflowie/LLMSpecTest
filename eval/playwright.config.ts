// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  /* -------- global defaults -------- */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['./md-reporter.ts', { outputFile: 'test-results.md' }]
  ],
  use: {
    trace: 'on-first-retry',
    headless: false,
    baseURL: "http://localhost:5000", // default baseURL for tests
  },

  /* -------- ONE browser × THREE base-urls -------- */
  projects: [
    // Angular projects
    ...[
      'claude', 'o3', 'gemini', 'mistral', 'gemini-diffusion'
    ].map(path => ({
      name: `${path}-angular`,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:4200/${path}`,
      },
    })),
    
    // Blazor projects
    ...[
      'claude', 'o3', 'gemini', 'mistral', 'gemini-diffusion'
    ].map(path => ({
      name: `${path.replace('gemini-diffusion', 'geminidiffusion')}-blazor`,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:5095/${path}`,
      },
    })),
    
    // Vanilla HTML projects
    ...[
      'claude', 'o3', 'gemini', 'mistral', 'gemini-diffusion'
    ].map(path => ({
      name: `${path}-vanilla`,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:8080/${path}.html`,
      },
    })),
  ],

  webServer: [
    {
      name: 'Blazor Client',
      command: 'dotnet run',
      url: 'http://localhost:5095',
      cwd: '../clients/blazor',      // relative to /project/eval
      reuseExistingServer: !process.env.CI,
      timeout: 100000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      name: 'Angular Client',
      command: 'ng serve',
      url: 'http://localhost:4200',
      cwd: '../clients/angular',
      reuseExistingServer: !process.env.CI,
      timeout: 100000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      name: 'Vanilla HTML Client',
      command: 'npx http-server -p 8080',
      url: 'http://localhost:8080',
      cwd: '../clients/vanilla',
      reuseExistingServer: !process.env.CI,
      timeout: 100000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
