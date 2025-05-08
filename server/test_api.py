import os
import pytest
import requests
from datetime import date, timedelta

BASE_URL = os.getenv("BOOKS_API_URL", "http://127.0.0.1:5000")

@pytest.fixture(autouse=True)
def clear_books():
    """
    Ensure we start with an empty store. This only works because
    the in-memory store resets on server restart––make sure to
    restart the server before running tests, or add a DELETE endpoint.
    """
    # No-op, just document requirement
    yield

def test_get_initially_empty():
    resp = requests.get(f"{BASE_URL}/books")
    assert resp.status_code == 200
    assert resp.json() == []

def test_create_valid_book():
    payload = {
        "title": "A Tale of Two Cities",
        "author": "Charles Dickens",
        "isbn": "1234567890123",
        "publication_date": str(date.today()),
        "number_of_pages": 341
    }
    resp = requests.post(f"{BASE_URL}/books", json=payload)
    assert resp.status_code == 201
    book = resp.json()
    # Check fields and types
    assert book["id"] == 1
    for k in ["title","author","isbn","publication_date","number_of_pages"]:
        assert k in book
    assert book["title"] == payload["title"]
    assert book["number_of_pages"] == payload["number_of_pages"]

    # GET now returns the new book at top
    resp2 = requests.get(f"{BASE_URL}/books")
    assert resp2.status_code == 200
    arr = resp2.json()
    assert len(arr) == 1
    assert arr[0]["id"] == 1

@pytest.mark.parametrize("field,payload,expected_msgs", [
    # Title tests
    ("title",
     {"title": "", "author":"AA","isbn":"123"*5+"3","publication_date":str(date.today()),"number_of_pages":10},
     ["Title is required."]),
    ("title",
     {"title": "X","author":"AA","isbn":"1234567890123","publication_date":str(date.today()),"number_of_pages":10},
     ["Title must be between 2 and 100 characters."]),
    # Author tests
    ("author",
     {"title":"Good","author":"","isbn":"1234567890123","publication_date":str(date.today()),"number_of_pages":10},
     ["Author is required."]),
    ("author",
     {"title":"Good","author":"A","isbn":"1234567890123","publication_date":str(date.today()),"number_of_pages":10},
     ["Author name must be between 2 and 60 characters."]),
    # ISBN tests
    ("isbn",
     {"title":"Book","author":"AA","isbn":"","publication_date":str(date.today()),"number_of_pages":10},
     ["ISBN is required."]),
    ("isbn",
     {"title":"Book","author":"AA","isbn":"abc","publication_date":str(date.today()),"number_of_pages":10},
     ["ISBN must contain exactly 13 numeric digits."]),
    ("isbn",
     {"title":"Book","author":"AA","isbn":"123456789012","publication_date":str(date.today()),"number_of_pages":10},
     ["ISBN must contain exactly 13 numeric digits."]),
    # Publication date tests
    ("publication_date",
     {"title":"Book","author":"AA","isbn":"1234567890123","publication_date":"","number_of_pages":10},
     ["Publication Date is required."]),
    ("publication_date",
     {"title":"Book","author":"AA","isbn":"1234567890123","publication_date":"2030-01-01","number_of_pages":10},
     ["Publication Date cannot be in the future."]),
    ("publication_date",
     {"title":"Book","author":"AA","isbn":"1234567890123","publication_date":"not-a-date","number_of_pages":10},
     ["Publication Date must be in YYYY-MM-DD format."]),
    # Number of pages tests
    ("number_of_pages",
     {"title":"Book","author":"AA","isbn":"1234567890123","publication_date":str(date.today()),"number_of_pages":None},
     ["Number of Pages is required."]),
    ("number_of_pages",
     {"title":"Book","author":"AA","isbn":"1234567890123","publication_date":str(date.today()),"number_of_pages":"abc"},
     ["Number of Pages must be an integer."]),
    ("number_of_pages",
     {"title":"Book","author":"AA","isbn":"1234567890123","publication_date":str(date.today()),"number_of_pages":0},
     ["Number of pages must be between 1 and 5000."]),
    ("number_of_pages",
     {"title":"Book","author":"AA","isbn":"1234567890123","publication_date":str(date.today()),"number_of_pages":6000},
     ["Number of pages must be between 1 and 5000."]),
])
def test_validation_errors(field, payload, expected_msgs):
    resp = requests.post(f"{BASE_URL}/books", json=payload)
    assert resp.status_code == 400
    body = resp.json()
    assert "errors" in body, f"expected errors key in response, got {body}"
    assert field in body["errors"]
    # ensure expected message is in the list
    msgs = body["errors"][field]
    for msg in expected_msgs:
        assert any(msg in m for m in msgs), f"Expected '{msg}' in {msgs}"

def test_multiple_errors_in_one_request():
    # Title too short, ISBN invalid
    bad = {
        "title": "A",
        "author": "",        # also missing
        "isbn": "1234",
        "publication_date": "3000-01-01",
        "number_of_pages": -5
    }
    resp = requests.post(f"{BASE_URL}/books", json=bad)
    assert resp.status_code == 400
    errs = resp.json()["errors"]
    # Expect errors for title, author, isbn, publication_date, number_of_pages
    for field in ["title","author","isbn","publication_date","number_of_pages"]:
        assert field in errs

def test_non_json_body():
    # e.g. missing Content-Type or invalid JSON
    resp = requests.post(f"{BASE_URL}/books", data="not json")
    assert resp.status_code == 400
    body = resp.json()
    assert "error" in body

def test_ordering_newest_first():
    # create two valid books
    p1 = {
        "title": "First Book",
        "author": "Auth One",
        "isbn": "1111111111111",
        "publication_date": str(date.today()),
        "number_of_pages": 123
    }
    p2 = {
        "title": "Second Book",
        "author": "Auth Two",
        "isbn": "2222222222222",
        "publication_date": str(date.today()),
        "number_of_pages": 456
    }
    r1 = requests.post(f"{BASE_URL}/books", json=p1)
    assert r1.status_code == 201
    r2 = requests.post(f"{BASE_URL}/books", json=p2)
    assert r2.status_code == 201

    resp = requests.get(f"{BASE_URL}/books")
    data = resp.json()
    assert len(data) >= 2
    # newest is p2
    assert data[0]["title"] == "Second Book"
    assert data[1]["title"] == "First Book"
