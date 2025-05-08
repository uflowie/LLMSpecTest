# Angular Book Management Implementation Task
## Task Overview
Implement a Angular component that provides a form for creating book entries and a data grid to display them. The implementation should follow the specification and use the API defined in the OpenAPI document below. Do not use any third-party libraries for the form or data grid. There are no pre-installed CSS libraries. Create the component as a stand-alone component.
## Specifications
### UI/UX Specification
```markdown
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
```
### API Specification
The backend API is defined by the following OpenAPI YAML:
```yaml
openapi: 3.0.0
info:
  title: Book Entry API
  version: "1.0.0"
  description: |
    A simple in-memory API to create and list Book entries.
servers:
  - url: http://localhost:5000
paths:
  /books:
    get:
      summary: List all books
      description: Returns all book entries, ordered newest first.
      responses:
        "200":
          description: A JSON array of Book objects
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Book'
    post:
      summary: Create a new book
      description: Creates a new book entry after validating all fields.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BookInput'
      responses:
        "201":
          description: The created Book object
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Book'
        "400":
          description: Validation errors or bad request
          content:
            application/json:
              schema:
                oneOf:
                  - $ref: '#/components/schemas/ValidationErrorResponse'
                  - $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    Book:
      type: object
      required:
        - id
        - title
        - author
        - isbn
        - publication_date
        - number_of_pages
      properties:
        id:
          type: integer
          example: 1
        title:
          type: string
          minLength: 2
          maxLength: 100
          example: "A Tale of Two Cities"
        author:
          type: string
          minLength: 2
          maxLength: 60
          example: "Charles Dickens"
        isbn:
          type: string
          pattern: '^[0-9]{13}$'
          example: "1234567890123"
        publication_date:
          type: string
          format: date
          example: "1859-04-30"
        number_of_pages:
          type: integer
          minimum: 1
          maximum: 5000
          example: 341

    BookInput:
      type: object
      required:
        - title
        - author
        - isbn
        - publication_date
        - number_of_pages
      properties:
        title:
          type: string
          minLength: 2
          maxLength: 100
          example: "A Tale of Two Cities"
        author:
          type: string
          minLength: 2
          maxLength: 60
          example: "Charles Dickens"
        isbn:
          type: string
          pattern: '^[0-9]{13}$'
          example: "1234567890123"
        publication_date:
          type: string
          format: date
          example: "1859-04-30"
        number_of_pages:
          type: integer
          minimum: 1
          maximum: 5000
          example: 341

    ValidationErrorResponse:
      type: object
      required:
        - errors
      properties:
        errors:
          type: object
          additionalProperties:
            type: array
            items:
              type: string
          description: |
            A map of field names to a list of validation error messages.
          example:
            title:
              - "Title is required."
              - "Title must be between 2 and 100 characters."
            isbn:
              - "ISBN must contain exactly 13 numeric digits."

    ErrorResponse:
      type: object
      required:
        - error
      properties:
        error:
          type: string
          description: A general error message for non-validation failures.
          example: "Request body must be JSON"
```
## Implementation Requirements
1. Create a Angular component that implements the form according to the specification.
2. Implement client-side validation as described in the spec.
3. Connect to the API to submit new books and retrieve the book list.
4. Implement the data grid in Angular as specified.
5. Ensure all data-testid attributes are correctly set for testing.
6. Make sure the form follows best practices for accessibility.
7. Output only a single file.