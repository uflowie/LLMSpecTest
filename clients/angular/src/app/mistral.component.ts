import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mistral',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  template: `
    <div class="container">
      <h1>Book Management</h1>
      <form [formGroup]="bookForm" (ngSubmit)="onSubmit()" class="book-form">
        <div class="form-group">
          <label for="title">Book Title</label>
          <input
            type="text"
            id="title"
            formControlName="title"
            placeholder="Enter book title"
            data-testid="input-title"
            (blur)="bookForm.get('title')?.markAsTouched()"
          />
          <div *ngIf="bookForm.get('title')?.invalid && bookForm.get('title')?.touched" data-testid="error-title">
            Title must be between 2 and 100 characters.
          </div>
        </div>

        <div class="form-group">
          <label for="author">Author Name</label>
          <input
            type="text"
            id="author"
            formControlName="author"
            placeholder="Enter author name"
            data-testid="input-author"
            (blur)="bookForm.get('author')?.markAsTouched()"
          />
          <div *ngIf="bookForm.get('author')?.invalid && bookForm.get('author')?.touched" data-testid="error-author">
            Author name must be between 2 and 60 characters.
          </div>
        </div>

        <div class="form-group">
          <label for="isbn">ISBN Number</label>
          <input
            type="text"
            id="isbn"
            formControlName="isbn"
            placeholder="Enter 13-digit ISBN number"
            data-testid="input-isbn"
            (blur)="bookForm.get('isbn')?.markAsTouched()"
          />
          <div *ngIf="bookForm.get('isbn')?.invalid && bookForm.get('isbn')?.touched" data-testid="error-isbn">
            ISBN must contain exactly 13 numeric digits.
          </div>
        </div>

        <div class="form-group">
          <label for="publication_date">Publication Date</label>
          <input
            type="date"
            id="publication_date"
            formControlName="publication_date"
            data-testid="input-publication-date"
            (blur)="bookForm.get('publication_date')?.markAsTouched()"
          />
          <div *ngIf="bookForm.get('publication_date')?.invalid && bookForm.get('publication_date')?.touched" data-testid="error-publication-date">
            Publication Date cannot be in the future.
          </div>
        </div>

        <div class="form-group">
          <label for="number_of_pages">Number of Pages</label>
          <input
            type="number"
            id="number_of_pages"
            formControlName="number_of_pages"
            placeholder="Enter number of pages"
            data-testid="input-pages"
            (blur)="bookForm.get('number_of_pages')?.markAsTouched()"
          />
          <div *ngIf="bookForm.get('number_of_pages')?.invalid && bookForm.get('number_of_pages')?.touched" data-testid="error-pages">
            Number of pages must be between 1 and 5000.
          </div>
        </div>

        <button type="submit" [disabled]="bookForm.invalid" data-testid="btn-submit-book">
          Add Book
        </button>
      </form>

      <div class="data-grid" data-testid="data-grid-books">
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
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .book-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .form-group label {
      font-weight: bold;
    }
    .form-group input {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .form-group div {
      color: red;
      font-size: 0.8em;
    }
    button {
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    .data-grid {
      margin-top: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
  `]
})
export class MistralComponent implements OnInit {
  bookForm: FormGroup;
  books: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      isbn: ['', [Validators.required, Validators.pattern('^[0-9]{13}$')]],
      publication_date: [new Date().toISOString().split('T')[0], [Validators.required, this.futureDateValidator]],
      number_of_pages: ['', [Validators.required, Validators.min(1), Validators.max(5000)]]
    });
  }

  ngOnInit(): void {
    this.fetchBooks();
  }

  futureDateValidator(control: any) {
    const selectedDate = new Date(control.value);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return selectedDate > currentDate ? { futureDate: true } : null;
  }

  onSubmit(): void {
    if (this.bookForm.valid) {
      this.http.post('https://your-api-url/books', this.bookForm.value).subscribe({
        next: (response) => {
          this.fetchBooks();
          this.bookForm.reset({
            title: '',
            author: '',
            isbn: '',
            publication_date: new Date().toISOString().split('T')[0],
            number_of_pages: ''
          });
        },
        error: (error) => {
          console.error('Error submitting form:', error);
        }
      });
    }
  }

  fetchBooks(): void {
    this.http.get<any[]>('https://your-api-url/books').subscribe({
      next: (data) => {
        this.books = data;
      },
      error: (error) => {
        console.error('Error fetching books:', error);
      }
    });
  }
}
