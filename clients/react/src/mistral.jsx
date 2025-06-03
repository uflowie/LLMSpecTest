import React, { useState, useEffect } from 'react';

const Mistral = () => {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publication_date: new Date().toISOString().split('T')[0],
    number_of_pages: ''
  });
  const [errors, setErrors] = useState({
    title: '',
    author: '',
    isbn: '',
    publication_date: '',
    number_of_pages: ''
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'title':
        if (!value.trim()) error = 'Title is required';
        else if (value.length < 2 || value.length > 100) error = 'Title must be between 2 and 100 characters';
        break;
      case 'author':
        if (!value.trim()) error = 'Author is required';
        else if (value.length < 2 || value.length > 60) error = 'Author name must be between 2 and 60 characters';
        break;
      case 'isbn':
        if (!value.trim()) error = 'ISBN is required';
        else if (!/^\d{13}$/.test(value)) error = 'ISBN must contain exactly 13 numeric digits';
        break;
      case 'publication_date':
        if (!value) error = 'Publication date is required';
        else {
          const today = new Date().toISOString().split('T')[0];
          if (value > today) error = 'Publication Date cannot be in the future';
        }
        break;
      case 'number_of_pages':
        if (!value) error = 'Number of pages is required';
        else {
          const num = parseInt(value, 10);
          if (isNaN(num) || num < 1 || num > 5000) error = 'Number of pages must be between 1 and 5000';
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validate the field
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    let isValid = true;
    const newErrors = {};

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        isValid = false;
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    if (!isValid) return;

    try {
      const response = await fetch('/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newBook = await response.json();
        setBooks(prev => [newBook, ...prev]);
        // Clear the form
        setFormData({
          title: '',
          author: '',
          isbn: '',
          publication_date: new Date().toISOString().split('T')[0],
          number_of_pages: ''
        });
      } else {
        console.error('Failed to submit book');
      }
    } catch (error) {
      console.error('Error submitting book:', error);
    }
  };

  const isFormValid = () => {
    return Object.values(errors).every(error => !error) &&
           Object.values(formData).every(value => value !== '');
  };

  return (
    <div className="book-management">
      <h1>Book Management</h1>

      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-group">
          <label htmlFor="title">Book Title</label>
          <input
            type="text"
            id="title"
            name="title"
            data-testid="input-title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter book title"
          />
          {errors.title && <span data-testid="error-title" className="error">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="author">Author Name</label>
          <input
            type="text"
            id="author"
            name="author"
            data-testid="input-author"
            value={formData.author}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter author name"
          />
          {errors.author && <span data-testid="error-author" className="error">{errors.author}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="isbn">ISBN Number</label>
          <input
            type="text"
            id="isbn"
            name="isbn"
            data-testid="input-isbn"
            value={formData.isbn}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter 13-digit ISBN number"
          />
          {errors.isbn && <span data-testid="error-isbn" className="error">{errors.isbn}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="publication_date">Publication Date</label>
          <input
            type="date"
            id="publication_date"
            name="publication_date"
            data-testid="input-publication-date"
            value={formData.publication_date}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.publication_date && <span data-testid="error-publication-date" className="error">{errors.publication_date}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="number_of_pages">Number of Pages</label>
          <input
            type="number"
            id="number_of_pages"
            name="number_of_pages"
            data-testid="input-pages"
            value={formData.number_of_pages}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter number of pages"
          />
          {errors.number_of_pages && <span data-testid="error-pages" className="error">{errors.number_of_pages}</span>}
        </div>

        <button
          type="submit"
          data-testid="btn-submit-book"
          disabled={!isFormValid()}
        >
          Add Book
        </button>
      </form>

      <div className="book-grid-container">
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
            {books.map(book => (
              <tr key={book.id} data-testid={`data-grid-row-${book.id}`}>
                <td data-testid={`data-grid-cell-id-${book.id}`}>{book.id}</td>
                <td data-testid={`data-grid-cell-title-${book.id}`}>{book.title}</td>
                <td data-testid={`data-grid-cell-author-${book.id}`}>{book.author}</td>
                <td data-testid={`data-grid-cell-isbn-${book.id}`}>{book.isbn}</td>
                <td data-testid={`data-grid-cell-publication-date-${book.id}`}>{book.publication_date}</td>
                <td data-testid={`data-grid-cell-pages-${book.id}`}>{book.number_of_pages}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .book-management {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        h1 {
          text-align: center;
          color: #333;
        }

        .book-form {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
          outline: none;
          border-color: #4a90e2;
          box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }

        .error {
          color: #e74c3c;
          font-size: 0.8em;
          margin-top: 5px;
          display: block;
        }

        button {
          background-color: #4a90e2;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        button:hover:not(:disabled) {
          background-color: #357ab8;
        }

        .book-grid-container {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }

        tr:hover {
          background-color: #f5f5f5;
        }
      `}</style>
    </div>
  );
};

export default Mistral;
