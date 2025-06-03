import React, { useState, useEffect } from "react";

/**
 * BookManager component
 * Implements the Book Entry Form and Data Grid as specified.
 */
export default function O3() {
  const todayISO = new Date().toISOString().split("T")[0];

  // -----------------------
  // State Management
  // -----------------------
  const initialFormState = {
    title: "",
    author: "",
    isbn: "",
    publication_date: todayISO,
    number_of_pages: "",
  };

  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [books, setBooks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // -----------------------
  // Fetch existing books on mount
  // -----------------------
  useEffect(() => {
    fetch("/books")
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch(console.error);
  }, []);

  // -----------------------
  // Validation helpers
  // -----------------------
  const validators = {
    title: (value) => {
      if (!value.trim()) return "Title must be between 2 and 100 characters.";
      if (value.length < 2 || value.length > 100)
        return "Title must be between 2 and 100 characters.";
    },
    author: (value) => {
      if (!value.trim())
        return "Author name must be between 2 and 60 characters.";
      if (value.length < 2 || value.length > 60)
        return "Author name must be between 2 and 60 characters.";
    },
    isbn: (value) => {
      if (!/^\d{13}$/.test(value))
        return "ISBN must contain exactly 13 numeric digits.";
    },
    publication_date: (value) => {
      if (!value) return "Publication Date cannot be in the future.";
      if (value > todayISO) return "Publication Date cannot be in the future.";
    },
    number_of_pages: (value) => {
      const num = Number(value);
      if (!Number.isInteger(num) || num < 1 || num > 5000)
        return "Number of pages must be between 1 and 5000.";
    },
  };

  const validateField = (name, value) => {
    const validator = validators[name];
    return validator ? validator(value) : undefined;
  };

  const validateForm = (currentForm) => {
    const newErrors = {};
    Object.keys(currentForm).forEach((key) => {
      const error = validateField(key, currentForm[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  // -----------------------
  // Handlers
  // -----------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    // real‑time validation
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          number_of_pages: Number(form.number_of_pages), // ensure integer
        }),
      });
      if (!res.ok) throw new Error("Failed to add book");
      const newBook = await res.json();
      setBooks((prev) => [newBook, ...prev]); // newest on top
      setForm(initialFormState);
      setErrors({});
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -----------------------
  // Derived State
  // -----------------------
  const isFormValid =
    Object.values(form).every((v) => v !== "" && v !== null && v !== undefined) &&
    Object.values(errors).every((e) => !e);

  // -----------------------
  // Render helpers
  // -----------------------
  const renderError = (field) =>
    errors[field] ? (
      <p
        className="text-red-700 text-sm mt-1"
        data-testid={`error-${field === "number_of_pages" ? "pages" : field}`}
        role="alert"
      >
        {errors[field]}
      </p>
    ) : null;

  // -----------------------
  // JSX
  // -----------------------
  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Add a Book
      </h2>

      {/* -------------------- FORM -------------------- */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="title" style={{ display: "block", fontWeight: "600", marginBottom: 4 }}>
            Book Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Enter book title"
            data-testid="input-title"
            style={{ border: "1px solid #ccc", padding: 8, width: "100%" }}
            value={form.title}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(errors.title)}
            aria-describedby="error-title"
          />
          {renderError("title")}
        </div>

        {/* Author */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="author" style={{ display: "block", fontWeight: "600", marginBottom: 4 }}>
            Author Name
          </label>
          <input
            id="author"
            name="author"
            type="text"
            placeholder="Enter author name"
            data-testid="input-author"
            style={{ border: "1px solid #ccc", padding: 8, width: "100%" }}
            value={form.author}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(errors.author)}
            aria-describedby="error-author"
          />
          {renderError("author")}
        </div>

        {/* ISBN */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="isbn" style={{ display: "block", fontWeight: "600", marginBottom: 4 }}>
            ISBN Number
          </label>
          <input
            id="isbn"
            name="isbn"
            type="text"
            placeholder="Enter 13-digit ISBN number"
            data-testid="input-isbn"
            style={{ border: "1px solid #ccc", padding: 8, width: "100%" }}
            value={form.isbn}
            onChange={handleChange}
            onBlur={handleBlur}
            inputMode="numeric"
            pattern="\d*"
            aria-invalid={Boolean(errors.isbn)}
            aria-describedby="error-isbn"
          />
          {renderError("isbn")}
        </div>

        {/* Publication Date */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="publication_date" style={{ display: "block", fontWeight: "600", marginBottom: 4 }}>
            Publication Date
          </label>
          <input
            id="publication_date"
            name="publication_date"
            type="date"
            data-testid="input-publication-date"
            style={{ border: "1px solid #ccc", padding: 8, width: "100%" }}
            value={form.publication_date}
            max={todayISO}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(errors.publication_date)}
            aria-describedby="error-publication-date"
          />
          {renderError("publication_date")}
        </div>

        {/* Number of Pages */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="number_of_pages" style={{ display: "block", fontWeight: "600", marginBottom: 4 }}>
            Number of Pages
          </label>
          <input
            id="number_of_pages"
            name="number_of_pages"
            type="number"
            placeholder="Enter number of pages"
            data-testid="input-pages"
            style={{ border: "1px solid #ccc", padding: 8, width: "100%" }}
            value={form.number_of_pages}
            onChange={handleChange}
            onBlur={handleBlur}
            min="1"
            max="5000"
            aria-invalid={Boolean(errors.number_of_pages)}
            aria-describedby="error-pages"
          />
          {renderError("number_of_pages")}
        </div>

        <button
          type="submit"
          data-testid="btn-submit-book"
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 4,
            border: "none",
            color: "#fff",
            backgroundColor: isFormValid && !isSubmitting ? "#2563eb" : "#9ca3af",
            cursor: isFormValid && !isSubmitting ? "pointer" : "not-allowed",
          }}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Book"}
        </button>
      </form>

      {/* -------------------- DATA GRID -------------------- */}
      <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginTop: "2rem", marginBottom: "1rem" }}>
        Books
      </h2>
      <table
        data-testid="data-grid-books"
        role="table"
        style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ccc" }}
      >
        <thead style={{ backgroundColor: "#f3f4f6" }}>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>ID</th>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Title</th>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Author</th>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>ISBN</th>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Publication Date</th>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Pages</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id} data-testid={`data-grid-row-${book.id}`} role="row">
              <td
                style={{ border: "1px solid #ccc", padding: 8 }}
                data-testid={`data-grid-cell-id-${book.id}`}
              >
                {book.id}
              </td>
              <td
                style={{ border: "1px solid #ccc", padding: 8 }}
                data-testid={`data-grid-cell-title-${book.id}`}
              >
                {book.title}
              </td>
              <td
                style={{ border: "1px solid #ccc", padding: 8 }}
                data-testid={`data-grid-cell-author-${book.id}`}
              >
                {book.author}
              </td>
              <td
                style={{ border: "1px solid #ccc", padding: 8 }}
                data-testid={`data-grid-cell-isbn-${book.id}`}
              >
                {book.isbn}
              </td>
              <td
                style={{ border: "1px solid #ccc", padding: 8 }}
                data-testid={`data-grid-cell-publication-date-${book.id}`}
              >
                {book.publication_date}
              </td>
              <td
                style={{ border: "1px solid #ccc", padding: 8 }}
                data-testid={`data-grid-cell-pages-${book.id}`}
              >
                {book.number_of_pages}
              </td>
            </tr>
          ))}
          {books.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "1rem" }}>
                No books found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
