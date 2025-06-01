import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publication_date: string;
  number_of_pages: number;
}

@Component({
  selector: 'app-gemini-diffusion',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Book Management</h1>

      <!-- Book Entry Form -->
      <form [formGroup]="bookForm" (ngSubmit)="onSubmit()" class="mb-8 p-4 border rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Add New Book</h2>

        <div class="mb-4">
          <label for="input-title" class="block text-sm font-medium text-gray-700">Book Title</label>
          <input
            type="text"
            id="input-title"
            formControlName="title"
            data-testid="input-title"
            placeholder="Enter book title"
            class="mt-1 block w-full border border-gray-300 rounded-md"
          />
          <div
            data-testid="error-title"
            *ngIf="bookForm.get('title')?.invalid && (bookForm.get('title')?.touched || bookForm.get('title')?.dirty)"
            class="text-red-500 text-sm mt-1"
          >
            <div *ngIf="bookForm.get('title')?.errors?.['required']">Title is required.</div>
            <div *ngIf="bookForm.get('title')?.errors?.['minlength'] || bookForm.get('title')?.errors?.['maxlength']">
              Title must be between 2 and 100 characters.
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label for="input-author" class="block text-sm font-medium text-gray-700">Author Name</label>
          <input
            type="text"
            id="input-author"
            formControlName="author"
            data-testid="input-author"
            placeholder="Enter author name"
            class="mt-1 block w-full border border-gray-300 rounded-md"
          />
          <div
            data-testid="error-author"
            *ngIf="bookForm.get('author')?.invalid && (bookForm.get('author')?.touched || bookForm.get('author')?.dirty)"
            class="text-red-500 text-sm mt-1"
          >
            <div *ngIf="bookForm.get('author')?.errors?.['required']">Author name is required.</div>
            <div *ngIf="bookForm.get('author')?.errors?.['minlength'] || bookForm.get('author')?.errors?.['maxlength']">
              Author name must be between 2 and 60 characters.
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label for="input-isbn" class="block text-sm font-medium text-gray-700">ISBN Number</label>
          <input
            type="text"
            id="input-isbn"
            formControlName="isbn"
            data-testid="input-isbn"
            placeholder="Enter 13-digit ISBN number"
            class="mt-1 block w-full border border-gray-300 rounded-md"
          />
          <div
            data-testid="error-isbn"
            *ngIf="bookForm.get('isbn')?.invalid && (bookForm.get('isbn')?.touched || bookForm.get('isbn')?.dirty)"
            class="text-red-500 text-sm mt-1"
          >
            <div *ngIf="bookForm.get('isbn')?.errors?.['required']">ISBN is required.</div>
            <div *ngIf="bookForm.get('isbn')?.errors?.['pattern']">ISBN must contain exactly 13 numeric digits.</div>
          </div>
        </div>

        <div class="mb-4">
          <label for="input-publication-date" class="block text-sm font-medium text-gray-700">Publication Date</label>
          <input
            type="date"
            id="input-publication-date"
            formControlName="publication_date"
            data-testid="input-publication-date"
            class="mt-1 block w-full border border-gray-300 rounded-md"
          />
          <div
            data-testid="error-publication-date"
            *ngIf="bookForm.get('publication_date')?.invalid && (bookForm.get('publication_date')?.touched || bookForm.get('publication_date')?.dirty)"
            class="text-red-500 text-sm mt-1"
          >
            <div *ngIf="bookForm.get('publication_date')?.errors?.['required']">Publication date is required.</div>
            <div *ngIf="bookForm.get('publication_date')?.errors?.['invalidDate']">Publication Date cannot be in the future.</div>
          </div>
        </div>

        <div class="mb-4">
          <label for="input-pages" class="block text-sm font-medium text-gray-700">Number of Pages</label>
          <input
            type="number"
            id="input-pages"
            formControlName="number_of_pages"
            data-testid="input-pages"
            placeholder="Enter number of pages"
            class="mt-1 block w-full border border-gray-300 rounded-md"
          />
          <div
            data-testid="error-pages"
            *ngIf="bookForm.get('number_of_pages')?.invalid && (bookForm.get('number_of_pages')?.touched || bookForm.get('number_of_pages')?.dirty)"
            class="text-red-500 text-sm mt-1"
          >
            <div *ngIf="bookForm.get('number_of_pages')?.errors?.['required']">Number of pages is required.</div>
            <div *ngIf="bookForm.get('number_of_pages')?.errors?.['min'] || bookForm.get('number_of_pages')?.errors?.['max']">
              Number of pages must be between 1 and 5000.
            </div>
          </div>
        </div>

        <button
          type="submit"
          data-testid="btn-submit-book"
          [disabled]="bookForm.invalid"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Add Book
        </button>
      </form>

      <!-- Book Data Grid -->
      <h2 class="text-xl font-semibold mb-4">Books</h2>
      <table data-testid="data-grid-books" class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-200">
            <th class="border px-4 py-2 text-left">ID</th>
            <th class="border px-4 py-2 text-left">Title</th>
            <th class="border px-4 py-2 text-left">Author</th>
            <th class="border px-4 py-2 text-left">ISBN</th>
            <th class="border px-4 py-2 text-left">Publication Date</th>
            <th class="border px-4 py-2 text-left">Pages</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let book of books" [attr.data-testid]="'data-grid-row-' + book.id">
            <td class="border px-4 py-2" [attr.data-testid]="'data-grid-cell-id-' + book.id">{{ book.id }}</td>
            <td class="border px-4 py-2" [attr.data-testid]="'data-grid-cell-title-' + book.id">{{ book.title }}</td>
            <td class="border px-4 py-2" [attr.data-testid]="'data-grid-cell-author-' + book.id">{{ book.author }}</td>
            <td class="border px-4 py-2" [attr.data-testid]="'data-grid-cell-isbn-' + book.id">{{ book.isbn }}</td>
            <td class="border px-4 py-2" [attr.data-testid]="'data-grid-cell-publication-date-' + book.id">{{ book.publication_date }}</td>
            <td class="border px-4 py-2" [attr.data-testid]="'data-grid-cell-pages-' + book.id">{{ book.number_of_pages }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: []
})
export class GeminiDiffusionComponent implements OnInit {
  bookForm: FormGroup;
  books: Book[] = [];
  private apiUrl = 'http://localhost:3000'; // Replace with your API URL if needed

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      isbn: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
      publication_date: ['', [Validators.required, this.futureDateValidator]],
      number_of_pages: ['', [Validators.required, Validators.min(1), Validators.max(5000)]],
    });
  }

  ngOnInit(): void {
    this.loadBooks();
    // Set default publication date to today
    const today = new Date().toISOString().split('T')[0];
    this.bookForm.get('publication_date')?.setValue(today);
  }

  futureDateValidator(control: any): { [key: string]: any } | null {
    const inputDate = control.value;
    if (!inputDate) {
      return null;
    }
    const selectedDate = new Date(inputDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      return { 'invalidDate': true };
    }
    return null;
  }

  loadBooks(): void {
    this.http.get<Book[]>(`${this.apiUrl}/books`).subscribe({
      next: (data) => {
        // Sort books by ID (newest first)
        this.books = data.sort((a, b) => b.id - a.id);
      },
      error: (error) => {
        console.error('Error fetching books:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.bookForm.invalid) {
      return; // Stop submission if the form is invalid
    }

    const newBook = this.bookForm.value;

    this.http.post<Book>(`${this.apiUrl}/books`, newBook).subscribe({
      next: (createdBook) => {
        // Add the new book to the beginning of the list
        this.books.unshift(createdBook);
        // Clear the form
        this.bookForm.reset();
        // Reset publication date to today after submission
        const today = new Date().toISOString().split('T')[0];
        this.bookForm.get('publication_date')?.setValue(today);
      },
      error: (error) => {
        console.error('Error adding book:', error);
      }
    });
  }
}
