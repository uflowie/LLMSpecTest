#!/usr/bin/env python3
"""
Simple in-memory Flask backend for Book entries.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, date

app = Flask(__name__)
CORS(app)  # enable if calling from a JS frontend on another origin

# In-memory storage
books = []
_next_id = 1

def validate_book(data):
    """
    Validate incoming book data.
    Returns a dict of field -> list of error messages.
    """
    errors = {}

    # Title
    title = data.get("title")
    if title is None or not isinstance(title, str) or not title.strip():
        errors.setdefault("title", []).append("Title is required.")
    else:
        t = title.strip()
        if not (2 <= len(t) <= 100):
            errors.setdefault("title", []).append("Title must be between 2 and 100 characters.")

    # Author
    author = data.get("author")
    if author is None or not isinstance(author, str) or not author.strip():
        errors.setdefault("author", []).append("Author is required.")
    else:
        a = author.strip()
        if not (2 <= len(a) <= 60):
            errors.setdefault("author", []).append("Author name must be between 2 and 60 characters.")

    # ISBN
    isbn = data.get("isbn")
    if isbn is None or not isinstance(isbn, str) or not isbn.strip():
        errors.setdefault("isbn", []).append("ISBN is required.")
    else:
        digits = isbn.strip()
        if not (digits.isdigit() and len(digits) == 13):
            errors.setdefault("isbn", []).append("ISBN must contain exactly 13 numeric digits.")

    # Publication Date
    pub_date = data.get("publication_date")
    if pub_date is None or not isinstance(pub_date, str) or not pub_date.strip():
        errors.setdefault("publication_date", []).append("Publication Date is required.")
    else:
        try:
            pd = datetime.strptime(pub_date, "%Y-%m-%d").date()
            if pd > date.today():
                errors.setdefault("publication_date", []).append("Publication Date cannot be in the future.")
        except ValueError:
            errors.setdefault("publication_date", []).append("Publication Date must be in YYYY-MM-DD format.")

    # Number of Pages
    pages = data.get("number_of_pages")
    if pages is None:
        errors.setdefault("number_of_pages", []).append("Number of Pages is required.")
    else:
        try:
            p = int(pages)
            if not (1 <= p <= 5000):
                errors.setdefault("number_of_pages", []).append("Number of pages must be between 1 and 5000.")
        except (ValueError, TypeError):
            errors.setdefault("number_of_pages", []).append("Number of Pages must be an integer.")

    return errors

@app.route("/books", methods=["GET"])
def list_books():
    """
    Return all books, newest first.
    """
    return jsonify(books), 200

@app.route("/books", methods=["POST"])
def create_book():
    """
    Validate and add a new book.
    """
    global _next_id
    data = request.get_json(force=True, silent=True)
    if data is None:
        return jsonify({"error": "Request body must be JSON"}), 400

    errors = validate_book(data)
    if errors:
        return jsonify({"errors": errors}), 400

    # Build the book record
    book = {
        "id": _next_id,
        "title": data["title"].strip(),
        "author": data["author"].strip(),
        "isbn": data["isbn"].strip(),
        "publication_date": data["publication_date"],
        "number_of_pages": int(data["number_of_pages"])
    }
    _next_id += 1

    # Prepend so newest entries come first
    books.insert(0, book)

    return jsonify(book), 201

@app.route("/")
def hello():
    return "Hello, World!", 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
