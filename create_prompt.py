#!/usr/bin/env python3
"""
This script creates a prompt file by combining the spec.md and openapi.yaml files,
and adding instructions for the LLM on what to do.
"""

import os
import yaml
import json

# Define file paths
SPEC_PATH = "spec.md"
OPENAPI_PATH = "server/openapi.yaml"
OUTPUT_PATH = "prompts/blazor_implementation_prompt.md"

def read_file(file_path):
    """Read the contents of a file."""
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

def create_prompt_file():
    """Create a prompt file from spec and OpenAPI file."""
    # Create prompts directory if it doesn't exist
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    
    # Read the spec.md file
    spec_content = read_file(SPEC_PATH)
    
    # Read the OpenAPI file
    openapi_content = read_file(OPENAPI_PATH)
    
    # Parse YAML to extract important schema information
    openapi_data = yaml.safe_load(openapi_content)
    book_schema = openapi_data.get('components', {}).get('schemas', {}).get('Book', {})
    book_input_schema = openapi_data.get('components', {}).get('schemas', {}).get('BookInput', {})
    
    # Format the JSON schema in a readable way
    book_schema_str = json.dumps(book_schema, indent=2)
    book_input_schema_str = json.dumps(book_input_schema, indent=2)
    
    # Create the prompt content
    prompt_content = f"""# Blazor Book Management Implementation Task

## Task Overview

Implement a Blazor WebAssembly component that provides a form for creating book entries and a data grid to display them.
The implementation should follow the specification and use the API defined in the OpenAPI document below. Do not use any third-party libraries for the form or data grid.

## Specifications

### UI/UX Specification
```markdown
{spec_content}
```

### API Specification
The backend API is defined by the following OpenAPI schema:

Book Schema:
```json
{book_schema_str}
```

BookInput Schema (used for POST requests):
```json
{book_input_schema_str}
```

## Implementation Requirements

1. Create a Blazor component that implements the form according to the specification
2. Implement client-side validation as described in the spec
3. Connect to the API to submit new books and retrieve the book list
4. Implement the data grid as specified
5. Ensure all data-testid attributes are correctly set for testing
6. Make sure the form follows best practices for accessibility
7. Implement proper error handling for API communication

## Deliverables

1. A single Blazor component file (.razor) that implements the book form and data grid
2. Any necessary service classes for API communication
3. Any required model classes

Please implement a clean, maintainable solution using Blazor best practices.
"""

    # Write the prompt content to a file
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as file:
        file.write(prompt_content)
    
    print(f"Prompt file created at {OUTPUT_PATH}")

if __name__ == "__main__":
    create_prompt_file()