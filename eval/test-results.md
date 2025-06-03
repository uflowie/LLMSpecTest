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

