import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Book {
  id?: number;
  title: string;
  author: string;
  isbn: string;
  publication_date: string;
  number_of_pages: number;
}

interface ValidationErrors {
  title?: string;
  author?: string;
  isbn?: string;
  publication_date?: string;
  number_of_pages?: string;
}

@Component({
  selector: 'app-claude',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="container">
      <h1>Book Management System</h1>

      <!-- Book Entry Form -->
      <form (ngSubmit)="onSubmit()" class="book-form">
        <h2>Add New Book</h2>

        <!-- Title Field -->
        <div class="form-group">
          <label for="title">Book Title</label>
          <input
            id="title"
            type="text"
            [(ngModel)]="book.title"
            name="title"
            placeholder="Enter book title"
            data-testid="input-title"
            (blur)="validateField('title')"
            (input)="validateField('title')"
            class="form-control"
            [class.error]="errors.title"
          />
          <div class="error-message" data-testid="error-title" *ngIf="errors.title">
            {{ errors.title }}
          </div>
        </div>

        <!-- Author Field -->
        <div class="form-group">
          <label for="author">Author Name</label>
          <input
            id="author"
            type="text"
            [(ngModel)]="book.author"
            name="author"
            placeholder="Enter author name"
            data-testid="input-author"
            (blur)="validateField('author')"
            (input)="validateField('author')"
            class="form-control"
            [class.error]="errors.author"
          />
          <div class="error-message" data-testid="error-author" *ngIf="errors.author">
            {{ errors.author }}
          </div>
        </div>

        <!-- ISBN Field -->
        <div class="form-group">
          <label for="isbn">ISBN Number</label>
          <input
            id="isbn"
            type="text"
            [(ngModel)]="book.isbn"
            name="isbn"
            placeholder="Enter 13-digit ISBN number"
            data-testid="input-isbn"
            (blur)="validateField('isbn')"
            (input)="validateField('isbn')"
            class="form-control"
            [class.error]="errors.isbn"
          />
          <div class="error-message" data-testid="error-isbn" *ngIf="errors.isbn">
            {{ errors.isbn }}
          </div>
        </div>

        <!-- Publication Date Field -->
        <div class="form-group">
          <label for="publication_date">Publication Date</label>
          <input
            id="publication_date"
            type="date"
            [(ngModel)]="book.publication_date"
            name="publication_date"
            data-testid="input-publication-date"
            (blur)="validateField('publication_date')"
            (change)="validateField('publication_date')"
            class="form-control"
            [class.error]="errors.publication_date"
          />
          <div class="error-message" data-testid="error-publication-date" *ngIf="errors.publication_date">
            {{ errors.publication_date }}
          </div>
        </div>

        <!-- Number of Pages Field -->
        <div class="form-group">
          <label for="number_of_pages">Number of Pages</label>
          <input
            id="number_of_pages"
            type="number"
            [(ngModel)]="book.number_of_pages"
            name="number_of_pages"
            placeholder="Enter number of pages"
            data-testid="input-pages"
            (blur)="validateField('number_of_pages')"
            (input)="validateField('number_of_pages')"
            class="form-control"
            [class.error]="errors.number_of_pages"
          />
          <div class="error-message" data-testid="error-pages" *ngIf="errors.number_of_pages">
            {{ errors.number_of_pages }}
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          data-testid="btn-submit-book"
          [disabled]="!isFormValid()"
          class="submit-button"
        >
          Add Book
        </button>
      </form>

      <!-- Book Data Grid -->
      <div class="data-grid-container">
        <h2>Book List</h2>
        <table class="data-grid" data-testid="data-grid-books">
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
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    h1 {
      color: #333;
      margin-bottom: 30px;
    }

    h2 {
      color: #555;
      margin-bottom: 20px;
    }

    .book-form {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #555;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      transition: border-color 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #4CAF50;
    }

    .form-control.error {
      border-color: #f44336;
    }

    .error-message {
      color: #f44336;
      font-size: 14px;
      margin-top: 5px;
    }

    .submit-button {
      background-color: #4CAF50;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .submit-button:hover:not(:disabled) {
      background-color: #45a049;
    }

    .submit-button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .data-grid-container {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .data-grid {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }

    .data-grid th {
      background-color: #4CAF50;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 500;
    }

    .data-grid td {
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }

    .data-grid tr:nth-child(even) {
      background-color: #f5f5f5;
    }

    .data-grid tr:hover {
      background-color: #e8f5e9;
    }
  `]
})
export class ClaudeComponent implements OnInit {
  book: Book = {
    title: '',
    author: '',
    isbn: '',
    publication_date: '',
    number_of_pages: 0
  };

  books: Book[] = [];
  errors: ValidationErrors = {};

  private apiUrl = '/books';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Set default publication date to today
    const today = new Date();
    this.book.publication_date = today.toISOString().split('T')[0];

    // Load existing books
    this.loadBooks();
  }

  loadBooks(): void {
    this.http.get<Book[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.books = data;
      },
      error: (error) => {
        console.error('Error loading books:', error);
      }
    });
  }

  validateField(field: keyof Book): void {
    const value = this.book[field];

    switch (field) {
      case 'title':
        if (!value || value.toString().length < 2 || value.toString().length > 100) {
          this.errors.title = 'Title must be between 2 and 100 characters.';
        } else {
          delete this.errors.title;
        }
        break;

      case 'author':
        if (!value || value.toString().length < 2 || value.toString().length > 60) {
          this.errors.author = 'Author name must be between 2 and 60 characters.';
        } else {
          delete this.errors.author;
        }
        break;

      case 'isbn':
        if (!value || !/^\d{13}$/.test(value.toString())) {
          this.errors.isbn = 'ISBN must contain exactly 13 numeric digits.';
        } else {
          delete this.errors.isbn;
        }
        break;

      case 'publication_date':
        if (!value) {
          this.errors.publication_date = 'Publication Date is required.';
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate > today) {
            this.errors.publication_date = 'Publication Date cannot be in the future.';
          } else {
            delete this.errors.publication_date;
          }
        }
        break;

      case 'number_of_pages':
        const pages = Number(value);
        if (!value || pages < 1 || pages > 5000 || !Number.isInteger(pages)) {
          this.errors.number_of_pages = 'Number of pages must be between 1 and 5000.';
        } else {
          delete this.errors.number_of_pages;
        }
        break;
    }
  }

  validateAllFields(): void {
    const fields: (keyof Book)[] = ['title', 'author', 'isbn', 'publication_date', 'number_of_pages'];
    fields.forEach(field => this.validateField(field));
  }

  isFormValid(): boolean {
    this.validateAllFields();
    return Object.keys(this.errors).length === 0 &&
           this.book.title !== '' &&
           this.book.author !== '' &&
           this.book.isbn !== '' &&
           this.book.publication_date !== '' &&
           this.book.number_of_pages > 0;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    this.http.post<Book>(this.apiUrl, this.book).subscribe({
      next: (newBook) => {
        // Add new book to the beginning of the list
        this.books.unshift(newBook);

        // Clear form
        this.book = {
          title: '',
          author: '',
          isbn: '',
          publication_date: new Date().toISOString().split('T')[0],
          number_of_pages: 0
        };

        // Clear errors
        this.errors = {};
      },
      error: (error) => {
        console.error('Error creating book:', error);
      }
    });
  }
}
