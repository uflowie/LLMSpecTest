This is a comparative evaluation of how well large language models can implement a simple form and data grid in the browser. 

## Models and Prompts
We are currently benchmarking the following models:

- Claude Opus 4
- Gemini 2.5 Pro
- GPT o3
- Mistral
- Gemini Diffusion

Each model is used through their respective chat interface. The prompts are modified on a per-framework basis, which can be found in the clients subdirectories. This is mostly a one-shot test; we do not give the models an opportunity to fix their mistakes unless the code does not compile.

## Spec and Tests
The spec is stored in `spec.md` and is designed for Playwright testing. The tests are stored in `eval/tests/books.spec.ts`. The tests are framework-agnostic and should all pass in a correct implementation.

## Frameworks
We are currently benchmarking the following frameworks:

- Angular
- Blazor
- Vanilla HTML/CSS/JS
- HTMX
- Vanilla React

Models are only expected to implement the page including the form and the data grid. The scaffolding for the frameworks is provided in the clients subdirectories.

## Running the code
We provide a Dockerfile that includes all the dependencies and can be used to run the tests. The docker-compose.yml file can be used to run the tests in a container and receive the results in the markdown format used below. Alternatively, you can run the tests locally by installing the required Node and .NET dependencies and then running `npx playwright test` in the `eval` directory.

## Angular Tests

| Test case | claude | gemini | gemini-diffusion | mistral | o3 |
|---|---|---|---|---|---|
| Author validation | ✅ | ✅ | ✅ | ✅ | ✅ |
| ISBN validation | ✅ | ✅ | ✅ | ✅ | ✅ |
| Number of Pages validation | ✅ | ✅ | ✅ | ✅ | ✅ |
| Publication Date validation | ✅ | ✅ | ✅ | ✅ | ✅ |
| TC1: Initial form rendering and submit button state | ✅ | ✅ | ✅ | ✅ | ✅ |
| TC1b: Default publication date value | ✅ | ✅ | ✅ | ✅ | ✅ |
| TC3: Submit button state reflects form validity | ✅ | ✅ | ✅ | ✅ | ✅ |
| TC4: Successful form submission, clears form, and updates data grid | ❌ | ❌ | ✅ | ✅ | ✅ |
| TC5: UI prevents submission of invalid forms | ✅ | ✅ | ✅ | ✅ | ✅ |
| TC6: verify POST body matches form fields | ✅ | ✅ | ✅ | ✅ | ✅ |
| Title validation | ✅ | ✅ | ✅ | ✅ | ✅ |

## Blazor Tests

| Test case | claude | gemini | geminidiffusion | mistral | o3 |
|---|---|---|---|---|---|
| Author validation | ❌ | ✅ | ❌ | ❌ | ❌ |
| ISBN validation | ❌ | ✅ | ❌ | ❌ | ❌ |
| Number of Pages validation | ❌ | ✅ | ❌ | ❌ | ❌ |
| Publication Date validation | ❌ | ✅ | ❌ | ❌ | ❌ |
| TC1: Initial form rendering and submit button state | ❌ | ✅ | ❌ | ✅ | ❌ |
| TC1b: Default publication date value | ❌ | ✅ | ✅ | ✅ | ✅ |
| TC3: Submit button state reflects form validity | ❌ | ✅ | ❌ | ❌ | ❌ |
| TC4: Successful form submission, clears form, and updates data grid | ❌ | ❌ | ❌ | ❌ | ❌ |
| TC5: UI prevents submission of invalid forms | ❌ | ✅ | ❌ | ✅ | ❌ |
| TC6: verify POST body matches form fields | ❌ | ❌ | ❌ | ❌ | ❌ |
| Title validation | ❌ | ✅ | ❌ | ❌ | ❌ |

## Htmx Tests

| Test case | claude | gemini | gemini-diffusion | mistral | o3 |
|---|---|---|---|---|---|
| Author validation | ✅ | ❌ | ✅ | ✅ | ❌ |
| ISBN validation | ✅ | ❌ | ✅ | ✅ | ❌ |
| Number of Pages validation | ✅ | ❌ | ❌ | ✅ | ❌ |
| Publication Date validation | ❌ | ❌ | ❌ | ❌ | ❌ |
| TC1: Initial form rendering and submit button state | ✅ | ✅ | ✅ | ✅ | ✅ |
| TC1b: Default publication date value | ✅ | ✅ | ✅ | ✅ | ✅ |
| TC3: Submit button state reflects form validity | ✅ | ✅ | ✅ | ✅ | ✅ |
| TC4: Successful form submission, clears form, and updates data grid | ❌ | ❌ | ❌ | ✅ | ❌ |
| TC5: UI prevents submission of invalid forms | ✅ | ✅ | ✅ | ✅ | ✅ |
| TC6: verify POST body matches form fields | ❌ | ❌ | ❌ | ✅ | ❌ |
| Title validation | ✅ | ❌ | ✅ | ✅ | ❌ |

## React Tests

| Test case | claude | gemini | gemini-diffusion | mistral | o3 |
|---|---|---|---|---|---|
| Author validation | ✅ | ✅ | ✅ | ❌ | ✅ |
| ISBN validation | ✅ | ✅ | ✅ | ❌ | ✅ |
| Number of Pages validation | ✅ | ✅ | ❌ | ❌ | ✅ |
| Publication Date validation | ✅ | ✅ | ✅ | ❌ | ❌ |
| TC1: Initial form rendering and submit button state | ✅ | ✅ | ✅ | ✅ | ✅ |
| TC1b: Default publication date value | ✅ | ✅ | ✅ | ✅ | ✅ |
| TC3: Submit button state reflects form validity | ✅ | ✅ | ❌ | ✅ | ✅ |
| TC4: Successful form submission, clears form, and updates data grid | ✅ | ✅ | ❌ | ✅ | ✅ |
| TC5: UI prevents submission of invalid forms | ✅ | ✅ | ✅ | ✅ | ✅ |
| TC6: verify POST body matches form fields | ✅ | ✅ | ❌ | ❌ | ✅ |
| Title validation | ✅ | ✅ | ✅ | ❌ | ✅ |

## Vanilla Tests

| Test case | claude | gemini | gemini-diffusion | mistral | o3 |
|---|---|---|---|---|---|
| Author validation | ❌ | ✅ | ✅ | ❌ | ❌ |
| ISBN validation | ❌ | ✅ | ✅ | ❌ | ❌ |
| Number of Pages validation | ❌ | ❌ | ✅ | ❌ | ❌ |
| Publication Date validation | ❌ | ❌ | ✅ | ❌ | ❌ |
| TC1: Initial form rendering and submit button state | ✅ | ❌ | ✅ | ✅ | ✅ |
| TC1b: Default publication date value | ✅ | ❌ | ✅ | ✅ | ✅ |
| TC3: Submit button state reflects form validity | ✅ | ❌ | ✅ | ✅ | ❌ |
| TC4: Successful form submission, clears form, and updates data grid | ✅ | ❌ | ✅ | ❌ | ❌ |
| TC5: UI prevents submission of invalid forms | ✅ | ✅ | ✅ | ✅ | ✅ |
| TC6: verify POST body matches form fields | ✅ | ❌ | ✅ | ✅ | ❌ |
| Title validation | ❌ | ✅ | ✅ | ❌ | ❌ |
