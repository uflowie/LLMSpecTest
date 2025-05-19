import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publication_date: string;
  number_of_pages: number;
}

interface BookInput {
  title: string;
  author: string;
  isbn: string;
  publication_date: string;
  number_of_pages: number;
}

@Component({
  selector: 'app-mistral-component',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './mistral-component.component.html',
  styleUrls: ['./mistral-component.component.css']
})
export class MistralComponent implements OnInit {
  books: Book[] = [];
  bookInput: BookInput = {
    title: '',
    author: '',
    isbn: '',
    publication_date: new Date().toISOString().split('T')[0],
    number_of_pages: 0
  };
  errors: { [key: string]: string[] } = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchBooks();
  }

  fetchBooks(): void {
    this.http.get<Book[]>('http://localhost:5000/books').subscribe(books => {
      this.books = books;
    });
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    if (!this.bookInput.title || this.bookInput.title.length < 2 || this.bookInput.title.length > 100) {
      this.errors['title'] = ['Title must be between 2 and 100 characters.'];
      isValid = false;
    }

    if (!this.bookInput.author || this.bookInput.author.length < 2 || this.bookInput.author.length > 60) {
      this.errors['author'] = ['Author name must be between 2 and 60 characters.'];
      isValid = false;
    }

    if (!this.bookInput.isbn || !/^\d{13}$/.test(this.bookInput.isbn)) {
      this.errors['isbn'] = ['ISBN must contain exactly 13 numeric digits.'];
      isValid = false;
    }

    const publicationDate = new Date(this.bookInput.publication_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!this.bookInput.publication_date || publicationDate > today) {
      this.errors['publication_date'] = ['Publication Date cannot be in the future.'];
      isValid = false;
    }

    if (!this.bookInput.number_of_pages || this.bookInput.number_of_pages < 1 || this.bookInput.number_of_pages > 5000) {
      this.errors['number_of_pages'] = ['Number of pages must be between 1 and 5000.'];
      isValid = false;
    }

    return isValid;
  }

  onSubmit(): void {
    if (this.validateForm()) {
      this.http.post<Book>('http://localhost:5000/books', this.bookInput).subscribe(() => {
        this.fetchBooks();
        this.bookInput = {
          title: '',
          author: '',
          isbn: '',
          publication_date: new Date().toISOString().split('T')[0],
          number_of_pages: 0
        };
      });
    }
  }
}
