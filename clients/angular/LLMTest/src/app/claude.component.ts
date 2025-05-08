import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publication_date: string;
  number_of_pages: number;
}

interface ValidationErrorResponse {
  errors: {
    [key: string]: string[];
  };
}

@Component({
  selector: 'app-book-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  template: `
    <div class="container">
      <h1>Book Management</h1>

      <!-- Book Entry Form -->
      <form [formGroup]="bookForm" (ngSubmit)="onSubmit()" class="book-form">
        <h2>Add New Book</h2>

        <!-- Title Field -->
        <div class="form-group">
          <label for="title">Book Title</label>
          <input
            type="text"
            id="title"
            formControlName="title"
            data-testid="input-title"
            placeholder="Enter book title"
            (blur)="onBlur('title')"
            aria-describedby="title-error"
          >
          <div
            *ngIf="showError('title')"
            class="error-message"
            data-testid="error-title"
            id="title-error"
            role="alert"
          >
            Title must be between 2 and 100 characters.
          </div>
        </div>

        <!-- Author Field -->
        <div class="form-group">
          <label for="author">Author Name</label>
          <input
            type="text"
            id="author"
            formControlName="author"
            data-testid="input-author"
            placeholder="Enter author name"
            (blur)="onBlur('author')"
            aria-describedby="author-error"
          >
          <div
            *ngIf="showError('author')"
            class="error-message"
            data-testid="error-author"
            id="author-error"
            role="alert"
          >
            Author name must be between 2 and 60 characters.
          </div>
        </div>

        <!-- ISBN Field -->
        <div class="form-group">
          <label for="isbn">ISBN Number</label>
          <input
            type="text"
            id="isbn"
            formControlName="isbn"
            data-testid="input-isbn"
            placeholder="Enter 13-digit ISBN number"
            (blur)="onBlur('isbn')"
            aria-describedby="isbn-error"
          >
          <div
            *ngIf="showError('isbn')"
            class="error-message"
            data-testid="error-isbn"
            id="isbn-error"
            role="alert"
          >
            ISBN must contain exactly 13 numeric digits.
          </div>
        </div>

        <!-- Publication Date Field -->
        <div class="form-group">
          <label for="publication_date">Publication Date</label>
          <input
            type="date"
            id="publication_date"
            formControlName="publication_date"
            data-testid="input-publication-date"
            (blur)="onBlur('publication_date')"
            aria-describedby="publication-date-error"
          >
          <div
            *ngIf="showError('publication_date')"
            class="error-message"
            data-testid="error-publication-date"
            id="publication-date-error"
            role="alert"
          >
            Publication Date cannot be in the future.
          </div>
        </div>

        <!-- Number of Pages Field -->
        <div class="form-group">
          <label for="number_of_pages">Number of Pages</label>
          <input
            type="number"
            id="number_of_pages"
            formControlName="number_of_pages"
            data-testid="input-pages"
            placeholder="Enter number of pages"
            (blur)="onBlur('number_of_pages')"
            aria-describedby="pages-error"
          >
          <div
            *ngIf="showError('number_of_pages')"
            class="error-message"
            data-testid="error-pages"
            id="pages-error"
            role="alert"
          >
            Number of pages must be between 1 and 5000.
          </div>
        </div>

        <button
          type="submit"
          data-testid="btn-submit-book"
          [disabled]="!bookForm.valid"
          aria-label="Add new book"
        >
          Add Book
        </button>
      </form>

      <!-- Data Grid -->
      <div class="book-grid">
        <h2>Book List</h2>
        <table data-testid="data-grid-books" aria-label="List of books">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Title</th>
              <th scope="col">Author</th>
              <th scope="col">ISBN</th>
              <th scope="col">Publication Date</th>
              <th scope="col">Number of Pages</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let book of books"
              [attr.data-testid]="'data-grid-row-' + book.id"
            >
              <td [attr.data-testid]="'data-grid-cell-id-' + book.id">{{ book.id }}</td>
              <td [attr.data-testid]="'data-grid-cell-title-' + book.id">{{ book.title }}</td>
              <td [attr.data-testid]="'data-grid-cell-author-' + book.id">{{ book.author }}</td>
              <td [attr.data-testid]="'data-grid-cell-isbn-' + book.id">{{ book.isbn }}</td>
              <td [attr.data-testid]="'data-grid-cell-publication-date-' + book.id">{{ formatDate(book.publication_date) }}</td>
              <td [attr.data-testid]="'data-grid-cell-pages-' + book.id">{{ book.number_of_pages }}</td>
            </tr>
            <tr *ngIf="books.length === 0">
              <td colspan="6" class="no-data">No books available</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .container {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    h1, h2 {
      color: #333;
    }

    .book-form {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }

    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }

    input:focus {
      border-color: #007bff;
      outline: none;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .error-message {
      color: #dc3545;
      font-size: 14px;
      margin-top: 5px;
    }

    button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }

    button:hover:not(:disabled) {
      background-color: #0069d9;
    }

    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }

    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .no-data {
      text-align: center;
      padding: 20px;
      font-style: italic;
      color: #666;
    }
  `]
})
export class ClaudeComponent implements OnInit {
  bookForm!: FormGroup;
  books: Book[] = [];
  touchedFields: { [key: string]: boolean } = {};

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadBooks();
  }

  initForm(): void {
    this.bookForm = this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      author: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(60)
      ]],
      isbn: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{13}$')
      ]],
      publication_date: ['', [
        Validators.required,
        this.futureDateValidator
      ]],
      number_of_pages: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(5000),
        Validators.pattern('^[0-9]+$')
      ]]
    });
  }

  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inputDate = new Date(control.value);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate > today ? { futureDate: true } : null;
  }

  onBlur(fieldName: string): void {
    this.touchedFields[fieldName] = true;
  }

  showError(fieldName: string): boolean {
    const control = this.bookForm.get(fieldName);
    return !!(control && (this.touchedFields[fieldName] || control.touched) && control.invalid);
  }

  loadBooks(): void {
    this.http.get<Book[]>('http://localhost:5000/books')
      .subscribe({
        next: (data) => {
          this.books = data;
        },
        error: (err) => {
          console.error('Error loading books:', err);
        }
      });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  onSubmit(): void {
    if (this.bookForm.valid) {
      // Create a copy of the form data to ensure date format is correct
      const bookData = {
        ...this.bookForm.value,
        // Ensure the date is in YYYY-MM-DD format for the API
        publication_date: this.formatDateForApi(this.bookForm.value.publication_date)
      };

      this.http.post<Book>('http://localhost:5000/books', bookData)
        .subscribe({
          next: (newBook) => {
            this.books.unshift(newBook); // Add to the top of the list
            this.bookForm.reset(); // Clear the form
            this.touchedFields = {}; // Reset touched fields
          },
          error: (err) => {
            console.error('Error submitting book:', err);

            // Handle validation errors from the server
            if (err.status === 400 && err.error?.errors) {
              const validationErrors: ValidationErrorResponse = err.error;

              // Apply server validation errors to the form
              Object.keys(validationErrors.errors).forEach(field => {
                const control = this.bookForm.get(field);
                if (control) {
                  control.setErrors({ serverError: validationErrors.errors[field] });
                  control.markAsTouched();
                  this.touchedFields[field] = true;
                }
              });
            }
          }
        });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.bookForm.controls).forEach(key => {
        const control = this.bookForm.get(key);
        if (control) {
          control.markAsTouched();
          this.touchedFields[key] = true;
        }
      });
    }
  }

  // Helper method to format date for API submission (YYYY-MM-DD)
  formatDateForApi(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }
}
