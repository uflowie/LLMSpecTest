// o3.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

/** --- Types ---------------------------------------------------------------- */

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publication_date: string; // YYYY-MM-DD
  number_of_pages: number;
}

type BookInput = Omit<Book, 'id'>;

/** --- Validators ----------------------------------------------------------- */

/** Exactly 13 numeric digits */
function isbnValidator(ctrl: AbstractControl) {
  const value = ctrl.value as string;
  const valid = /^[0-9]{13}$/.test(value);
  return valid ? null : { isbn: true };
}

/** Not a future date (assumes YYYY-MM-DD) */
function notFutureDateValidator(ctrl: AbstractControl) {
  const value = ctrl.value as string;
  if (!value) return null;
  const today = new Date().toISOString().substring(0, 10);
  return value <= today ? null : { futureDate: true };
}

/** --- Component ------------------------------------------------------------ */

@Component({
  selector: 'app-o3',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  template: `
    <!-- ─────────────────────────── Book Entry Form ────────────────────────── -->
    <form
      [formGroup]="bookForm"
      (ngSubmit)="onSubmit()"
      novalidate
      aria-labelledby="form-title"
    >
      <h2 id="form-title" class="sr-only">Add a Book</h2>

      <!-- Title -->
      <div>
        <label for="title">Book Title</label>
        <input
          id="title"
          type="text"
          formControlName="title"
          placeholder="Enter book title"
          data-testid="input-title"
          aria-required="true"
        />
        <div
          *ngIf="showError('title')"
          data-testid="error-title"
          class="error"
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
          formControlName="author"
          placeholder="Enter author name"
          data-testid="input-author"
          aria-required="true"
        />
        <div
          *ngIf="showError('author')"
          data-testid="error-author"
          class="error"
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
          formControlName="isbn"
          maxlength="13"
          placeholder="Enter 13-digit ISBN number"
          data-testid="input-isbn"
          aria-required="true"
        />
        <div
          *ngIf="showError('isbn')"
          data-testid="error-isbn"
          class="error"
          aria-live="polite"
        >
          ISBN must contain exactly 13 numeric digits.
        </div>
      </div>

      <!-- Publication Date -->
      <div>
        <label for="publication_date">Publication Date</label>
        <input
          id="publication_date"
          type="date"
          formControlName="publication_date"
          data-testid="input-publication-date"
          aria-required="true"
        />
        <div
          *ngIf="showError('publication_date')"
          data-testid="error-publication-date"
          class="error"
          aria-live="polite"
        >
          Publication Date cannot be in the future.
        </div>
      </div>

      <!-- Pages -->
      <div>
        <label for="number_of_pages">Number of Pages</label>
        <input
          id="number_of_pages"
          type="number"
          formControlName="number_of_pages"
          placeholder="Enter number of pages"
          min="1"
          max="5000"
          data-testid="input-pages"
          aria-required="true"
        />
        <div
          *ngIf="showError('number_of_pages')"
          data-testid="error-pages"
          class="error"
          aria-live="polite"
        >
          Number of pages must be between 1 and 5000.
        </div>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        [disabled]="bookForm.invalid"
        data-testid="btn-submit-book"
      >
        Add Book
      </button>
    </form>

    <!-- ─────────────────────────── Data Grid ──────────────────────────────── -->
    <table
      *ngIf="books.length"
      data-testid="data-grid-books"
      aria-label="Submitted books"
    >
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Author</th>
          <th>ISBN</th>
          <th>Publication&nbsp;Date</th>
          <th>Pages</th>
        </tr>
      </thead>
      <tbody>
        <tr
          *ngFor="let book of books; trackBy: trackById"
          [attr.data-testid]="'data-grid-row-' + book.id"
        >
          <td [attr.data-testid]="'data-grid-cell-id-' + book.id">
            {{ book.id }}
          </td>
          <td [attr.data-testid]="'data-grid-cell-title-' + book.id">
            {{ book.title }}
          </td>
          <td [attr.data-testid]="'data-grid-cell-author-' + book.id">
            {{ book.author }}
          </td>
          <td [attr.data-testid]="'data-grid-cell-isbn-' + book.id">
            {{ book.isbn }}
          </td>
          <td [attr.data-testid]="'data-grid-cell-publication-date-' + book.id">
            {{ book.publication_date }}
          </td>
          <td [attr.data-testid]="'data-grid-cell-pages-' + book.id">
            {{ book.number_of_pages }}
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [
    `
      form {
        display: grid;
        gap: 1rem;
        max-width: 22rem;
        margin-block-end: 2rem;
      }
      .error {
        font-size: 0.875rem;
        color: #c33;
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
        text-align: left;
      }
      th {
        background: #f3f3f3;
      }
    `,
  ],
})
export class O3Component implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  /** Reactive form with validation rules */
  readonly bookForm: FormGroup = this.fb.group({
    title: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    ],
    author: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(60)],
    ],
    isbn: ['', [Validators.required, isbnValidator]],
    publication_date: [
      this.today,
      [Validators.required, notFutureDateValidator],
    ],
    number_of_pages: [
      '',
      [
        Validators.required,
        Validators.min(1),
        Validators.max(5000),
        Validators.pattern('^[0-9]+$'),
      ],
    ],
  });

  /** In-memory list of books displayed in the grid */
  books: Book[] = [];

  /** GET today in YYYY-MM-DD */
  get today(): string {
    return new Date().toISOString().substring(0, 10);
  }

  ngOnInit(): void {
    this.fetchBooks();
  }

  /** Helper: should an error message be shown? */
  showError(controlName: keyof BookInput): boolean {
    const ctrl = this.bookForm.get(controlName);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  /** Submit new book to API */
  onSubmit(): void {
    if (this.bookForm.invalid) return;

    const payload: BookInput = this.bookForm.value;
    this.http.post<Book>('http://localhost:5000/books', payload).subscribe({
      next: (created) => {
        // Add new book to top of list
        this.books.unshift(created);
        // Reset form
        this.bookForm.reset({
          publication_date: this.today,
        });
        this.bookForm.markAsPristine();
      },
      error: (err) => {
        // Real app: show toast or similar; here just console
        console.error('Failed to add book:', err);
      },
    });
  }

  /** Retrieve existing books */
  private fetchBooks(): void {
    this.http
      .get<Book[]>('http://localhost:5000/books')
      .subscribe((list) => (this.books = list ?? []));
  }

  trackById(_: number, book: Book) {
    return book.id;
  }
}
