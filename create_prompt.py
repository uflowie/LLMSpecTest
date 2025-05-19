#!/usr/bin/env python3
"""
This script creates a prompt file by combining a spec markdown file and 
adding framework-agnostic instructions for the LLM.
"""

import os
import argparse

# Default file paths (can be overridden by CLI args)
DEFAULT_SPEC_PATH = "spec.md"
DEFAULT_OUTPUT_PATH = "prompts/{framework}_implementation_prompt.md"


def parse_args():
    parser = argparse.ArgumentParser(
        description="Generate a prompt file for LLM-based implementation tasks."
    )
    parser.add_argument(
        '-f', '--framework',
        required=True,
        help="Name of the target framework (e.g., Blazor, React, Vue)",
    )
    parser.add_argument(
        '--spec-path',
        default=DEFAULT_SPEC_PATH,
        help=f"Path to the spec markdown file (default: {DEFAULT_SPEC_PATH})"
    )
    parser.add_argument(
        '--output-path',
        help="Path to write the generated prompt file. ``{framework}`` in the path will be replaced."
    )
    return parser.parse_args()


def read_file(path: str) -> str:
    """Read and return the contents of a text file."""
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def create_prompt_file(framework: str, spec_path: str, output_path: str):
    """
    Generate the prompt content based on the given framework and write it to output_path.
    """
    # Prepare output directory
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Read inputs
    spec_content = read_file(spec_path)

    # Build prompt
    title = f"{framework} Book Management Implementation Task"
    overview = (
        f"Implement a {framework} component that provides a form for creating book entries "
        "and a data grid to display them. The implementation should follow the specification "
        "and use the API defined below. Do not use any third-party "
        "libraries for the form or data grid. There are no pre-installed CSS libraries."
    )

    requirements = [
        f"Create a {framework} component that implements the form according to the specification.",
        "Implement client-side validation as described in the spec.",
        "Connect to the API to submit new books and retrieve the book list.",
        f"Implement the data grid in {framework} as specified.",
        "Ensure all data-testid attributes are correctly set for testing.",
        "Make sure the form follows best practices for accessibility.",
        "Output only a single file."
    ]

    prompt_lines = [
        f"# {title}",
        "## Task Overview",
        overview,
        "## Specifications",
        "### UI/UX Specification",
        "```markdown",
        spec_content.strip(),
        "```",
        "### API Specification",
        "The application communicates with a REST API offering the following endpoints:",
        "- **GET /books**: returns a JSON array of book objects (newest first), each with properties:",
        "  - `id` (integer)",
        "  - `title` (string)",
        "  - `author` (string)",
        "  - `isbn` (string of exactly 13 digits)",
        "  - `publication_date` (string in `YYYY-MM-DD` format)",
        "  - `number_of_pages` (integer)",
        "- **POST /books**: accepts a JSON body with fields:",
        "  - `title` (string)",
        "  - `author` (string)",
        "  - `isbn` (string)",
        "  - `publication_date` (string `YYYY-MM-DD`)",
        "  - `number_of_pages` (integer)",
        "Returns the created book object with a unique `id`. No additional endpoints are required.",
        "## Implementation Requirements",
    ]
    for idx, req in enumerate(requirements, 1):
        prompt_lines.append(f"{idx}. {req}")

    prompt_content = "\n".join(prompt_lines)

    # Write out
    with open(output_path, 'w', encoding='utf-8') as out_file:
        out_file.write(prompt_content)

    print(f"Prompt file created at {output_path}")


if __name__ == "__main__":
    args = parse_args()
    framework = args.framework
    spec_path = args.spec_path
    default_out = DEFAULT_OUTPUT_PATH.format(framework=framework.lower())
    output_path = args.output_path or default_out

    create_prompt_file(framework, spec_path, output_path)
