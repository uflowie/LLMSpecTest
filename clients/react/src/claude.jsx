import React, { useState, useEffect } from 'react';

const Claude = () => {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publication_date: new Date().toISOString().split('T')[0],
    number_of_pages: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Fetch books on component mount
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

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value) return 'Title is required';
        if (value.length < 2 || value.length > 100) {
          return 'Title must be between 2 and 100 characters.';
        }
        return '';
      
      case 'author':
        if (!value) return 'Author is required';
        if (value.length < 2 || value.length > 60) {
          return 'Author name must be between 2 and 60 characters.';
        }
        return '';
      
      case 'isbn':
        if (!value) return 'ISBN is required';
        if (!/^\d{13}$/.test(value)) {
          return 'ISBN must contain exactly 13 numeric digits.';
        }
        return '';
      
      case 'publication_date':
        if (!value) return 'Publication date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) {
          return 'Publication Date cannot be in the future.';
        }
        return '';
      
      case 'number_of_pages':
        if (!value) return 'Number of pages is required';
        const pages = parseInt(value);
        if (!Number.isInteger(pages) || pages < 1 || pages > 5000) {
          return 'Number of pages must be between 1 and 5000.';
        }
        return '';
      
      default:
        return '';
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    return newErrors;
  };

  // Check if form is valid
  const isFormValid = () => {
    const currentErrors = validateForm();
    return Object.keys(currentErrors).length === 0 && 
           Object.values(formData).every(value => value !== '');
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate on change if field has been touched
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  // Handle input blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate all fields
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const response = await fetch('/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          number_of_pages: parseInt(formData.number_of_pages)
        })
      });

      if (response.ok) {
        const newBook = await response.json();
        setBooks([newBook, ...books]);
        
        // Clear form
        setFormData({
          title: '',
          author: '',
          isbn: '',
          publication_date: new Date().toISOString().split('T')[0],
          number_of_pages: ''
        });
        setErrors({});
        setTouched({});
      }
    } catch (error) {
      console.error('Error submitting book:', error);
    }
  };

  // Handle Enter key press on inputs
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isFormValid()) {
      handleSubmit();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Book Management System</h1>
      
      {/* Book Entry Form */}
      <div style={{ marginBottom: '40px', background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <h2>Add New Book</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Book Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            data-testid="input-title"
            placeholder="Enter book title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          {errors.title && (
            <div data-testid="error-title" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
              {errors.title}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="author" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Author Name
          </label>
          <input
            type="text"
            id="author"
            name="author"
            data-testid="input-author"
            placeholder="Enter author name"
            value={formData.author}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          {errors.author && (
            <div data-testid="error-author" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
              {errors.author}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="isbn" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            ISBN Number
          </label>
          <input
            type="text"
            id="isbn"
            name="isbn"
            data-testid="input-isbn"
            placeholder="Enter 13-digit ISBN number"
            value={formData.isbn}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          {errors.isbn && (
            <div data-testid="error-isbn" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
              {errors.isbn}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="publication_date" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Publication Date
          </label>
          <input
            type="date"
            id="publication_date"
            name="publication_date"
            data-testid="input-publication-date"
            value={formData.publication_date}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          {errors.publication_date && (
            <div data-testid="error-publication-date" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
              {errors.publication_date}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="number_of_pages" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Number of Pages
          </label>
          <input
            type="number"
            id="number_of_pages"
            name="number_of_pages"
            data-testid="input-pages"
            placeholder="Enter number of pages"
            value={formData.number_of_pages}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          {errors.number_of_pages && (
            <div data-testid="error-pages" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
              {errors.number_of_pages}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          data-testid="btn-submit-book"
          disabled={!isFormValid()}
          style={{
            padding: '10px 20px',
            background: isFormValid() ? '#007bff' : '#cccccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isFormValid() ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Add Book
        </button>
      </div>

      {/* Book Data Grid */}
      <div>
        <h2>Book List</h2>
        <div data-testid="data-grid-books" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Title</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Author</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>ISBN</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Publication Date</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Pages</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.id} data-testid={`data-grid-row-${book.id}`} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }} data-testid={`data-grid-cell-id-${book.id}`}>
                    {book.id}
                  </td>
                  <td style={{ padding: '12px' }} data-testid={`data-grid-cell-title-${book.id}`}>
                    {book.title}
                  </td>
                  <td style={{ padding: '12px' }} data-testid={`data-grid-cell-author-${book.id}`}>
                    {book.author}
                  </td>
                  <td style={{ padding: '12px' }} data-testid={`data-grid-cell-isbn-${book.id}`}>
                    {book.isbn}
                  </td>
                  <td style={{ padding: '12px' }} data-testid={`data-grid-cell-publication-date-${book.id}`}>
                    {book.publication_date}
                  </td>
                  <td style={{ padding: '12px' }} data-testid={`data-grid-cell-pages-${book.id}`}>
                    {book.number_of_pages}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {books.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No books found. Add your first book using the form above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Claude;