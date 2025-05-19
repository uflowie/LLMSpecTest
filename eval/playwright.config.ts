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
    ['json', { outputFile: 'test-results.json' }]
  ],
  use: {
    trace: 'on-first-retry',
    headless: false,
    baseURL: "http://localhost:5000", // default baseURL for tests
    // no global baseURL – each project sets its own
  },

  /* -------- ONE browser × THREE base-urls -------- */
  projects: [
    {
      name: 'claude-angular',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4200/claude',
      },
    },
    {
      name: 'o3-angular',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4200/o3',
      },
    },
    {
      name: 'gemini-angular',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4200/gemini',
      },
    },
    {
      name: 'mistral-angular',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4200/mistral',
      },
    },
    {
      name: 'claude-blazor',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5095/claude',
      },
    },
    {
      name: 'o3-blazor',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5095/o3',
      },
    },
    {
      name: 'gemini-blazor',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5095/gemini',
      },
    },
    {
      name: 'mistral-blazor',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5095/mistral',
      },
    },
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
      cwd: '../clients/angular/LLMTest',
      reuseExistingServer: !process.env.CI,
      timeout: 100000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      name: 'Server',
      command: 'python server.py',
      url: 'http://localhost:5000',
      cwd: '../server',
      reuseExistingServer: !process.env.CI,
      timeout: 100000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
