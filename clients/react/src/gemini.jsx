import React, { useState, useEffect, useCallback } from 'react';

// --- Helper Functions ---
/**
 * Gets today's date in YYYY-MM-DD format.
 * @returns {string} Today's date string.
 */
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- API Configuration ---
// Replace with your actual API base URL if needed.
const API_BASE_URL = '/api'; 

// --- Validation Logic ---
/**
 * Validates a single form field.
 * @param {string} name - The name of the field to validate.
 * @param {string | number} value - The value of the field.
 * @returns {string} An error message if validation fails, otherwise an empty string.
 */
const validateField = (name, value) => {
  switch (name) {
    case 'title':
      if (!value || value.length < 2 || value.length > 100) {
        return 'Title must be between 2 and 100 characters.';
      }
      return '';
    case 'author':
      if (!value || value.length < 2 || value.length > 60) {
        return 'Author name must be between 2 and 60 characters.';
      }
      return '';
    case 'isbn':
      if (!value || !/^\d{13}$/.test(String(value))) {
        return 'ISBN must contain exactly 13 numeric digits.';
      }
      return '';
    case 'publication_date':
      if (!value) {
        return 'Publication Date is required.'; // Specific message for required
      }
      const inputDate = new Date(value);
      // Check if date string itself is parseable
      if (isNaN(inputDate.getTime())) {
          return 'Invalid date format for Publication Date.'; // Handle unparseable dates
      }
      const today = new Date();
      // Compare dates only, ignoring time part
      inputDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (inputDate > today) {
        return 'Publication Date cannot be in the future.';
      }
      return '';
    case 'number_of_pages':
      // Ensure value is treated as a string for consistent checks before parsing
      const stringValue = String(value);
      const numPages = parseInt(stringValue, 10);
      if (
        stringValue === '' || // Check for empty string explicitly
        isNaN(numPages) ||
        numPages < 1 ||
        numPages > 5000 ||
        stringValue !== String(numPages) // Ensures it was a clean integer string (e.g., not "1.2" or "1a")
      ) {
        return 'Number of pages must be between 1 and 5000.';
      }
      return '';
    default:
      return '';
  }
};

/**
 * BookManagement component: Provides a form to add books and a grid to display them.
 */
function Gemini() {
  const initialFormData = {
    title: '',
    author: '',
    isbn: '',
    publication_date: getTodayDateString(),
    number_of_pages: '',
  };

  const initialFormErrors = {
    title: '',
    author: '',
    isbn: '',
    publication_date: '', // Default date is today, which should be valid
    number_of_pages: '',
  };

  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(''); // For displaying API errors

  // Fetch initial books on component mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setApiError('');
        const response = await fetch(`${API_BASE_URL}/books`);
        if (!response.ok) {
          throw new Error(`Failed to fetch books (status: ${response.status})`);
        }
        const data = await response.json();
        setBooks(data); // API is expected to return newest first
      } catch (error) {
        console.error("Error fetching books:", error);
        setApiError(error.message || 'Could not connect to API to fetch books.');
      }
    };
    fetchBooks();
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Validate on input/change
    const error = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    // Validate on blur
    const error = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(''); // Clear previous API errors

    // Perform a final validation pass for all fields
    let currentFormErrors = {};
    let isFormCurrentlyValid = true;
    for (const key in formData) {
        const error = validateField(key, formData[key]);
        currentFormErrors[key] = error;
        if (error) {
            isFormCurrentlyValid = false;
        }
    }
    setFormErrors(currentFormErrors);

    if (!isFormCurrentlyValid) {
        return; // Stop submission if validation fails
    }

    setIsSubmitting(true);
    const bookDataToSubmit = {
        ...formData,
        number_of_pages: parseInt(formData.number_of_pages, 10),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookDataToSubmit),
      });

      if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (jsonParseError) {
            // Fallback if response is not JSON
            errorData = { message: `Server error: ${response.status}` };
        }
        throw new Error(errorData?.message || `Failed to add book (status: ${response.status})`);
      }

      const newBook = await response.json();
      setBooks((prevBooks) => [newBook, ...prevBooks]); // Add new book to the top
      setFormData(initialFormData); // Clear form
      setFormErrors(initialFormErrors); // Reset errors to initial (empty for most fields)

    } catch (error) {
      console.error("Error adding book:", error);
      setApiError(error.message || 'An unexpected error occurred while adding the book.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Derived state for submit button disability
  const isSubmitButtonDisabled = () => {
    // Check if any field (all are effectively required by their validation rules if empty) is empty
    if (Object.values(formData).some(value => value === '')) {
        // Exception for publication_date if it's valid (though it defaults to non-empty)
        if (formData.publication_date === '' && validateField('publication_date', '') !== '') {
            return true;
        }
        // Check other fields for emptiness
        for (const key in formData) {
            if (key !== 'publication_date' && formData[key] === '') {
                return true;
            }
        }
    }
    // Check if there are any validation errors displayed
    if (Object.values(formErrors).some(error => error !== '')) {
        return true;
    }
    return isSubmitting;
  };
  
  // Minimal inline styles for better readability without CSS files
  const styles = {
    container: { fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' },
    heading: { color: '#333' },
    form: { marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' },
    formSectionHeading: { marginTop: '0', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '20px' },
    formField: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em' },
    input: { width: 'calc(100% - 16px)', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
    error: { color: 'red', fontSize: '0.85em', marginTop: '4px' },
    apiError: { color: 'red', fontSize: '0.9em', marginTop: '10px', padding: '10px', border: '1px solid red', borderRadius: '4px', backgroundColor: '#ffe0e0'},
    button: { padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1em' },
    disabledButton: { backgroundColor: '#ccc', cursor: 'not-allowed' },
    hr: { margin: '30px 0', border: '0', borderTop: '1px solid #eee' },
    gridContainer: { marginTop: '20px' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' },
    thTd: { border: '1px solid #ddd', padding: '10px', textAlign: 'left' },
    th: { backgroundColor: '#f0f0f0', fontWeight: 'bold' },
    noBooksRow: { textAlign: 'center', fontStyle: 'italic', color: '#777' }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>📚 Book Management</h1>

      <form onSubmit={handleSubmit} data-testid="book-form" style={styles.form}>
        <h2 style={styles.formSectionHeading}>Add New Book</h2>

        {apiError && <div data-testid="error-api" style={styles.apiError}>{apiError}</div>}

        <div style={styles.formField}>
          <label htmlFor="title" style={styles.label}>Book Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Enter book title"
            data-testid="input-title"
            style={styles.input}
            aria-describedby={formErrors.title ? "error-title" : undefined}
            aria-invalid={!!formErrors.title}
          />
          {formErrors.title && <div id="error-title" data-testid="error-title" style={styles.error} role="alert">{formErrors.title}</div>}
        </div>

        <div style={styles.formField}>
          <label htmlFor="author" style={styles.label}>Author Name</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Enter author name"
            data-testid="input-author"
            style={styles.input}
            aria-describedby={formErrors.author ? "error-author" : undefined}
            aria-invalid={!!formErrors.author}
          />
          {formErrors.author && <div id="error-author" data-testid="error-author" style={styles.error} role="alert">{formErrors.author}</div>}
        </div>

        <div style={styles.formField}>
          <label htmlFor="isbn" style={styles.label}>ISBN Number</label>
          <input
            type="text"
            id="isbn"
            name="isbn"
            value={formData.isbn}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Enter 13-digit ISBN number"
            data-testid="input-isbn"
            style={styles.input}
            aria-describedby={formErrors.isbn ? "error-isbn" : undefined}
            aria-invalid={!!formErrors.isbn}
          />
          {formErrors.isbn && <div id="error-isbn" data-testid="error-isbn" style={styles.error} role="alert">{formErrors.isbn}</div>}
        </div>

        <div style={styles.formField}>
          <label htmlFor="publication_date" style={styles.label}>Publication Date</label>
          <input
            type="date"
            id="publication_date"
            name="publication_date"
            value={formData.publication_date}
            onChange={handleInputChange}
            onBlur={handleBlur}
            data-testid="input-publication-date"
            style={styles.input}
            aria-describedby={formErrors.publication_date ? "error-publication-date" : undefined}
            aria-invalid={!!formErrors.publication_date}
          />
          {formErrors.publication_date && <div id="error-publication-date" data-testid="error-publication-date" style={styles.error} role="alert">{formErrors.publication_date}</div>}
        </div>

        <div style={styles.formField}>
          <label htmlFor="number_of_pages" style={styles.label}>Number of Pages</label>
          <input
            type="text" // Using text to better control input and rely on custom validation for integer.
                       // type="number" can have tricky behavior with empty strings or non-integer values.
            id="number_of_pages"
            name="number_of_pages"
            value={formData.number_of_pages}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Enter number of pages"
            data-testid="input-pages"
            style={styles.input}
            inputMode="numeric" // Hint for numeric keyboard on mobile
            pattern="[0-9]*"    // Basic pattern hint
            aria-describedby={formErrors.number_of_pages ? "error-pages" : undefined}
            aria-invalid={!!formErrors.number_of_pages}
          />
          {formErrors.number_of_pages && <div id="error-pages" data-testid="error-pages" style={styles.error} role="alert">{formErrors.number_of_pages}</div>}
        </div>

        <button
          type="submit"
          data-testid="btn-submit-book"
          disabled={isSubmitButtonDisabled()}
          style={{...styles.button, ...(isSubmitButtonDisabled() ? styles.disabledButton : {})}}
        >
          {isSubmitting ? 'Adding...' : 'Add Book'}
        </button>
      </form>

      <hr style={styles.hr} />
      
      <div style={styles.gridContainer}>
        <h2 style={styles.heading}>📖 Book List</h2>
        <div data-testid="data-grid-books">
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.thTd, ...styles.th}}>ID</th>
                <th style={{...styles.thTd, ...styles.th}}>Title</th>
                <th style={{...styles.thTd, ...styles.th}}>Author</th>
                <th style={{...styles.thTd, ...styles.th}}>ISBN</th>
                <th style={{...styles.thTd, ...styles.th}}>Publication Date</th>
                <th style={{...styles.thTd, ...styles.th}}>Pages</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{...styles.thTd, ...styles.noBooksRow}}>
                    {apiError && apiError.includes("fetch") ? apiError : "No books available. Add one above!"}
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id} data-testid={`data-grid-row-${book.id}`}>
                    <td data-testid={`data-grid-cell-id-${book.id}`} style={styles.thTd}>{book.id}</td>
                    <td data-testid={`data-grid-cell-title-${book.id}`} style={styles.thTd}>{book.title}</td>
                    <td data-testid={`data-grid-cell-author-${book.id}`} style={styles.thTd}>{book.author}</td>
                    <td data-testid={`data-grid-cell-isbn-${book.id}`} style={styles.thTd}>{book.isbn}</td>
                    <td data-testid={`data-grid-cell-publication-date-${book.id}`} style={styles.thTd}>
                      {book.publication_date} {/* API provides YYYY-MM-DD */}
                    </td>
                    <td data-testid={`data-grid-cell-pages-${book.id}`} style={styles.thTd}>{book.number_of_pages}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Gemini;