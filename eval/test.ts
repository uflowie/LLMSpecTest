// tests/bookForm.spec.ts
import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:5000/';   // ← change if needed

/**
 * Returns YYYY-MM-DD for “tomorrow”.
 */
const tomorrowISO = (): string => {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return tomorrow.toISOString().split('T')[0];
};

test.describe('Book-entry form & data grid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
  });

  // ---------------------------------------------------------------------------
  // 1. Static rendering & initial state
  // ---------------------------------------------------------------------------
  test('renders all inputs and shows disabled submit button', async ({ page }) => {
    for (const id of [
      'input-title',
      'input-author',
      'input-isbn',
      'input-publication-date',
      'input-pages',
      'btn-submit-book',
    ]) {
      await expect(page.getByTestId(id)).toBeVisible();
    }
    await expect(page.getByTestId('btn-submit-book')).toBeDisabled();
  });

  // ---------------------------------------------------------------------------
  // 2. Field-level validation checks (negative paths)
  // ---------------------------------------------------------------------------
  const invalidCases = [
    {
      name: 'short title',
      field: 'input-title',
      value: 'A',
      errorField: 'error-title',
    },
    {
      name: 'empty author',
      field: 'input-author',
      value: '',
      errorField: 'error-author',
    },
    {
      name: 'bad ISBN length',
      field: 'input-isbn',
      value: '123',
      errorField: 'error-isbn',
    },
    {
      name: 'future publication date',
      field: 'input-publication-date',
      value: tomorrowISO(),
      errorField: 'error-publication-date',
    },
    {
      name: 'pages out of range',
      field: 'input-pages',
      value: '0',
      errorField: 'error-pages',
    },
  ] as const;

  for (const { name, field, value, errorField } of invalidCases) {
    test(`keeps submit disabled and shows “${errorField}” on ${name}`, async ({ page }) => {
      await page.getByTestId(field).fill(value);
      await page.getByTestId(field).blur();               // trigger onBlur validation
      await expect(page.getByTestId(errorField)).toBeVisible();
      await expect(page.getByTestId('btn-submit-book')).toBeDisabled();
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Happy-path submission & grid update
  // ---------------------------------------------------------------------------
  test('accepts valid book, clears form, and inserts new row at top', async ({ page }) => {
    /* -------- fill form with valid data -------- */
    const uniqueTitle = `Playwright Guide ${Date.now()}`; // ensures uniqueness across test runs
    await page.getByTestId('input-title').fill(uniqueTitle);
    await page.getByTestId('input-author').fill('Tester McTestface');
    await page.getByTestId('input-isbn').fill('1234567890123');
    await page
      .getByTestId('input-publication-date')
      .fill('2000-01-01');
    await page.getByTestId('input-pages').fill('321');

    // Button should now be enabled
    await expect(page.getByTestId('btn-submit-book')).toBeEnabled();

    /* -------- submit and await server ACK -------- */
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().endsWith('/books') && res.status() === 201),
      page.getByTestId('btn-submit-book').click(),
    ]);
    expect(await response.json()).toMatchObject({ title: uniqueTitle });

    /* -------- form inputs reset -------- */
    for (const id of [
      'input-title',
      'input-author',
      'input-isbn',
      'input-publication-date',
      'input-pages',
    ]) {
      await expect(page.getByTestId(id)).toHaveValue('');
    }
    await expect(page.getByTestId('btn-submit-book')).toBeDisabled();

    /* -------- data grid updated (newest first) -------- */
    const topRow = page
      .locator('[data-testid="data-grid-books"] tbody tr')
      .first();
    const topRowTitle = topRow.locator('[data-testid^="data-grid-cell-title-"]');
    await expect(topRowTitle).toHaveText(uniqueTitle);
  });

  // ---------------------------------------------------------------------------
  // 4. Stability on multiple submissions
  // ---------------------------------------------------------------------------
  test('handles successive valid submissions without residual errors', async ({ page }) => {
    for (let i = 0; i < 2; i++) {
      const title = `Book #${i}-${Date.now()}`;
      await page.getByTestId('input-title').fill(title);
      await page.getByTestId('input-author').fill('Author');
      await page.getByTestId('input-isbn').fill(`97812345678${i}0`); // still 13 digits
      await page.getByTestId('input-publication-date').fill('1999-12-31');
      await page.getByTestId('input-pages').fill('100');

      await page.getByTestId('btn-submit-book').click();
      await page.waitForResponse((res) => res.url().endsWith('/books') && res.status() === 201);

      // After each submission grid’s first row must match this title
      const topRowTitle = page
        .locator('[data-testid="data-grid-books"] tbody tr')
        .first()
        .locator('[data-testid^="data-grid-cell-title-"]');
      await expect(topRowTitle).toHaveText(title);
    }
  });
});
