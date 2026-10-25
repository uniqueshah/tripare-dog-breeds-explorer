# Testing Guide — Tripare Dog Breeds Explorer

## 1. Overview

Tripare Dog Breeds Explorer uses Jest and the Jest Expo preset for automated testing. React Native Testing Library is available for testing UI components and user interactions.

The goal of the testing strategy is to verify that the application handles data correctly, applies filters consistently, manages pagination safely, and provides reliable offline-first behavior.

Testing is organized around three main levels:

- **Unit tests:** Verify individual functions and business rules.
- **Component tests:** Verify UI rendering and user interactions.
- **Integration tests:** Verify interactions between modules, such as API fetching and local database synchronization.

Not every level needs to be implemented for every feature. Tests should focus on important behavior and realistic failure scenarios.

## 2. Testing Tools

| Tool | Purpose |
|---|---|
| Jest | Test runner, assertions, mocks, and test execution |
| Jest Expo | Expo-compatible Jest configuration |
| React Native Testing Library | Render components and test user-visible behavior |
| TypeScript | Catch type errors before runtime |

## 3. Running Tests

Run these commands from the project root.

### Run all tests

```bash
npm test -- --runInBand
```

The `--runInBand` option runs tests sequentially in a single process. It can be useful when debugging tests involving shared resources or native-module mocks.

### Run tests in watch mode

```bash
npm run test:watch
```

This reruns relevant tests as files change.

### Run TypeScript checks

```bash
npx tsc --noEmit
```

This checks TypeScript types without generating JavaScript output. It complements automated tests but does not replace them.

### Run a specific test file

```bash
npx jest src/utils/filterBreeds.test.ts --runInBand
```

Replace the example path with the actual path of the test file you want to run.

## 4. Recommended Test Organization

Keep tests close to the code they verify or use a dedicated test directory. Choose one convention and apply it consistently.

Example structure:

```text
src/
├── api/
│   ├── client.ts
│   ├── breeds.ts
│   └── breeds.test.ts
├── database/
│   ├── breedsDatabase.ts
│   └── breedsDatabase.test.ts
├── utils/
│   ├── filterBreeds.ts
│   └── filterBreeds.test.ts
└── components/
    ├── BreedCard.tsx
    └── BreedCard.test.tsx
```

This is a recommended structure. A listed test file should only be considered present after it has actually been created.

## 5. API Service Tests

The API service is responsible for fetching breed data and handling pagination.

Tests for `src/api/breeds.ts` should cover:

- Fetching a single page successfully.
- Constructing the correct pagination query parameters.
- Following pagination metadata until no next page remains.
- Combining results from multiple pages.
- Avoiding duplicate breed IDs.
- Rejecting invalid pagination metadata.
- Rejecting the complete fetch when a later page fails.
- Handling empty results.

### Example: Testing pagination

A test can mock the HTTP response for two pages:

1. The first response contains breed A and indicates that another page exists.
2. The second response contains breed B and indicates that pagination is complete.
3. The service should return both breeds.

Also test duplicate IDs across pages to verify that the combined result does not contain duplicate records.

**Important:** Tests should mock network responses rather than depend on the live Dog API. This keeps them predictable and avoids failures caused by network outages or API changes.

## 6. API Client Tests

The shared API client in `src/api/client.ts` should be tested independently where practical.

Cover these scenarios:

- Successful HTTP response with valid JSON.
- Non-success HTTP status.
- Network request failure.
- Invalid JSON response.
- Useful error information for callers.

Mock `fetch` so each scenario can be reproduced without making a real network request.

## 7. Filtering Utility Tests

The pure filtering utility, `src/utils/filterBreeds.ts`, is a good candidate for unit testing.

Recommended cases:

| Scenario | Expected behavior |
|---|---|
| Empty search and no filters | All supplied breeds match |
| Search by breed name | Matching breed is returned |
| Search by alternative name | Breed with matching `other_names` is returned |
| Group filter | Only breeds in the selected group match |
| Size filter | Size is derived from the available weight or fallback height data |
| Coat-length filter | Only matching breeds are returned |
| Hypoallergenic filter | The selected value is respected |
| Trait threshold | Breeds meeting the selected threshold match |
| Missing trait value | Breed does not match a selected threshold requiring that value |
| Combined filters | A breed must satisfy all active criteria |

Use small, controlled breed fixtures so each test demonstrates one behavior clearly.

## 8. SQLite and Synchronization Tests

The database module in `src/database/breedsDatabase.ts` manages persistent breed data and synchronization metadata.

Tests should cover:

- Database initialization and table creation.
- Reading cached breeds.
- Saving breed records.
- Reading and writing the last successful synchronization timestamp.
- Replacing the cached breed collection.
- Ensuring a failed remote fetch does not trigger a successful synchronization timestamp update.
- Ensuring an API failure does not cause existing cached breeds to be discarded.

SQLite tests may require a test database or mocked database operations, depending on the Expo SQLite APIs used by the implementation.

Avoid sharing mutable database state between tests unless the test setup deliberately controls and resets it.

## 9. Component Tests

Use React Native Testing Library to test components through their visible behavior rather than their internal implementation.

### Breed card

Recommended cases:

- Renders the breed name.
- Renders the available image.
- Displays the fallback visual when an image is unavailable.
- Handles long breed names without breaking the component.

### Breed list screen

Recommended cases:

- Displays cached breeds when available.
- Shows an appropriate loading state.
- Displays the fetched breed collection.
- Shows a synchronization error when refreshing fails.
- Retains cached results after a failed refresh.
- Allows a retry when the relevant error state is displayed.

### Gallery

Recommended cases:

- Renders available gallery images.
- Uses the intended image fallback when a preferred size is missing.
- Displays available attribution information.
- Handles missing image metadata safely.

Mock native modules when required by the Expo test environment, and avoid testing implementation details that users cannot observe.

## 10. Test Data and Mocking

Use reusable fixtures for breeds and API responses.

Good test fixtures should:

- Contain only the fields required by the test.
- Represent realistic API data.
- Include cases with missing or optional fields.
- Be independent of live server responses