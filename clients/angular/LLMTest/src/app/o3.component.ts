import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

/**
 * Stand-alone Angular component that fulfils the “Book Entry Form and Data Grid” specification.
 * Name: O3Component
 * Usage: add <app-o3></app-o3> (or whatever selector you choose) to any template in the host app.
 */
@Component({
  selector: 'app-o3',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  template: `
    <section class="o3-wrapper">
      <!-- 1. BOOK ENTRY FORM ------------------------------------------------>
      <form
        [formGroup]="bookForm"
        (ngSubmit)="onSubmit()"
        novalidate
        class="o3-form"
      >
        <!-- Title --------------------------------------------------------->
        <div class="o3-field">
          <label for="title" class="o3-label">Book Title</label>
          <input
            id="title"
            type="text"
            formControlName="title"
            placeholder="Enter book title"
            data-testid="input-title"
            class="o3-input"
          />
          <p
            class="o3-error"
            *ngIf="isInvalid('title')"
            data-testid="error-title"
          >
            Title must be between 2 and 100 characters.
          </p>
        </div>

        <!-- Author -------------------------------------------------------->
        <div class="o3-field">
          <label for="author" class="o3-label">Author Name</label>
          <input
            id="author"
            type="text"
            formControlName="author"
            placeholder="Enter author name"
            data-testid="input-author"
            class="o3-input"
          />
          <p
            class="o3-error"
            *ngIf="isInvalid('author')"
            data-testid="error-author"
          >
            Author name must be between 2 and 60 characters.
          </p>
        </div>

        <!-- ISBN ----------------------------------------------------------->
        <div class="o3-field">
          <label for="isbn" class="o3-label">ISBN Number</label>
          <input
            id="isbn"
            type="text"
            formControlName="isbn"
            placeholder="Enter 13-digit ISBN number"
            data-testid="input-isbn"
            class="o3-input"
          />
          <p
            class="o3-error"
            *ngIf="isInvalid('isbn')"
            data-testid="error-isbn"
          >
            ISBN must contain exactly 13 numeric digits.
          </p>
        </div>

        <!-- Publication Date ---------------------------------------------->
        <div class="o3-field">
          <label for="publication_date" class="o3-label">Publication Date</label>
          <input
            id="publication_date"
            type="date"
            formControlName="publication_date"
            data-testid="input-publication-date"
            class="o3-input"
          />
          <p
            class="o3-error"
            *ngIf="isInvalid('publication_date')"
            data-testid="error-publication-date"
          >
            Publication Date cannot be in the future.
          </p>
        </div>

        <!-- Number of Pages ----------------------------------------------->
        <div class="o3-field">
          <label for="number_of_pages" class="o3-label">Number of Pages</label>
          <input
            id="number_of_pages"
            type="number"
            formControlName="number_of_pages"
            placeholder="Enter number of pages"
            data-testid="input-pages"
            class="o3-input"
          />
          <p
            class="o3-error"
            *ngIf="isInvalid('number_of_pages')"
            data-testid="error-pages"
          >
            Number of pages must be between 1 and 5000.
          </p>
        </div>

        <!-- Submit Button -------------------------------------------------->
        <button
          type="submit"
          data-testid="btn-submit-book"
          [disabled]="bookForm.invalid"
          class="o3-btn"
        >
          Add Book
        </button>
      </form>

      <!-- 2. DATA GRID ---------------------------------------------------->
      <table
        class="o3-grid"
        aria-label="Books data grid"
        data-testid="data-grid-books"
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Author</th>
            <th>ISBN</th>
            <th>Publication Date</th>
            <th>Pages</th>
          </tr>
        </thead>
        <tbody>
          <tr
            *ngFor="let b of books()"
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
              {{ b.publication_date }}
            </td>
            <td [attr.data-testid]="'data-grid-cell-pages-' + b.id">
              {{ b.number_of_pages }}
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  `,
  styles: [
    `
      /* Basic, unopinionated styling for clarity and accessibility */
      .o3-wrapper {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
        font-family: system-ui, sans-serif;
      }
      .o3-form {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 1rem 1.5rem;
        margin-bottom: 2rem;
      }
      .o3-field {
        display: flex;
        flex-direction: column;
      }
      .o3-label {
        margin-bottom: 0.25rem;
        font-weight: 600;
      }
      .o3-input {
        padding: 0.5rem 0.75rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
      }
      .o3-error {
        color: #b91c1c;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }
      .o3-btn {
        grid-column: 1 / -1;
        padding: 0.625rem 1.25rem;
        font-size: 1rem;
        background: #2563eb;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .o3-btn[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .o3-grid {
        width: 100%;
        border-collapse: collapse;
      }
      .o3-grid th,
      .o3-grid td {
        padding: 0.5rem;
        border: 1px solid #e5e7eb;
        text-align: left;
        font-size: 0.9375rem;
      }
      .o3-grid thead {
        background: #f3f4f6;
      }
    `,
  ],
})
export class O3Component implements OnInit {
  /** Reactive form group for book entry */
  readonly bookForm: FormGroup;

  /** Signal-based state holding the book list (newest first) */
  readonly books = signal<Book[]>([]);

  private readonly todayISO = new Date().toISOString().split('T')[0];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    // Build the form with validation rules
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
        this.todayISO,
        [Validators.required, this.noFutureDateValidator.bind(this)],
      ],
      number_of_pages: [
        '',
        [Validators.required, Validators.min(1), Validators.max(5000)],
      ],
    });
  }

  ngOnInit(): void {
    // Fetch existing books (API returns newest first)
    this.http.get<Book[]>('/books').subscribe({
      next: (data) => this.books.set(data ?? []),
      error: (err) => console.error('Failed to load books', err),
    });
  }

  /**
   * Submit handler: POST new book then update grid
   */
  onSubmit(): void {
    if (this.bookForm.invalid) {
      return;
    }

    const payload = this.bookForm.value as Omit<Book, 'id'>;

    this.http.post<Book>('/books', payload).subscribe({
      next: (created) => {
        /* Prepend the newly created book so it appears at the top */
        this.books.set([created, ...this.books()]);
        this.resetForm(); // clear inputs (publication date resets to today)
      },
      error: (err) => console.error('Book creation failed', err),
    });
  }

  /**
   * Determine if a form control is invalid *and* has been interacted with
   */
  isInvalid(controlName: keyof Omit<Book, 'id'>): boolean {
    const ctl = this.bookForm.controls[controlName] as AbstractControl;
    return ctl.invalid && (ctl.dirty || ctl.touched);
  }

  /**
   * Custom validator ensuring the date is not in the future
   */
  private noFutureDateValidator(control: AbstractControl) {
    const value = control.value as string;
    return value && value > this.todayISO ? { future: true } : null;
  }

  /** After successful submission, reset everything to pristine */
  private resetForm(): void {
    this.bookForm.reset({
      title: '',
      author: '',
      isbn: '',
      publication_date: this.todayISO,
      number_of_pages: '',
    });
    this.bookForm.markAsPristine();
  }
}

/* -------------------------------------------------------------------------- */
/*                                Model types                                 */
/* -------------------------------------------------------------------------- */
interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string; // 13 digits
  publication_date: string; // YYYY-MM-DD
  number_of_pages: number;
}
