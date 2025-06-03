# react Book Management Implementation Task
## Task Overview
Implement a react component that provides a form for creating book entries and a data grid to display them. The implementation should follow the specification and use the API defined below. Do not use any third-party libraries for the form or data grid. There are no pre-installed CSS libraries.
## Specifications
### UI/UX Specification
```markdown
# Book Entry Form and Data Grid Specification (Playwright-Testable)

## Overview

This specification defines a UI form and data grid for managing a **Book** resource. It includes enhanced selectors and structure to support automated testing with Playwright. The goal is to ensure all interactive elements are easily and reliably selectable and that behaviors are clearly defined for testing.

---

## 1. Book Form Specification

This section details the input fields, submission button, and general behavior of the book entry form.

### 1.1. Fields

Each book entry requires the following fields. Each input must have an associated accessible label and specific `data-testid` attributes for the input element and its corresponding validation error message area.

| Field Name        | Data Type | Validation Rules                     | Form Label       | Input `data-testid`      | Placeholder Text             | Error `data-testid`      | Example Error Message                           |
|-------------------|-----------|--------------------------------------|------------------|--------------------------|------------------------------|--------------------------|-------------------------------------------------|
| `title`           | String    | Required, 2-100 characters           | Book Title       | `input-title`            | Enter book title             | `error-title`            | Title must be between 2 and 100 characters.     |
| `author`          | String    | Required, 2-60 characters            | Author Name      | `input-author`           | Enter author name            | `error-author`           | Author name must be between 2 and 60 characters.|
| `isbn`            | String    | Required, numeric, exactly 13 digits | ISBN Number      | `input-isbn`             | Enter 13-digit ISBN number   | `error-isbn`             | ISBN must contain exactly 13 numeric digits.    |
| `publication_date`| Date      | Required, cannot be a future date    | Publication Date | `input-publication-date` | *(date picker placeholder)* | `error-publication-date` | Publication Date cannot be in the future.       |
| `number_of_pages` | Integer   | Required, integer between 1 and 5000 | Number of Pages  | `input-pages`            | Enter number of pages        | `error-pages`            | Number of pages must be between 1 and 5000.     |

### 1.2. Submit Button

| Element        | Label    | `data-testid`     |
|----------------|----------|-------------------|
| Submit Button  | Add Book | `btn-submit-book` |

**Behavior:**
* The submit button must be **disabled** if any form validation errors are present or if any required fields are empty.
* The submit button must be **enabled** only when all input fields are valid according to their specified validation rules.

### 1.3. General Form Behavior
* **Default Value:** The publication date field should default to today's date when the form loads.
* **Validation Trigger:** Input field validations must trigger on both `blur` and `input` (or `change`) events to provide real-time feedback.
* **Submission Outcome:**
    * Upon successful submission, all form inputs must be cleared.
    * The UI must prevent the submission of forms with invalid data (primarily enforced by the submit button's state).
* **Error Display:** Validation error messages, as defined in the Fields table, must be displayed adjacent to or below their respective fields when validation fails.

---

## 2. Book Data Grid Specification

This section defines the structure and behavior of the data grid displaying book entries.

### 2.1. Structure

* **Grid Container:** The main data grid table or container element must have `data-testid="data-grid-books"`.
* **Grid Rows:** Each row representing a single book entry must have a `data-testid` following the pattern `data-grid-row-<entry-id>`, where `<entry-id>` is a unique identifier for the book.

### 2.2. Column and Cell Definitions

The data grid must display all submitted book entries with the following columns. Each cell must have a `data-testid` for precise targeting.

| Displayed Column Header | Source Field (from Book Resource) | Cell `data-testid` Pattern                     |
|-------------------------|-----------------------------------|------------------------------------------------|
| ID                      | `id` (unique entry identifier)    | `data-grid-cell-id-<entry-id>`                 |
| Title                   | `title`                           | `data-grid-cell-title-<entry-id>`              |
| Author                  | `author`                          | `data-grid-cell-author-<entry-id>`             |
| ISBN                    | `isbn`                            | `data-grid-cell-isbn-<entry-id>`               |
| Publication Date        | `publication_date`                | `data-grid-cell-publication-date-<entry-id>` |
| Pages                   | `number_of_pages`                 | `data-grid-cell-pages-<entry-id>`             |

### 2.3. Behavior
* **Data Display:** The grid must accurately display all successfully submitted book entries.
* **Date Format:** The publication date must be displayed in `YYYY-MM-DD` format.
* **Real-time Update:** New entries must appear in the data grid immediately after successful form submission.
* **Sorting Order:** New entries should appear at the **top** of the grid.
* **No Manual Refresh:** The grid update must occur automatically without requiring any manual user action (e.g., a refresh button).

---

## 3. Key Functional Test Scenarios Checklist

This checklist outlines critical functionalities to be verified through automated testing.

* [ ] **Form Rendering:** The form renders completely with all five specified input fields and the "Add Book" submit button.
* [ ] **Input Validation & Error Display:**
    * Validation messages trigger correctly on `blur` and `input`/`change` events for each field.
    * Error messages match the specified text and use the correct `data-testid`.
* [ ] **Submit Button State:**
    * The submit button is initially disabled (if fields are empty and required).
    * The submit button becomes enabled when all fields are filled with valid data.
    * The submit button becomes disabled if any field becomes invalid.
* [ ] **Successful Submission Flow:**
    * Submitting a valid form clears all input fields.
    * The newly submitted book appears as the first entry (at the top) in the data grid.
    * Data in the grid correctly matches the submitted data.
* [ ] **Invalid Submission Prevention:** The UI prevents form submission when data is invalid (submit button should be disabled).
* [ ] **`data-testid` Presence:** All `data-testid` attributes specified in this document are present on the correct elements in the rendered UI.

---
```
### API Specification
The application communicates with a REST API offering the following endpoints:
- **GET /books**: returns a JSON array of book objects (newest first), each with properties:
  - `id` (integer)
  - `title` (string)
  - `author` (string)
  - `isbn` (string of exactly 13 digits)
  - `publication_date` (string in `YYYY-MM-DD` format)
  - `number_of_pages` (integer)
- **POST /books**: accepts a JSON body with fields:
  - `title` (string)
  - `author` (string)
  - `isbn` (string)
  - `publication_date` (string `YYYY-MM-DD`)
  - `number_of_pages` (integer)
Returns the created book object with a unique `id`. No additional endpoints are required.
## Implementation Requirements
1. Create a react component that implements the form according to the specification.
2. Implement client-side validation as described in the spec.
3. Connect to the API to submit new books and retrieve the book list.
4. Implement the data grid in react as specified.
5. Ensure all data-testid attributes are correctly set for testing.
6. Make sure the form follows best practices for accessibility.
7. Output only a single file.