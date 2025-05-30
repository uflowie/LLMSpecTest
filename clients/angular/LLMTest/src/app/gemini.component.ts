import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Subscription, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

// --- INTERFACE ---
interface Book {
  id?: number; // Optional: not present for new books before submission, assigned by backend
  title: string;
  author: string;
  isbn: string;
  publication_date: string; // YYYY-MM-DD
  number_of_pages: number;
}

// --- CUSTOM VALIDATOR ---
/**
 * Custom validator to check if the date is not in the future.
 * @param control - The AbstractControl to validate.
 * @returns ValidationErrors | null - An error object if invalid, otherwise null.
 */
function notFutureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null; // Let 'required' validator handle empty values
  }
  const inputDate = new Date(control.value);
  const today = new Date();

  // Normalize by setting time to 00:00:00.000 to compare dates only
  inputDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (inputDate > today) {
    return { futureDate: true };
  }
  return null;
}

// --- COMPONENT ---
@Component({
  selector: 'app-gemini',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule // For a standalone component, HttpClientModule needs to be imported.
                     // In a larger app, you might use provideHttpClient() in bootstrapApplication.
  ],
  template: `
    <div class="book-management-container">
      <section class="form-section">
        <h2>Add New Book</h2>
        <form [formGroup]="bookForm" (ngSubmit)="onSubmit()">
          <div class="form-field">
            <label for="title">Book Title</label>
            <input id="title" type="text" formControlName="title" data-testid="input-title" placeholder="Enter book title">
            <div *ngIf="isControlInvalid('title')" class="error-message" data-testid="error-title">
              <span *ngIf="bookForm.get('title')?.errors?.['required']">Title is required.</span>
              <span *ngIf="bookForm.get('title')?.errors?.['minlength'] || bookForm.get('title')?.errors?.['maxlength']">Title must be between 2 and 100 characters.</span>
            </div>
          </div>

          <div class="form-field">
            <label for="author">Author Name</label>
            <input id="author" type="text" formControlName="author" data-testid="input-author" placeholder="Enter author name">
            <div *ngIf="isControlInvalid('author')" class="error-message" data-testid="error-author">
              <span *ngIf="bookForm.get('author')?.errors?.['required']">Author name is required.</span>
              <span *ngIf="bookForm.get('author')?.errors?.['minlength'] || bookForm.get('author')?.errors?.['maxlength']">Author name must be between 2 and 60 characters.</span>
            </div>
          </div>

          <div class="form-field">
            <label for="isbn">ISBN Number</label>
            <input id="isbn" type="text" formControlName="isbn" data-testid="input-isbn" placeholder="Enter 13-digit ISBN number">
            <div *ngIf="isControlInvalid('isbn')" class="error-message" data-testid="error-isbn">
              <span *ngIf="bookForm.get('isbn')?.errors?.['required']">ISBN is required.</span>
              <span *ngIf="bookForm.get('isbn')?.errors?.['pattern']">ISBN must contain exactly 13 numeric digits.</span>
            </div>
          </div>

          <div class="form-field">
            <label for="publication_date">Publication Date</label>
            <input id="publication_date" type="date" formControlName="publication_date" data-testid="input-publication-date">
            <div *ngIf="isControlInvalid('publication_date')" class="error-message" data-testid="error-publication-date">
              <span *ngIf="bookForm.get('publication_date')?.errors?.['required']">Publication Date is required.</span>
              <span *ngIf="bookForm.get('publication_date')?.errors?.['futureDate']">Publication Date cannot be in the future.</span>
            </div>
          </div>

          <div class="form-field">
            <label for="number_of_pages">Number of Pages</label>
            <input id="number_of_pages" type="number" formControlName="number_of_pages" data-testid="input-pages" placeholder="Enter number of pages">
            <div *ngIf="isControlInvalid('number_of_pages')" class="error-message" data-testid="error-pages">
              <span *ngIf="bookForm.get('number_of_pages')?.errors?.['required']">Number of pages is required.</span>
              <span *ngIf="bookForm.get('number_of_pages')?.errors?.['min'] || bookForm.get('number_of_pages')?.errors?.['max']">Number of pages must be between 1 and 5000.</span>
            </div>
          </div>

          <button type="submit" data-testid="btn-submit-book" [disabled]="bookForm.invalid || submitting">Add Book</button>
          <div *ngIf="submissionError" class="error-message submission-error">
            Error submitting book: {{ submissionError }}
          </div>
        </form>
      </section>

      <hr class="section-divider">

      <section class="grid-section">
        <h2>Book Collection</h2>
        <div *ngIf="isLoadingBooks" class="loading-message">Loading books...</div>
        <div *ngIf="!isLoadingBooks && books.length === 0 && !initialLoadError" class="empty-message">No books in the collection yet. Add one above!</div>
        <div *ngIf="initialLoadError" class="error-message">Failed to load books: {{ initialLoadError }}</div>

        <div *ngIf="!isLoadingBooks && books.length > 0" class="grid-container" data-testid="data-grid-books">
          <table>
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
                <td [attr.data-testid]="'data-grid-cell-publication-date-' + book.id">{{ book.publication_date }}</td>
                <td [attr.data-testid]="'data-grid-cell-pages-' + book.id">{{ book.number_of_pages }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .book-management-container {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 8px;
      background-color: #f9f9f9;
    }
    h2 {
      color: #333;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .form-section, .grid-section {
      margin-bottom: 30px;
    }
    .form-field {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
      color: #555;
    }
    input[type="text"],
    input[type="date"],
    input[type="number"] {
      width: calc(100% - 22px); /* Full width minus padding and border */
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1em;
    }
    input.ng-invalid.ng-touched {
      border-color: #dc3545; /* Red border for invalid touched fields */
    }
    .error-message {
      color: #dc3545; /* Red color for error messages */
      font-size: 0.875em;
      margin-top: 5px;
    }
    .submission-error {
        margin-top: 10px;
    }
    button[type="submit"] {
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      transition: background-color 0.3s ease;
    }
    button[type="submit"]:hover:not(:disabled) {
      background-color: #0056b3;
    }
    button[type="submit"]:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    .section-divider {
      border: 0;
      height: 1px;
      background-color: #ddd;
      margin: 30px 0;
    }
    .grid-container {
      overflow-x: auto; /* For responsiveness on smaller screens */
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
      vertical-align: middle;
    }
    th {
      background-color: #e9ecef;
      font-weight: bold;
      color: #333;
    }
    tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    .loading-message, .empty-message {
        text-align: center;
        padding: 20px;
        color: #555;
        font-style: italic;
    }
  `]
})
export class GeminiComponent implements OnInit, OnDestroy {
  bookForm!: FormGroup;
  books: Book[] = [];
  isLoadingBooks = false;
  initialLoadError: string | null = null;
  submitting = false;
  submissionError: string | null = null;

  private readonly apiBaseUrl = '/api'; // Replace with actual API base URL if different
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    this.initForm();
    this.loadBooks();
  }

  private initForm(): void {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      isbn: ['', [Validators.required, Validators.pattern('^[0-9]{13}$')]], // Exactly 13 numeric digits
      publication_date: [this.getTodayDateString(), [Validators.required, notFutureDateValidator]],
      number_of_pages: ['', [Validators.required, Validators.min(1), Validators.max(5000)]]
    });
  }

  private getTodayDateString(): string {
    return formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.bookForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private loadBooks(): void {
    this.isLoadingBooks = true;
    this.initialLoadError = null;
    const booksSub = this.http.get<Book[]>(`${this.apiBaseUrl}/books`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.initialLoadError = this.formatErrorMessage(error);
          return throwError(() => new Error('Failed to load books. ' + this.initialLoadError));
        }),
        finalize(() => this.isLoadingBooks = false)
      )
      .subscribe({
        next: (loadedBooks) => {
          this.books = loadedBooks; // Assuming API returns newest first as per spec
        },
        error: (err) => console.error(err) // Error already handled by catchError for UI
      });
    this.subscriptions.add(booksSub);
  }

  onSubmit(): void {
    if (this.bookForm.invalid) {
      // Mark all fields as touched to display validation errors if not already shown
      this.bookForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.submissionError = null;
    const newBookData = this.bookForm.value;

    const createSub = this.http.post<Book>(`${this.apiBaseUrl}/books`, newBookData)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.submissionError = this.formatErrorMessage(error);
          return throwError(() => new Error('Failed to submit book. ' + this.submissionError));
        }),
        finalize(() => this.submitting = false)
      )
      .subscribe({
        next: (createdBook) => {
          this.books.unshift(createdBook); // Add new book to the top of the grid
          this.resetForm();
        },
        error: (err) => console.error(err) // Error already handled by catchError for UI
      });
    this.subscriptions.add(createSub);
  }

  private resetForm(): void {
    this.bookForm.reset();
    this.bookForm.patchValue({
      publication_date: this.getTodayDateString() // Reset date to today
    });
    // Manually reset touched/dirty state if needed for specific UI behavior after reset
    Object.keys(this.bookForm.controls).forEach(key => {
        this.bookForm.get(key)?.setErrors(null) ;
        this.bookForm.get(key)?.markAsPristine();
        this.bookForm.get(key)?.markAsUntouched();
    });
    this.bookForm.updateValueAndValidity();
  }

  private formatErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      return `Network error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      let message = `Server error (status ${error.status}): `;
      if (typeof error.error === 'string') {
        message += error.error;
      } else if (error.error && typeof error.error.message === 'string') {
        message += error.error.message;
      } else if (error.message) {
        message += error.message;
      } else {
        message += 'Unknown server error.';
      }
      return message;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
