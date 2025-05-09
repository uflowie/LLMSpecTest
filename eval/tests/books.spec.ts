// @ts-nocheck
import { test, expect, Page } from '@playwright/test';

// Helper function to generate unique book data for each test run or submission
const generateBookData = (id: string | number) => {
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  // Ensure ISBN is numeric and exactly 13 digits. Pad if necessary.
  let isbnBase = Math.floor(Math.random() * 1000000000000).toString();
  isbnBase = isbnBase.padStart(12, '0'); // ensure it's almost 13 digits
  const isbn = '978' + isbnBase.substring(0,10); // Prepend common prefix, take 10 digits from random

  return {
    title: `The Great Test Book ${id}-${randomSuffix}`,
    author: `Test Author ${id}-${randomSuffix}`,
    // Generate a valid-looking ISBN for testing. Actual ISBN validation logic might be more complex.
    isbn: isbn,
    // A valid past date, e.g., yesterday
    publication_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // YYYY-MM-DD
    number_of_pages: (Math.floor(Math.random() * 100) + 50).toString(), // Random pages between 50-149
  };
};

// Helper function to fill the form
async function fillBookForm(page: Page, data: ReturnType<typeof generateBookData>) {
  await page.locator('[data-testid="input-title"]').fill(data.title);
  await page.locator('[data-testid="input-author"]').fill(data.author);
  await page.locator('[data-testid="input-isbn"]').fill(data.isbn);
  await page.locator('[data-testid="input-publication-date"]').fill(data.publication_date);
  await page.locator('[data-testid="input-pages"]').fill(data.number_of_pages);
}

test.describe('Book Entry Form and Data Grid', () => {
  const selectors = {
    titleInput: '[data-testid="input-title"]',
    authorInput: '[data-testid="input-author"]',
    isbnInput: '[data-testid="input-isbn"]',
    publicationDateInput: '[data-testid="input-publication-date"]',
    pagesInput: '[data-testid="input-pages"]',
    submitButton: '[data-testid="btn-submit-book"]',
    titleError: '[data-testid="error-title"]',
    authorError: '[data-testid="error-author"]',
    isbnError: '[data-testid="error-isbn"]',
    publicationDateError: '[data-testid="error-publication-date"]',
    pagesError: '[data-testid="error-pages"]',
    dataGrid: '[data-testid="data-grid-books"]',
    getFirstRowInGrid: () => `${selectors.dataGrid} [data-testid^="data-grid-row-"] >> nth=0`,
  };

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
  });

  test('TC1: Initial form rendering and submit button state', async ({ page }) => {
    await expect(page.locator(selectors.titleInput)).toBeVisible();
    await expect(page.locator(selectors.authorInput)).toBeVisible();
    await expect(page.locator(selectors.isbnInput)).toBeVisible();
    await expect(page.locator(selectors.publicationDateInput)).toBeVisible();
    await expect(page.locator(selectors.pagesInput)).toBeVisible();
    await expect(page.locator(selectors.submitButton)).toBeVisible();
    await expect(page.locator(selectors.submitButton)).toBeDisabled(); // Initially disabled as fields are empty
  });

  test('TC1b: Default publication date value', async ({ page }) => {
    const dateInput = page.locator(selectors.publicationDateInput);
    const today = new Date().toISOString().split('T')[0];
    await expect(dateInput).toHaveValue(today);
  });

  test.describe('TC2: Input Field Validations', () => {
    test('Title validation', async ({ page }) => {
      const titleInput = page.locator(selectors.titleInput);
      const titleError = page.locator(selectors.titleError);

      // Required
      await titleInput.focus();
      await titleInput.blur();
      await expect(titleError).toBeVisible();
      await expect(titleError).toHaveText(/required|between 2 and 100 characters/i); // Accommodate different message wordings

      // Too short
      await titleInput.fill('A');
      await titleInput.blur();
      await expect(titleError).toBeVisible();
      await expect(titleError).toHaveText('Title must be between 2 and 100 characters.');

      // Too long: either input is truncated to max length or shows validation error
      await titleInput.fill('A'.repeat(101));
      await titleInput.blur();
      const titleValue = await titleInput.inputValue();
      if (titleValue.length > 100) {
        await expect(titleError).toBeVisible();
        await expect(titleError).toHaveText(/between 2 and 100 characters/i);
      } else {
        expect(titleValue.length).toBe(100);
        await expect(titleError).not.toBeVisible();
      }

      // Valid
      await titleInput.fill('Valid Title');
      await titleInput.blur();
      await expect(titleError).not.toBeVisible();
    });

    test('Author validation', async ({ page }) => {
      const authorInput = page.locator(selectors.authorInput);
      const authorError = page.locator(selectors.authorError);

      // Required
      await authorInput.focus();
      await authorInput.blur();
      await expect(authorError).toBeVisible();
      await expect(authorError).toHaveText(/required|between 2 and 60 characters/i);


      // Too short
      await authorInput.fill('B');
      await authorInput.blur();
      await expect(authorError).toBeVisible();
      await expect(authorError).toHaveText('Author name must be between 2 and 60 characters.');

      // Too long: either input is truncated to max length or shows validation error
      await authorInput.fill('B'.repeat(61));
      await authorInput.blur();
      const authorValue = await authorInput.inputValue();
      if (authorValue.length > 60) {
        await expect(authorError).toBeVisible();
        await expect(authorError).toHaveText(/between 2 and 60 characters/i);
      } else {
        expect(authorValue.length).toBe(60);
        await expect(authorError).not.toBeVisible();
      }

      // Valid
      await authorInput.fill('Valid Author');
      await authorInput.blur();
      await expect(authorError).not.toBeVisible();
    });

    test('ISBN validation', async ({ page }) => {
      const isbnInput = page.locator(selectors.isbnInput);
      const isbnError = page.locator(selectors.isbnError);

      // Required
      await isbnInput.focus();
      await isbnInput.blur();
      await expect(isbnError).toBeVisible();
      await expect(isbnError).toHaveText(/required|exactly 13 numeric digits/i);

      // Not numeric
      await isbnInput.fill('abcdefghijklm');
      await isbnInput.blur();
      await expect(isbnError).toBeVisible();
      await expect(isbnError).toHaveText('ISBN must contain exactly 13 numeric digits.');

      // Too short
      await isbnInput.fill('12345');
      await isbnInput.blur();
      await expect(isbnError).toBeVisible();
      await expect(isbnError).toHaveText('ISBN must contain exactly 13 numeric digits.');
      
      // Too long
      await isbnInput.fill('12345678901234');
      await isbnInput.blur();
      await expect(isbnError).toBeVisible();
      await expect(isbnError).toHaveText('ISBN must contain exactly 13 numeric digits.');

      // Valid
      await isbnInput.fill('9780321765723');
      await isbnInput.blur();
      await expect(isbnError).not.toBeVisible();
    });

    test('Publication Date validation', async ({ page }) => {
      const dateInput = page.locator(selectors.publicationDateInput);
      const dateError = page.locator(selectors.publicationDateError);

      // Required (if input allows empty then blur)
      await dateInput.fill('');
      await dateInput.blur(); // Trigger validation if not immediate
      // Depending on implementation, an empty date might show a "required" or specific format error.
      // For this test, we assume 'required' is a possible state covered by specific error text.
      await expect(dateError).toBeVisible();
      await expect(dateError).toHaveText(/required|cannot be in the future/i);


      // Future date
      const today = new Date();
      const futureDate = new Date(today.setDate(today.getDate() + 5)).toISOString().split('T')[0]; // 5 days in future
      await dateInput.fill(futureDate);
      await dateInput.blur();
      await expect(dateError).toBeVisible();
      await expect(dateError).toHaveText('Publication Date cannot be in the future.');

      // Valid past date
      const pastDate = '2022-01-01';
      await dateInput.fill(pastDate);
      await dateInput.blur();
      await expect(dateError).not.toBeVisible();
    });

    test('Number of Pages validation', async ({ page }) => {
      const pagesInput = page.locator(selectors.pagesInput);
      const pagesError = page.locator(selectors.pagesError);

      // Required
      await pagesInput.focus();
      await pagesInput.blur();
      await expect(pagesError).toBeVisible();
      await expect(pagesError).toHaveText(/required|between 1 and 5000/i);

      // Below minimum (e.g., 0)
      await pagesInput.fill('0');
      await pagesInput.blur();
      await expect(pagesError).toBeVisible();
      await expect(pagesError).toHaveText('Number of pages must be between 1 and 5000.');

      // Above maximum (e.g., 5001)
      await pagesInput.fill('5001');
      await pagesInput.blur();
      await expect(pagesError).toBeVisible();
      await expect(pagesError).toHaveText('Number of pages must be between 1 and 5000.');
      
      // Valid
      await pagesInput.fill('300');
      await pagesInput.blur();
      await expect(pagesError).not.toBeVisible();
    });
  });

  test('TC3: Submit button state reflects form validity', async ({ page }) => {
    const book = generateBookData('submit-state');

    // Initially disabled
    await expect(page.locator(selectors.submitButton)).toBeDisabled();

    // Fill one field validly, still disabled
    await page.locator(selectors.titleInput).fill(book.title);
    await expect(page.locator(selectors.submitButton)).toBeDisabled();

    // Fill all fields validly
    await fillBookForm(page, book);
    await expect(page.locator(selectors.submitButton)).toBeEnabled();

    // Make one field invalid again
    await page.locator(selectors.titleInput).fill(''); // Title becomes invalid (required)
    await page.locator(selectors.titleInput).blur(); // Ensure validation triggers
    await expect(page.locator(selectors.submitButton)).toBeDisabled();
  });

  test('TC4: Successful form submission, clears form, and updates data grid', async ({ page }) => {
    const bookData = generateBookData('submission1');

    // Fill and submit form
    await fillBookForm(page, bookData);
    await expect(page.locator(selectors.submitButton)).toBeEnabled();
    await page.locator(selectors.submitButton).click();

    // 1. Assert form fields are cleared
    await expect(page.locator(selectors.titleInput)).toHaveValue('');
    await expect(page.locator(selectors.authorInput)).toHaveValue('');
    await expect(page.locator(selectors.isbnInput)).toHaveValue('');
    // Date field clearing behavior can vary: allow empty or a default date (YYYY-MM-DD).
    await expect(page.locator(selectors.publicationDateInput)).toHaveValue(/^(?:\d{4}-\d{2}-\d{2})?$/);
    await expect(page.locator(selectors.pagesInput)).toHaveValue('');

    // 2. Assert new entry appears at the top of the grid
    const firstRow = page.locator(selectors.getFirstRowInGrid());
    await expect(firstRow).toBeVisible();

    // Extract entry ID from the first row's ID cell to verify other cells accurately.
    // This assumes the ID cell contains the actual entry ID.
    const idCell = firstRow.locator('[data-testid^="data-grid-cell-id-"]');
    const entryId = await idCell.textContent();
    expect(entryId).not.toBeNull(); // Ensure ID was found

    // 3. Verify content of the new row using the extracted entryId
    // Note: Using `^=` for data-testid allows for flexibility if the ID is appended.
    // However, the spec says `data-grid-cell-title-<entry-id>`, so we should be able to construct it.
    if (entryId) { // Proceed if entryId was successfully extracted
      await expect(firstRow.locator(`[data-testid="data-grid-cell-title-${entryId}"]`)).toHaveText(bookData.title);
      await expect(firstRow.locator(`[data-testid="data-grid-cell-author-${entryId}"]`)).toHaveText(bookData.author);
      await expect(firstRow.locator(`[data-testid="data-grid-cell-isbn-${entryId}"]`)).toHaveText(bookData.isbn);
      await expect(firstRow.locator(`[data-testid="data-grid-cell-publication-date-${entryId}"]`)).toHaveText(bookData.publication_date);
      await expect(firstRow.locator(`[data-testid="data-grid-cell-pages-${entryId}"]`)).toHaveText(bookData.number_of_pages);
    } else {
      // Fallback if ID extraction is problematic, check for text within any cell in the first row. Less precise.
      console.warn("Entry ID could not be extracted. Performing less precise cell checks.");
      await expect(firstRow).toContainText(bookData.title);
      await expect(firstRow).toContainText(bookData.author);
    }

    // Optional: Check that the submit button is disabled again after successful submission (due to empty form)
    await expect(page.locator(selectors.submitButton)).toBeDisabled();
  });
  
  test('TC5: UI prevents submission of invalid forms', async ({ page }) => {
    // Fill with some invalid data (e.g., only title, which is too short)
    await page.locator(selectors.titleInput).fill('X');
    await page.locator(selectors.titleInput).blur(); // Trigger validation

    // Assert submit button is disabled
    await expect(page.locator(selectors.submitButton)).toBeDisabled();

    // Try to click (it shouldn't do anything if truly disabled, this is an extra check)
    // Playwright's click on a disabled button might throw an error if strict mode is on,
    // or it might do nothing. The primary check is `toBeDisabled()`.
    // await page.locator(selectors.submitButton).click({ force: true }); // Avoid if not needed

    // Verify no new row was added to the grid (e.g., count rows or check for specific text not present)
    // This assumes the grid is initially empty or has a known state.
    const initialRowCount = await page.locator('[data-testid^="data-grid-row-"]').count();
    // Attempt to fill the form completely to make it "submittable" but then invalidate one field
    const book = generateBookData('invalid-submit');
    await fillBookForm(page, book); // fill validly
    await page.locator(selectors.titleInput).fill('X'); // make title invalid
    await page.locator(selectors.titleInput).blur(); 
    
    await expect(page.locator(selectors.submitButton)).toBeDisabled();
    // A click here should not result in a submission
    // await page.locator(selectors.submitButton).click({ force: true }); // Not recommended unless to test unhandled clicks

    const finalRowCount = await page.locator('[data-testid^="data-grid-row-"]').count();
    expect(finalRowCount).toBe(initialRowCount); // No new row added
  });
});