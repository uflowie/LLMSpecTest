# LLMSpecTest

A comparative evaluation of how well large language models (O3, Gemini, and Claude) can implement a well-specified UI page for book management in two frontend frameworks: Angular and Blazor.

## Project Structure

- `spec.md` &ndash; UI specification for a book entry form and data grid, designed for Playwright testing.
- `eval/tests/books.spec.ts` &ndash; Playwright tests that verify compliance with the specification.
- `eval/playwright.config.ts` &ndash; Playwright configuration defining projects for each model-framework combination.
- `eval/json2md.py` &ndash; Python script to convert Playwright JSON results to Markdown tables.
- `eval/test-results.md` &ndash; Generated Markdown report of test outcomes.
- `clients/angular/*` &ndash; Angular implementations by each model.
- `clients/blazor/*` &ndash; Blazor implementations by each model.

## Getting Started

**Prerequisites:** Node.js, npm/yarn, Python 3.

1. Install dependencies:
   ```sh
   npm install
   npx playwright install
   ```
2. Run all tests:
   ```sh
   npx playwright test
   ```
   This produces `test-results.json` and (if using `json2md.py` or via teardown) `eval/test-results.md`.

3. (Optional) Manually generate the Markdown report:
   ```sh
   python eval/json2md.py eval/test-results.json eval/test-results.md
   ```

## Specification

See [spec.md](./spec.md) for the detailed UI form and data grid requirements. The spec covers:
- Field definitions, validation rules, and testable `data-testid` attributes.
- Submit button behavior and form clear/reset semantics.
- Data grid structure, cell test IDs, and row ordering.

## Test Scenarios

Automated tests in `eval/tests/books.spec.ts` cover:
- Form rendering and initial state.
- Field validation and error messages.
- Submit button enabling/disabling.
- Successful submission flow and grid update.
- Prevention of invalid submissions.

## Results

Below are the aggregated test outcomes for each model in Angular and Blazor:

### Angular Tests

| Test case                                                          | claude | gemini | o3   |
|--------------------------------------------------------------------|:------:|:------:|:----:|
| Author validation                                                  |   ✅    |   ✅    |   ✅  |
| ISBN validation                                                    |   ✅    |   ✅    |   ❌  |
| Number of Pages validation                                         |   ✅    |   ✅    |   ✅  |
| Publication Date validation                                        |   ✅    |   ✅    |   ✅  |
| TC1: Initial form rendering and submit button state                |   ✅    |   ✅    |   ✅  |
| TC1b: Default publication date value                               |   ✅    |   ✅    |   ✅  |
| TC3: Submit button state reflects form validity                    |   ✅    |   ✅    |   ✅  |
| TC4: Successful form submission, clears form, and updates data grid |   ✅    |   ✅    |   ❌  |
| TC5: UI prevents submission of invalid forms                       |   ✅    |   ✅    |   ✅  |
| Title validation                                                   |   ✅    |   ✅    |   ✅  |

### Blazor Tests

| Test case                                                          | claude | gemini | o3   |
|--------------------------------------------------------------------|:------:|:------:|:----:|
| Author validation                                                  |   ✅    |   ❌    |   ❌  |
| ISBN validation                                                    |   ✅    |   ❌    |   ❌  |
| Number of Pages validation                                         |   ✅    |   ❌    |   ❌  |
| Publication Date validation                                        |   ❌    |   ❌    |   ❌  |
| TC1: Initial form rendering and submit button state                |   ✅    |   ❌    |   ❌  |
| TC1b: Default publication date value                               |   ✅    |   ✅    |   ✅  |
| TC3: Submit button state reflects form validity                    |   ❌    |   ❌    |   ❌  |
| TC4: Successful form submission, clears form, and updates data grid |   ❌    |   ❌    |   ❌  |
| TC5: UI prevents submission of invalid forms                       |   ✅    |   ❌    |   ✅  |
| Title validation                                                   |   ✅    |   ❌    |   ❌  |

## Conclusion

This repository benchmarks LLM-driven UI code generation against a precise spec, highlighting strengths and gaps in Angular vs. Blazor implementations. Feel free to explore individual client directories for model-specific code.
