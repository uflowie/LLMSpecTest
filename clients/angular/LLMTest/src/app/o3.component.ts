// book-manager.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { first } from 'rxjs/operators';

/** Book model mirroring the API schema */
interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publication_date: string; // ISO-8601 date string
  number_of_pages: number;
}

/** Stand-alone component providing book form + data grid */
@Component({
  selector: 'app-book-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form
      [formGroup]="bookForm"
      (ngSubmit)="onSubmit()"
      novalidate
      aria-labelledby="form-title"
    >
      <h2 id="form-title" class="sr-only">Add a new book</h2>

      <!-- Title -->
      <div>
        <label for="title">Book Title</label>
        <input
          id="title"
          type="text"
          placeholder="Enter book title"
          formControlName="title"
          data-testid="input-title"
          required
          minlength="2"
          maxlength="100"
        />
        <div
          *ngIf="hasError(title)"
          data-testid="error-title"
          aria-live="polite"
        >
          Title must be between 2 and 100 characters.
        </div>
      </div>

      <!-- Author -->
      <div>
        <label for="author">Author Name</label>
        <input
          id="author"
          type="text"
          placeholder="Enter author name"
          formControlName="author"
          data-testid="input-author"
          required
          minlength="2"
          maxlength="60"
        />
        <div
          *ngIf="hasError(author)"
          data-testid="error-author"
          aria-live="polite"
        >
          Author name must be between 2 and 60 characters.
        </div>
      </div>

      <!-- ISBN -->
      <div>
        <label for="isbn">ISBN Number</label>
        <input
          id="isbn"
          type="text"
          placeholder="Enter 13-digit ISBN number"
          formControlName="isbn"
          data-testid="input-isbn"
          required
          pattern="\\d{13}"
          inputmode="numeric"
        />
        <div
          *ngIf="hasError(isbn)"
          data-testid="error-isbn"
          aria-live="polite"
        >
          ISBN must contain exactly 13 numeric digits.
        </div>
      </div>

      <!-- Publication Date -->
      <div>
        <label for="pubDate">Publication Date</label>
        <input
          id="pubDate"
          type="date"
          formControlName="publication_date"
          data-testid="input-publication-date"
          required
        />
        <div
          *ngIf="hasError(publication_date)"
          data-testid="error-publication-date"
          aria-live="polite"
        >
          Publication Date cannot be in the future.
        </div>
      </div>

      <!-- Number of Pages -->
      <div>
        <label for="pages">Number of Pages</label>
        <input
          id="pages"
          type="number"
          placeholder="Enter number of pages"
          formControlName="number_of_pages"
          data-testid="input-pages"
          required
          min="1"
          max="5000"
        />
        <div
          *ngIf="hasError(number_of_pages)"
          data-testid="error-pages"
          aria-live="polite"
        >
          Number of pages must be between 1 and 5000.
        </div>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        data-testid="btn-submit-book"
        [disabled]="bookForm.invalid || submitting"
      >
        Add Book
      </button>
    </form>

    <!-- Data Grid -->
    <table data-testid="data-grid-books">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Title</th>
          <th scope="col">Author</th>
          <th scope="col">ISBN</th>
          <th scope="col">Publication Date</th>
          <th scope="col">Pages</th>
        </tr>
      </thead>
      <tbody>
        <tr
          *ngFor="let b of books"
          [attr.data-testid]="'data-grid-row-' + b.id"
        >
          <td [attr.data-testid]="'data-grid-cell-id-' + b.id">{{ b.id }}</td>
          <td [attr.data-testid]="'data-grid-cell-title-' + b.id">
            {{ b.title }}
          </td>
          <td [attr.data-testid]="'data-grid-cell-author-' + b.id">
            {{ b.author }}
          </td>
          <td [attr.data-testid]="'data-grid-cell-isbn-' + b.id">
            {{ b.isbn }}
          </td>
          <td [attr.data-testid]="'data-grid-cell-publication-date-' + b.id">
            {{ b.publication_date | date : 'yyyy-MM-dd' }}
          </td>
          <td [attr.data-testid]="'data-grid-cell-pages-' + b.id">
            {{ b.number_of_pages }}
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [
    /* Simple, framework-free styling */
    `
      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 25rem;
        margin-bottom: 2rem;
      }

      input,
      button {
        font: inherit;
        padding: 0.5rem;
      }

      button[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        border: 1px solid #ccc;
        padding: 0.5rem;
      }

      th {
        text-align: left;
        background: #f7f7f7;
      }

      /* Screen-reader-only heading */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* Error text */
      div[aria-live='polite'] {
        color: #c00;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class O3Component implements OnInit {
  /** Reactive form instance */
  readonly bookForm: FormGroup;

  /** Book collection rendered in grid */
  books: Book[] = [];

  /** Disables UI while waiting for API */
  submitting = false;

  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  constructor() {
    this.bookForm = this.fb.group({
      title: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      ],
      author: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(60)],
      ],
      isbn: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
      publication_date: [
        '',
        [Validators.required, this.noFutureDateValidator],
      ],
      number_of_pages: [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.max(5000),
          Validators.pattern(/^\d+$/),
        ],
      ],
    });
  }

  // #region form getters for template
  get title(): AbstractControl {
    return this.bookForm.get('title')!;
  }
  get author(): AbstractControl {
    return this.bookForm.get('author')!;
  }
  get isbn(): AbstractControl {
    return this.bookForm.get('isbn')!;
  }
  get publication_date(): AbstractControl {
    return this.bookForm.get('publication_date')!;
  }
  get number_of_pages(): AbstractControl {
    return this.bookForm.get('number_of_pages')!;
  }
  // #endregion

  ngOnInit(): void {
    this.loadBooks();
  }

  /** Client-side validator blocking future dates */
  private noFutureDateValidator(control: AbstractControl) {
    const value = control.value;
    if (!value) {
      return null;
    }
    const selected = new Date(value);
    selected.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected > today ? { future: true } : null;
  }

  /** True if control currently shows a validation error */
  hasError(ctrl: AbstractControl) {
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  /** Load existing books from API */
  private loadBooks(): void {
    this.http
      .get<Book[]>('http://localhost:5000/books')
      .pipe(first())
      .subscribe({
        next: (data) => (this.books = data ?? []),
        error: () => console.error('Failed to fetch books'),
      });
  }

  /** Submit handler for creating a book entry */
  onSubmit(): void {
    if (this.bookForm.invalid) return;

    this.submitting = true;
    const payload = this.bookForm.value as Omit<Book, 'id'>;

    this.http
      .post<Book>('http://localhost:5000/books', payload)
      .pipe(first())
      .subscribe({
        next: (created) => {
          this.books.unshift(created);
          this.bookForm.reset();
          this.bookForm.markAsPristine();
          this.bookForm.markAsUntouched();
          this.submitting = false;
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 400 && err.error?.errors) {
            // Map field errors to form controls if API returns any
            Object.entries<Record<string, string[]>>(err.error.errors).forEach(
              ([key, msgs]) =>
                this.bookForm.get(key)?.setErrors({
                  api: Array.isArray(msgs) ? msgs.join(' ') : String(msgs),
                })
            );
          }
          console.error('Create book failed', err);
          this.submitting = false;
        },
      });
  }
}
