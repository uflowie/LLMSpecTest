import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaces based on OpenAPI specification
interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publication_date: string; // Format: YYYY-MM-DD
  number_of_pages: number;
}

interface BookInput {
  title: string;
  author: string;
  isbn: string;
  publication_date: string; // Format: YYYY-MM-DD
  number_of_pages: number | null; // Allow null for initial empty state in form
}

interface ApiValidationErrorDetail {
  [key: string]: string[]; // Field name maps to a list of error messages
}

interface ValidationErrorResponse { // As per OpenAPI spec for 400 errors
  errors: ApiValidationErrorDetail;
}

interface ErrorResponse { // As per OpenAPI spec for general 400 errors
  error: string;
}

@Component({
  selector: 'app-book-management',
  standalone: true,
  imports: [
    CommonModule,     // For *ngIf, *ngFor, DatePipe, etc.
    FormsModule,      // For template-driven forms (ngModel, NgForm)
    HttpClientModule  // For HttpClient service
  ],
  providers: [DatePipe], // For formatting date for the 'max' attribute of date input and display
  template: `
    <div class="book-management-container">
      <h1 data-testid="component-title">Book Management</h1>

      <section aria-labelledby="form-heading">
        <h2 id="form-heading" data-testid="form-title">Add New Book</h2>
        <form #bookForm="ngForm" (ngSubmit)="onSubmit(bookForm)" novalidate>
          <div *ngIf="generalApiError" class="error-message api-error-general" data-testid="error-api-general" role="alert">
            <strong>Error:</strong> {{ generalApiError }}
          </div>

          <div class="form-field">
            <label for="title">Book Title</label>
            <input type="text" id="title" name="title" [(ngModel)]="bookModel.title"
                   placeholder="Enter book title" data-testid="input-title"
                   required minlength="2" maxlength="100" #titleInput="ngModel"
                   aria-describedby="error-title error-title-api">
            <div *ngIf="titleInput.invalid && (titleInput.dirty || titleInput.touched || bookForm.submitted)"
                 class="error-message" data-testid="error-title" id="error-title" role="alert">
              <ng-container *ngIf="titleInput.errors?.['required']">Book Title is required.</ng-container>
              <ng-container *ngIf="titleInput.errors?.['minlength'] || titleInput.errors?.['maxlength']">Title must be between 2 and 100 characters.</ng-container>
            </div>
            <div *ngIf="fieldApiErrors.title" class="error-message api-error" data-testid="error-title-api" id="error-title-api" role="alert">
              <div *ngFor="let msg of fieldApiErrors.title">{{ msg }}</div>
            </div>
          </div>

          <div class="form-field">
            <label for="author">Author Name</label>
            <input type="text" id="author" name="author" [(ngModel)]="bookModel.author"
                   placeholder="Enter author name" data-testid="input-author"
                   required minlength="2" maxlength="60" #authorInput="ngModel"
                   aria-describedby="error-author error-author-api">
            <div *ngIf="authorInput.invalid && (authorInput.dirty || authorInput.touched || bookForm.submitted)"
                 class="error-message" data-testid="error-author" id="error-author" role="alert">
              <ng-container *ngIf="authorInput.errors?.['required']">Author Name is required.</ng-container>
              <ng-container *ngIf="authorInput.errors?.['minlength'] || authorInput.errors?.['maxlength']">Author name must be between 2 and 60 characters.</ng-container>
            </div>
            <div *ngIf="fieldApiErrors.author" class="error-message api-error" data-testid="error-author-api" id="error-author-api" role="alert">
              <div *ngFor="let msg of fieldApiErrors.author">{{ msg }}</div>
            </div>
          </div>

          <div class="form-field">
            <label for="isbn">ISBN Number</label>
            <input type="text" id="isbn" name="isbn" [(ngModel)]="bookModel.isbn"
                   placeholder="Enter 13-digit ISBN number" data-testid="input-isbn"
                   required pattern="^[0-9]{13}$" #isbnInput="ngModel"
                   aria-describedby="error-isbn error-isbn-api">
            <div *ngIf="isbnInput.invalid && (isbnInput.dirty || isbnInput.touched || bookForm.submitted)"
                 class="error-message" data-testid="error-isbn" id="error-isbn" role="alert">
              <ng-container *ngIf="isbnInput.errors?.['required']">ISBN Number is required.</ng-container>
              <ng-container *ngIf="isbnInput.errors?.['pattern']">ISBN must contain exactly 13 numeric digits.</ng-container>
            </div>
             <div *ngIf="fieldApiErrors.isbn" class="error-message api-error" data-testid="error-isbn-api" id="error-isbn-api" role="alert">
              <div *ngFor="let msg of fieldApiErrors.isbn">{{ msg }}</div>
            </div>
          </div>

          <div class="form-field">
            <label for="publication_date">Publication Date</label>
            <input type="date" id="publication_date" name="publication_date" [(ngModel)]="bookModel.publication_date"
                   data-testid="input-publication-date"
                   required [max]="today" #publicationDateInput="ngModel"
                   aria-describedby="error-publication-date error-publication-date-api">
            <div *ngIf="publicationDateInput.invalid && (publicationDateInput.dirty || publicationDateInput.touched || bookForm.submitted)"
                 class="error-message" data-testid="error-publication-date" id="error-publication-date" role="alert">
              <ng-container *ngIf="publicationDateInput.errors?.['required']">Publication Date is required.</ng-container>
              <ng-container *ngIf="publicationDateInput.errors?.['max']">Publication Date cannot be in the future.</ng-container>
            </div>
            <div *ngIf="fieldApiErrors.publication_date" class="error-message api-error" data-testid="error-publication-date-api" id="error-publication-date-api" role="alert">
              <div *ngFor="let msg of fieldApiErrors.publication_date">{{ msg }}</div>
            </div>
          </div>

          <div class="form-field">
            <label for="number_of_pages">Number of Pages</label>
            <input type="number" id="number_of_pages" name="number_of_pages" [(ngModel)]="bookModel.number_of_pages"
                   placeholder="Enter number of pages" data-testid="input-pages"
                   required min="1" max="5000" #pagesInput="ngModel"
                   aria-describedby="error-pages error-pages-api">
            <div *ngIf="pagesInput.invalid && (pagesInput.dirty || pagesInput.touched || bookForm.submitted)"
                 class="error-message" data-testid="error-pages" id="error-pages" role="alert">
              <ng-container *ngIf="pagesInput.errors?.['required']">Number of Pages is required.</ng-container>
              <ng-container *ngIf="pagesInput.errors?.['min'] || pagesInput.errors?.['max']">Number of pages must be between 1 and 5000.</ng-container>
            </div>
            <div *ngIf="fieldApiErrors.number_of_pages" class="error-message api-error" data-testid="error-pages-api" id="error-pages-api" role="alert">
              <div *ngFor="let msg of fieldApiErrors.number_of_pages">{{ msg }}</div>
            </div>
          </div>

          <button type="submit" data-testid="btn-submit-book" [disabled]="bookForm.invalid || isLoading">
            {{ isLoading ? 'Adding...' : 'Add Book' }}
          </button>
        </form>
      </section>

      <hr>

      <section aria-labelledby="grid-heading">
        <h2 id="grid-heading" data-testid="grid-title">Book List</h2>
        <div *ngIf="isLoadingBooks" data-testid="loading-books-message" role="status" aria-live="polite">Loading books...</div>
        <div *ngIf="getBooksError" class="error-message api-error-general" data-testid="error-get-books" role="alert">
          Error loading books: {{ getBooksError }}
        </div>

        <div *ngIf="!isLoadingBooks && books.length === 0 && !getBooksError" data-testid="no-books-message">
          No books available. Add one using the form above.
        </div>

        <table data-testid="data-grid-books" *ngIf="!isLoadingBooks && books.length > 0" aria-label="List of Books">
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
            <tr *ngFor="let book of books; trackBy: trackBookId" [attr.data-testid]="'data-grid-row-' + book.id">
              <td [attr.data-testid]="'data-grid-cell-id-' + book.id">{{ book.id }}</td>
              <td [attr.data-testid]="'data-grid-cell-title-' + book.id">{{ book.title }}</td>
              <td [attr.data-testid]="'data-grid-cell-author-' + book.id">{{ book.author }}</td>
              <td [attr.data-testid]="'data-grid-cell-isbn-' + book.id">{{ book.isbn }}</td>
              <td [attr.data-testid]="'data-grid-cell-publication-date-' + book.id">{{ book.publication_date | date:'yyyy-MM-dd' }}</td>
              <td [attr.data-testid]="'data-grid-cell-pages-' + book.id">{{ book.number_of_pages }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  `,
  styles: [`
    .book-management-container {
      font-family: Arial, Helvetica, sans-serif;
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 { text-align: center; color: #333; margin-bottom: 20px; }
    h2 {
      color: #444;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
      margin-top: 30px;
      margin-bottom: 20px;
    }
    .form-field { margin-bottom: 20px; }
    .form-field label {
      display: block;
      margin-bottom: 6px;
      font-weight: bold;
      color: #333;
      font-size: 0.95em;
    }
    .form-field input[type="text"],
    .form-field input[type="date"],
    .form-field input[type="number"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 1em;
    }
    .form-field input:focus {
      border-color: #007bff;
      outline: none;
      box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
    }
    /* Style for invalid inputs after interaction */
    .form-field input.ng-invalid.ng-touched,
    .form-field input.ng-invalid.ng-dirty {
      border-color: #D8000C;
    }
    .error-message {
      color: #D8000C;
      font-size: 0.85em;
      margin-top: 5px;
      padding: 3px 0;
    }
    .api-error div { margin-bottom: 3px; }
    .api-error-general {
      background-color: #FFD2D2;
      color: #D8000C;
      border: 1px solid #D8000C;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    button[type="submit"] {
      background-color: #007bff;
      color: white;
      padding: 12px 18px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      transition: background-color 0.2s ease-in-out;
      display: inline-block; /* Align with other form elements if needed */
    }
    button[type="submit"]:hover:not(:disabled) { background-color: #0056b3; }
    button[type="submit"]:disabled {
      background-color: #aeccec; /* Lighter blue for disabled */
      cursor: not-allowed;
      opacity: 0.8;
    }
    hr { margin: 40px 0; border: 0; border-top: 1px solid #ddd; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px 12px;
      text-align: left;
      font-size: 0.9em;
      vertical-align: top; /* Align content to top for readability */
    }
    th {
      background-color: #007bff;
      color: white;
      font-weight: bold;
      font-size: 0.95em;
    }
    tbody tr:nth-child(even) { background-color: #f2f2f2; }
    tbody tr:hover { background-color: #e9ecef; }
    [data-testid="loading-books-message"], [data-testid="no-books-message"] {
      margin-top:20px;
      padding: 10px;
      font-style: italic;
      color: #555;
      background-color: #e9ecef;
      border-radius: 4px;
      text-align: center;
    }
  `]
})
export class GeminiComponent implements OnInit {
  // ViewChild to get a reference to the form, useful for manual operations if needed.
  @ViewChild('bookForm', { static: false }) bookForm!: NgForm;

  private readonly apiUrl = 'http://localhost:5000/books';
  private http = inject(HttpClient);
  private datePipe = inject(DatePipe);

  // Model for the form, bound using ngModel
  bookModel: BookInput = this.getInitialBookModel();
  // Array to hold the list of books for the data grid
  books: Book[] = [];
  // Today's date in YYYY-MM-DD format for date input validation
  today: string = '';

  // Loading states
  isLoading: boolean = false; // For form submission
  isLoadingBooks: boolean = true; // Start with true for initial book list load

  // Error message holders
  getBooksError: string | null = null; // For errors during fetching book list
  generalApiError: string | null = null; // For general errors from POST request
  fieldApiErrors: ApiValidationErrorDetail = {}; // For field-specific errors from POST request

  ngOnInit(): void {
    const now = new Date();
    this.today = this.datePipe.transform(now, 'yyyy-MM-dd') || ''; // Set max date for publication_date input
    this.loadBooks(); // Load initial list of books
  }

  private getInitialBookModel(): BookInput {
    // Returns a fresh object for the form model, used for initialization and reset
    return {
      title: '',
      author: '',
      isbn: '',
      publication_date: '',
      number_of_pages: null,
    };
  }

  loadBooks(): void {
    this.isLoadingBooks = true;
    this.getBooksError = null;
    this.http.get<Book[]>(this.apiUrl)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.getBooksError = this.extractGeneralErrorMessage(error);
          // Return an empty observable or rethrow to complete the stream for the subscriber's error block
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (data: Book[]) => {
          this.books = data; // API is expected to return books newest first
          this.isLoadingBooks = false;
        },
        error: () => {
          // Error message is set in catchError, just ensure loading state is false
          this.isLoadingBooks = false;
        }
      });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      // If form is invalid, mark all fields as touched to trigger validation messages
      Object.keys(form.controls).forEach(field => {
        form.controls[field].markAsTouched({ onlySelf: true });
      });
      return;
    }

    this.isLoading = true;
    this.generalApiError = null;
    this.fieldApiErrors = {};

    // Prepare payload, ensuring number_of_pages is a number.
    // Client-side validators (required, min=1) should ensure it's a valid number if not null.
    const payload: BookInput = {
      ...this.bookModel,
      number_of_pages: this.bookModel.number_of_pages !== null ? Number(this.bookModel.number_of_pages) : null,
    };

    this.http.post<Book>(this.apiUrl, payload, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    })
    .pipe(
      catchError((error: HttpErrorResponse) => {
        this.isLoading = false; // Stop loading indicator
        if (error.status === 400) {
          const errorBody = error.error;
          // Check for structured validation errors ({"errors": {"field": [...]}})
          if (errorBody && errorBody.errors && typeof errorBody.errors === 'object' && Object.keys(errorBody.errors).length > 0) {
            this.fieldApiErrors = errorBody.errors;
          }
          // Check for a general error message ({"error": "message"})
          // This can coexist with field errors or be standalone
          if (errorBody && errorBody.error && typeof errorBody.error === 'string') {
            this.generalApiError = errorBody.error;
          }
          // If no specific field errors and no general 'error' property, but it's a 400 from our API.
          if (Object.keys(this.fieldApiErrors).length === 0 && !this.generalApiError) {
             // Fallback for 400 if error structure is not as expected or empty
             this.generalApiError = 'An unspecified validation error occurred. Please check your input.';
          }
        } else { // Handle non-400 errors (e.g., 500, network issues already caught by extractGeneralErrorMessage logic)
          this.generalApiError = this.extractGeneralErrorMessage(error);
        }
        return throwError(() => error); // Propagate the error
      })
    )
    .subscribe({
      next: (newBook: Book) => {
        this.isLoading = false;
        this.books.unshift(newBook); // Add new book to the beginning of the array (top of the grid)

        // Reset form:
        // 1. Get a new, clean model instance for bookModel.
        this.bookModel = this.getInitialBookModel();
        // 2. Reset the form's state (validity, touched, dirty) and its control values to this new model.
        form.resetForm(this.getInitialBookModel());
      },
      error: () => {
        // Error handling (setting messages, isLoading=false) is done in catchError
        // This block is for any additional logic on error if needed, here just ensuring isLoading is false.
         this.isLoading = false;
      }
    });
  }

  private extractGeneralErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) { // Client-side or network error
      return `Network error: ${error.error.message}`;
    }
    // Server-side error
    if (error.error && typeof error.error.error === 'string') { // Standard ErrorResponse: {"error": "message"}
      return error.error.error;
    }
    if (typeof error.error === 'string' && error.error.length > 0 && error.error.length < 300) { // Plain text error from server
        return error.error;
    }
    // Fallback if the error structure is different
    return `Operation failed (Status: ${error.status} ${error.statusText || ''}). Please try again later.`;
  }

  // trackBy function for *ngFor in the books table to optimize rendering.
  trackBookId(index: number, book: Book): number {
    return book.id;
  }
}
