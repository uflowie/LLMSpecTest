import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// --- Interfaces based on OpenAPI spec ---
interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publication_date: string; // YYYY-MM-DD from API
  number_of_pages: number;
}

interface BookInput {
  title: string;
  author: string;
  isbn: string;
  publication_date: string; // YYYY-MM-DD for API
  number_of_pages: number;
}

// --- Custom Validator for Publication Date ---
export function notFutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Handled by 'required' validator if the field is mandatory
    }
    // The value from <input type="date"> is a string in 'YYYY-MM-DD' format.
    // Create Date objects for comparison, ensuring they are at the start of the day (midnight) in the local timezone.
    const parts = control.value.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JavaScript Date month is 0-indexed
    const day = parseInt(parts[2], 10);

    const selectedDate = new Date(year, month, day);
    // selectedDate is now at midnight local time for the given date.

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to the start of the day in local timezone.

    if (selectedDate > today) {
      return { futureDate: true };
    }
    return null;
  };
}

// --- GeminiComponent ---
@Component({
  selector: 'app-gemini', // Per instructions, component name implies class name 'GeminiComponent'
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [DatePipe], // DatePipe for formatting dates in the template's data grid
  template: `
    <div class="container">
      <h1>Book Management</h1>

      <div class="form-container" data-testid="book-form-section">
        <h2>Add New Book</h2>
        <form [formGroup]="bookForm" (ngSubmit)="onSubmit()">
          <div class="form-field">
            <label for="title">Book Title</label>
            <input type="text" id="title" formControlName="title" data-testid="input-title" placeholder="Enter book title">
            <div *ngIf="f['title'].invalid && (f['title'].dirty || f['title'].touched)" class="error-message" data-testid="error-title">
              <small *ngIf="f['title'].errors?.['required']">Title is required.</small>
              <small *ngIf="f['title'].errors?.['minlength'] || f['title'].errors?.['maxlength']">Title must be between 2 and 100 characters.</small>
            </div>
          </div>

          <div class="form-field">
            <label for="author">Author Name</label>
            <input type="text" id="author" formControlName="author" data-testid="input-author" placeholder="Enter author name">
            <div *ngIf="f['author'].invalid && (f['author'].dirty || f['author'].touched)" class="error-message" data-testid="error-author">
              <small *ngIf="f['author'].errors?.['required']">Author name is required.</small>
              <small *ngIf="f['author'].errors?.['minlength'] || f['author'].errors?.['maxlength']">Author name must be between 2 and 60 characters.</small>
            </div>
          </div>

          <div class="form-field">
            <label for="isbn">ISBN Number</label>
            <input type="text" id="isbn" formControlName="isbn" data-testid="input-isbn" placeholder="Enter 13-digit ISBN number">
            <div *ngIf="f['isbn'].invalid && (f['isbn'].dirty || f['isbn'].touched)" class="error-message" data-testid="error-isbn">
              <small *ngIf="f['isbn'].errors?.['required']">ISBN is required.</small>
              <small *ngIf="f['isbn'].errors?.['pattern']">ISBN must contain exactly 13 numeric digits.</small>
            </div>
          </div>

          <div class="form-field">
            <label for="publication_date">Publication Date</label>
            <input type="date" id="publication_date" formControlName="publication_date" data-testid="input-publication-date">
            <div *ngIf="f['publication_date'].invalid && (f['publication_date'].dirty || f['publication_date'].touched)" class="error-message" data-testid="error-publication-date">
              <small *ngIf="f['publication_date'].errors?.['required']">Publication Date is required.</small>
              <small *ngIf="f['publication_date'].errors?.['futureDate']">Publication Date cannot be in the future.</small>
            </div>
          </div>

          <div class="form-field">
            <label for="number_of_pages">Number of Pages</label>
            <input type="number" id="number_of_pages" formControlName="number_of_pages" data-testid="input-pages" placeholder="Enter number of pages">
            <div *ngIf="f['number_of_pages'].invalid && (f['number_of_pages'].dirty || f['number_of_pages'].touched)" class="error-message" data-testid="error-pages">
              <small *ngIf="f['number_of_pages'].errors?.['required']">Number of pages is required.</small>
              <small *ngIf="f['number_of_pages'].errors?.['min'] || f['number_of_pages'].errors?.['max'] || f['number_of_pages'].errors?.['pattern']">Number of pages must be between 1 and 5000.</small>
            </div>
          </div>

          <button type="submit" [disabled]="bookForm.invalid" data-testid="btn-submit-book">Add Book</button>
        </form>
        <div *ngIf="submissionError" class="error-message api-error-message" data-testid="error-submission">
          Failed to add book: {{ submissionError }}
        </div>
      </div>

      <div class="grid-container" data-testid="data-grid-books-section">
        <h2>Book List</h2>
        <div *ngIf="isLoadingBooks" data-testid="loading-books-indicator">Loading books...</div>
        <div *ngIf="!isLoadingBooks && initialLoadError" class="error-message" data-testid="error-loading-books">
          Failed to load books: {{ initialLoadError }}
        </div>
        <div *ngIf="!isLoadingBooks && !initialLoadError && books.length === 0" data-testid="no-books-message">
          No books available. Add one using the form above.
        </div>

        <table *ngIf="!isLoadingBooks && !initialLoadError && books.length > 0" data-testid="data-grid-books">
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
            <tr *ngFor="let book of books" [attr.data-testid]="'data-grid-row-' + book.id">
              <td [attr.data-testid]="'data-grid-cell-id-' + book.id">{{ book.id }}</td>
              <td [attr.data-testid]="'data-grid-cell-title-' + book.id">{{ book.title }}</td>
              <td [attr.data-testid]="'data-grid-cell-author-' + book.id">{{ book.author }}</td>
              <td [attr.data-testid]="'data-grid-cell-isbn-' + book.id">{{ book.isbn }}</td>
              <td [attr.data-testid]="'data-grid-cell-publication-date-' + book.id">{{ book.publication_date | date:'yyyy-MM-dd' }}</td>
              <td [attr.data-testid]="'data-grid-cell-pages-' + book.id">{{ book.number_of_pages }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: Arial, Helvetica, sans-serif;
    }
    .container {
      margin: 20px auto;
      padding: 0 15px;
      max-width: 960px;
    }
    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
    }
    h2 {
      color: #444;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .form-container, .grid-container {
      background-color: #fdfdfd;
      padding: 25px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      margin-bottom: 30px;
    }
    .form-field {
      margin-bottom: 18px;
    }
    .form-field label {
      display: block;
      margin-bottom: 6px;
      font-weight: bold;
      color: #555;
      font-size: 0.95rem;
    }
    .form-field input[type="text"],
    .form-field input[type="date"],
    .form-field input[type="number"] {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 1rem;
      transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }
    .form-field input:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 0.1rem rgba(0,123,255,.25);
      outline: none;
    }
    .error-message {
      color: #dc3545; /* Bootstrap danger color */
      font-size: 0.875em;
      margin-top: 6px;
    }
    .error-message small {
      display: block; /* Ensure each validation message for a field is on a new line if needed */
    }
    .api-error-message {
      margin-top: 15px;
      padding: 10px;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
    }
    button[type="submit"] {
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1.05rem;
      transition: background-color 0.15s ease-in-out;
    }
    button[type="submit"]:hover:not(:disabled) {
      background-color: #0056b3;
    }
    button[type="submit"]:disabled {
      background-color: #adb5bd; /* Bootstrap secondary/disabled color */
      cursor: not-allowed;
      opacity: 0.65;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      border: 1px solid #dee2e6; /* Bootstrap table border color */
      padding: 12px;
      text-align: left;
      vertical-align: middle;
    }
    th {
      background-color: #f8f9fa; /* Bootstrap light grey background */
      font-weight: bold;
      color: #212529; /* Bootstrap dark text color */
    }
    tbody tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    tbody tr:hover {
      background-color: #e9ecef; /* Bootstrap hover color */
    }
  `]
})
export class GeminiComponent implements OnInit, OnDestroy {
  bookForm!: FormGroup;
  books: Book[] = [];
  isLoadingBooks = false;
  initialLoadError: string | null = null;
  submissionError: string | null = null;

  private readonly apiBaseUrl = 'http://localhost:5000';
  private componentSubscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
    // DatePipe is provided and used in the template, no need to inject here unless used in TS code
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.fetchBooks();
  }

  private initializeForm(): void {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      isbn: ['', [Validators.required, Validators.pattern('^[0-9]{13}$')]],
      publication_date: [this.getFormattedTodayDateString(), [Validators.required, notFutureDateValidator()]],
      number_of_pages: [null, [Validators.required, Validators.min(1), Validators.max(5000), Validators.pattern('^[0-9]+$')]]
    });
  }

  // Getter for easy access to form controls in the template
  get f() { return this.bookForm.controls; }

  private getFormattedTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2); // Months are 0-indexed
    const day = ('0' + today.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  fetchBooks(): void {
    this.isLoadingBooks = true;
    this.initialLoadError = null;
    const booksSubscription = this.http.get<Book[]>(`${this.apiBaseUrl}/books`)
      .pipe(
        catchError(error => {
          this.initialLoadError = this.extractErrorMessage(error);
          this.isLoadingBooks = false;
          return throwError(() => new Error(this.initialLoadError || 'Failed to load books.'));
        })
      )
      .subscribe({
        next: (booksData) => {
          this.books = booksData; // API returns newest first as per its spec
          this.isLoadingBooks = false;
        },
        // Error already handled by catchError
      });
    this.componentSubscriptions.add(booksSubscription);
  }

  onSubmit(): void {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched(); // Trigger validation messages for all fields
      return;
    }

    this.submissionError = null;
    const bookData: BookInput = {
      ...this.bookForm.value,
      // Ensure number_of_pages is an integer
      number_of_pages: parseInt(this.bookForm.value.number_of_pages, 10)
    };

    const addSubscription = this.http.post<Book>(`${this.apiBaseUrl}/books`, bookData)
      .pipe(
        catchError(error => {
          this.submissionError = this.extractErrorMessage(error);
          return throwError(() => new Error(this.submissionError || 'Failed to submit book.'));
        })
      )
      .subscribe({
        next: (newBook) => {
          // Add the new book to the top of the list for immediate UI update
          this.books.unshift(newBook);
          this.bookForm.reset();
          // Reset publication_date to today's date after clearing
          this.f['publication_date'].setValue(this.getFormattedTodayDateString());
          // Optionally, to maintain pristine state for other fields:
          // Object.keys(this.f).forEach(key => {
          //   this.f[key].setErrors(null);
          //   this.f[key].markAsPristine();
          //   this.f[key].markAsUntouched();
          // });
          // this.bookForm.updateValueAndValidity();
        },
        // Error already handled by catchError
      });
    this.componentSubscriptions.add(addSubscription);
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    if (error.error) {
      if (error.error.errors && typeof error.error.errors === 'object') {
        // Handle ValidationErrorResponse: { errors: { fieldName: ["message1"] } }
        const fieldErrors = Object.entries(error.error.errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('; ');
        return `Validation issues: ${fieldErrors}`;
      }
      if (error.error.error && typeof error.error.error === 'string') {
        // Handle ErrorResponse: { error: "message" }
        return error.error.error;
      }
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }

  ngOnDestroy(): void {
    this.componentSubscriptions.unsubscribe();
  }
}
