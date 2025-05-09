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
  selector: 'app-claude',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  template: `
    <div class="container">
      <h1>Book Management</h1>

      <!-- Book Entry Form -->
      <form [formGroup]="bookForm" (ngSubmit)="onSubmit()" class="book-form">
        <h2>Add a New Book</h2>

        <!-- Title Field -->
        <div class="form-group">
          <label for="title">Book Title</label>
          <input
            type="text"
            id="title"
            formControlName="title"
            data-testid="input-title"
            placeholder="Enter book title"
            (blur)="validateField('title')"
            (input)="validateField('title')">
          <div
            *ngIf="formErrors.title"
            class="error-message"
            data-testid="error-title">
            {{ formErrors.title }}
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
            (blur)="validateField('author')"
            (input)="validateField('author')">
          <div
            *ngIf="formErrors.author"
            class="error-message"
            data-testid="error-author">
            {{ formErrors.author }}
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
            (blur)="validateField('isbn')"
            (input)="validateField('isbn')">
          <div
            *ngIf="formErrors.isbn"
            class="error-message"
            data-testid="error-isbn">
            {{ formErrors.isbn }}
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
            (blur)="validateField('publication_date')"
            (change)="validateField('publication_date')">
          <div
            *ngIf="formErrors.publication_date"
            class="error-message"
            data-testid="error-publication-date">
            {{ formErrors.publication_date }}
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
            (blur)="validateField('number_of_pages')"
            (input)="validateField('number_of_pages')">
          <div
            *ngIf="formErrors.number_of_pages"
            class="error-message"
            data-testid="error-pages">
            {{ formErrors.number_of_pages }}
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          data-testid="btn-submit-book"
          [disabled]="!bookForm.valid">
          Add Book
        </button>
      </form>

      <!-- Book Data Grid -->
      <div class="book-grid">
        <h2>Book List</h2>
        <table data-testid="data-grid-books">
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

    .error-message {
      color: #d9534f;
      font-size: 0.9em;
      margin-top: 5px;
    }

    button {
      background-color: #5cb85c;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background-color: #4cae4c;
    }

    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .book-grid {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }

    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  `]
})
export class ClaudeComponent implements OnInit {
  bookForm: FormGroup;
  books: Book[] = [];
  formErrors: { [key: string]: string } = {};
  private apiUrl = 'http://localhost:5000/books';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.bookForm = this.createForm();
  }

  ngOnInit(): void {
    this.fetchBooks();
  }

  createForm(): FormGroup {
    const today = new Date().toISOString().split('T')[0];

    return this.fb.group({
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
      publication_date: [today, [
        Validators.required,
        this.futureDateValidator
      ]],
      number_of_pages: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(5000),
        Validators.pattern('^[0-9]*$')
      ]]
    });
  }

  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    const inputDate = new Date(control.value);
    const today = new Date();

    // Reset hours, minutes, seconds to make the comparison date-only
    today.setHours(0, 0, 0, 0);

    if (inputDate > today) {
      return { 'futureDate': true };
    }

    return null;
  }

  validateField(fieldName: string): void {
    const control = this.bookForm.get(fieldName);
    this.formErrors[fieldName] = '';

    if (control && control.invalid && (control.dirty || control.touched)) {
      const errorMessages: { [field: string]: { [validationType: string]: string } } = {
        title: {
          required: 'Title is required.',
          minlength: 'Title must be between 2 and 100 characters.',
          maxlength: 'Title must be between 2 and 100 characters.'
        },
        author: {
          required: 'Author name is required.',
          minlength: 'Author name must be between 2 and 60 characters.',
          maxlength: 'Author name must be between 2 and 60 characters.'
        },
        isbn: {
          required: 'ISBN is required.',
          pattern: 'ISBN must contain exactly 13 numeric digits.'
        },
        publication_date: {
          required: 'Publication Date is required.',
          futureDate: 'Publication Date cannot be in the future.'
        },
        number_of_pages: {
          required: 'Number of pages is required.',
          min: 'Number of pages must be between 1 and 5000.',
          max: 'Number of pages must be between 1 and 5000.',
          pattern: 'Number of pages must be an integer.'
        }
      };

      // Get the first error
      const errors = control.errors;
      if (errors) {
        const firstError = Object.keys(errors)[0];
        this.formErrors[fieldName] = errorMessages[fieldName][firstError];
      }
    }
  }

  fetchBooks(): void {
    this.http.get<Book[]>(this.apiUrl)
      .subscribe({
        next: (books) => {
          this.books = books;
        },
        error: (error) => {
          console.error('Error fetching books:', error);
        }
      });
  }

  onSubmit(): void {
    if (this.bookForm.valid) {
      const formValues = this.bookForm.value;

      this.http.post<Book>(this.apiUrl, formValues)
        .subscribe({
          next: (newBook) => {
            // Add new book to the beginning of the array
            this.books.unshift(newBook);

            // Reset the form
            this.bookForm.reset({
              publication_date: new Date().toISOString().split('T')[0]
            });

            // Clear form errors
            this.formErrors = {};
          },
          error: (error) => {
            console.error('Error submitting form:', error);

            // Handle validation error responses from the server
            if (error.status === 400 && error.error && error.error.errors) {
              const validationErrors: ValidationErrorResponse = error.error;
              Object.keys(validationErrors.errors).forEach(key => {
                this.formErrors[key] = validationErrors.errors[key][0];
              });
            }
          }
        });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.bookForm.controls).forEach(key => {
        const control = this.bookForm.get(key);
        if (control) {
          control.markAsTouched();
          this.validateField(key);
        }
      });
    }
  }
}
