import React from 'react';
const { useState, useEffect } = React;
const API_URL = 'http://localhost:3000/books'; // Assuming a local JSON Server instance

const validateBook = (book) => {
    const errors = {};
    if (!book.title || book.title.length < 2 || book.title.length > 100) {
        errors.title = 'Title must be between 2 and 100 characters.';
    }
    if (!book.author || book.author.length < 2 || book.author.length > 60) {
        errors.author = 'Author name must be between 2 and 60 characters.';
    }
    if (!book.isbn || !/^\d{13}$/.test(book.isbn)) {
        errors.isbn = 'ISBN must contain exactly 13 numeric digits.';
    }
    if (!book.publication_date) {
        errors.publication_date = 'Publication Date is required.';
    } else {
        const pubDate = new Date(book.publication_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time for comparison
        if (pubDate > today) {
            errors.publication_date = 'Publication Date cannot be in the future.';
        }
    }
    if (!book.number_of_pages || !Number.isInteger(book.number_of_pages) || book.number_of_pages < 1 || book.number_of_pages > 5000) {
        errors.number_of_pages = 'Number of pages must be between 1 and 5000.';
    }
    return errors;
};

const BookForm = ({ onAddBook }) => {
    const [book, setBook] = useState({
        title: '',
        author: '',
        isbn: '',
        publication_date: new Date().toISOString().split('T')[0], // Default to today
        number_of_pages: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBook(prev => ({ ...prev, [name]: value }));
        // Real-time validation on input change
        const newErrors = validateBook({ ...book, [name]: value });
        setErrors(prev => ({ ...prev, [name]: newErrors[name] }));
    };

    const validateForm = () => {
        const newErrors = validateBook(book);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            await onAddBook(book);
            setBook({
                title: '',
                author: '',
                isbn: '',
                publication_date: new Date().toISOString().split('T')[0],
                number_of_pages: '',
            });
            setErrors({}); // Clear errors after successful submission
        }
    };

    const isFormValid = Object.keys(errors).length === 0 && Object.values(book).every(val => val !== '');

    return (
        <div className="form-container">
            <h2>Add New Book</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="input-title">Book Title</label>
                    <input
                        type="text"
                        id="input-title"
                        name="title"
                        data-testid="input-title"
                        value={book.title}
                        onChange={handleChange}
                        onBlur={handleChange}
                        placeholder="Enter book title"
                    />
                    {errors.title && <p className="error-message" data-testid="error-title">{errors.title}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="input-author">Author Name</label>
                    <input
                        type="text"
                        id="input-author"
                        name="author"
                        data-testid="input-author"
                        value={book.author}
                        onChange={handleChange}
                        onBlur={handleChange}
                        placeholder="Enter author name"
                    />
                    {errors.author && <p className="error-message" data-testid="error-author">{errors.author}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="input-isbn">ISBN Number</label>
                    <input
                        type="text"
                        id="input-isbn"
                        name="isbn"
                        data-testid="input-isbn"
                        value={book.isbn}
                        onChange={handleChange}
                        onBlur={handleChange}
                        placeholder="Enter 13-digit ISBN number"
                    />
                    {errors.isbn && <p className="error-message" data-testid="error-isbn">{errors.isbn}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="input-publication-date">Publication Date</label>
                    <input
                        type="date"
                        id="input-publication-date"
                        name="publication_date"
                        data-testid="input-publication-date"
                        value={book.publication_date}
                        onChange={handleChange}
                        onBlur={handleChange}
                    />
                    {errors.publication_date && <p className="error-message" data-testid="error-publication-date">{errors.publication_date}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="input-pages">Number of Pages</label>
                    <input
                        type="number"
                        id="input-pages"
                        name="number_of_pages"
                        data-testid="input-pages"
                        value={book.number_of_pages}
                        onChange={handleChange}
                        onBlur={handleChange}
                        placeholder="Enter number of pages"
                    />
                    {errors.number_of_pages && <p className="error-message" data-testid="error-pages">{errors.number_of_pages}</p>}
                </div>
                <button type="submit" data-testid="btn-submit-book" disabled={!isFormValid}>
                    Add Book
                </button>
            </form>
        </div>
    );
};

const BookDataGrid = ({ books }) => {
    if (!books || books.length === 0) {
        return <p>No books added yet.</p>;
    }

    return (
        <table className="data-grid" data-testid="data-grid-books">
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
                {books.map((book) => (
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
    );
};

const GeminiDiffusion = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setBooks(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const handleAddBook = async (newBook) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBook),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const createdBook = await response.json();
            // Add the new book to the beginning of the list
            setBooks(prevBooks => [createdBook, ...prevBooks]);
        } catch (err) {
            setError(err.message);
            console.error("Failed to add book:", err);
        }
    };

    if (loading) {
        return <p>Loading books...</p>;
    }

    if (error) {
        return <p>Error fetching books: {error}</p>;
    }

    return (
        <div>
            <BookForm onAddBook={handleAddBook} />
            <BookDataGrid books={books} />
        </div>
    );
};

export default GeminiDiffusion;
