# Book Entry Form and Data Grid Specification (Playwright-Testable)

## Overview

This specification defines a UI form and data grid for managing a **Book** resource. It includes enhanced selectors and structure to support automated testing with Playwright.

---

## 1. Resource Definition

### Fields

Each book entry must include the following fields:

| Field            | Type    | Validation                           |
| ---------------- | ------- | ------------------------------------ |
| title            | String  | Required, 2-100 characters           |
| author           | String  | Required, 2-60 characters            |
| isbn             | String  | Required, numeric, exactly 13 digits |
| publication_date | Date    | Required, cannot be a future date    |
| number_of_pages  | Integer | Required, integer between 1 and 5000 |

---

## 2. Form Specification

### Form Fields

Each input must have a `data-testid` and accessible label:

| Field            | Label            | data-testid              | Placeholder                |
| ---------------- | ---------------- | ------------------------ | -------------------------- |
| title            | Book Title       | `input-title`            | Enter book title           |
| author           | Author Name      | `input-author`           | Enter author name          |
| isbn             | ISBN Number      | `input-isbn`             | Enter 13-digit ISBN number |
| publication_date | Publication Date | `input-publication-date` | (date picker placeholder)  |
| number_of_pages  | Number of Pages  | `input-pages`            | Enter number of pages      |
| Submit Button    | Add Book         | `btn-submit-book`        | (button text)              |

### Validation Errors

Each validation message must have a corresponding `data-testid`:

| Field            | data-testid              | Example Message                                  |
| ---------------- | ------------------------ | ------------------------------------------------ |
| title            | `error-title`            | Title must be between 2 and 100 characters.      |
| author           | `error-author`           | Author name must be between 2 and 60 characters. |
| isbn             | `error-isbn`             | ISBN must contain exactly 13 numeric digits.     |
| publication_date | `error-publication-date` | Publication Date cannot be in the future.        |
| number_of_pages  | `error-pages`            | Number of pages must be between 1 and 5000.      |

### Submit Button

* Must use `data-testid="btn-submit-book"`
* Disabled when form has any validation errors
* Enabled only when all fields are valid

---

## 3. Data Grid Specification

### Structure

Data grid displays all entries with the following columns:

| Column           | Data-testid Pattern                          |
| ---------------- | -------------------------------------------- |
| id               | `data-grid-cell-id-<entry-id>`               |
| title            | `data-grid-cell-title-<entry-id>`            |
| author           | `data-grid-cell-author-<entry-id>`           |
| isbn             | `data-grid-cell-isbn-<entry-id>`             |
| publication_date | `data-grid-cell-publication-date-<entry-id>` |
| number_of_pages  | `data-grid-cell-pages-<entry-id>`            |

The full grid table uses `data-testid="data-grid-books"` and each row `data-testid="data-grid-row-<entry-id>"`.

### Behavior

* Grid must show all stored book entries
* New entries appear at the top immediately upon successful form submission
* No manual refresh should be required

---

## 4. Functional Behavior for Testing

* [ ] Form renders with all 5 inputs and a submit button
* [ ] Validations trigger on blur and change
* [ ] Submit button disabled when validation errors exist
* [ ] Submit button enabled when all inputs are valid
* [ ] Form clears inputs upon successful submission
* [ ] Data grid updates with new entry (newest on top)
* [ ] All data-testid values exist as described above
* [ ] UI prevents submission of invalid forms
* [ ] No unexpected crashes on repeated input and submission

---

## 5. Automation Readiness Notes

* Use `data-testid` attributes for all critical elements
* Use consistent HTML structure for repeatable Playwright selectors
* Label and error text must be user-friendly and exact per specification
* Grid IDs should be auto-generated or simulated consistently for testing

---

This specification ensures a fully testable UI via Playwright with deterministic selectors and behaviors.
