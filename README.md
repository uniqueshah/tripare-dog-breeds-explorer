# Tripare — Dog Breeds Explorer

A React Native application for exploring dog breeds, searching and filtering breed information, viewing breed details and images, and accessing previously synchronized breed data when offline.

The app is built with Expo and TypeScript, with an emphasis on maintainable architecture, reliable API integration, local persistence, and a responsive mobile experience.

## Features

### Breed discovery
- Browse dog breeds fetched from the Dog API v2.
- Search breeds by name and alternative names.
- Filter breeds by group, size, coat length, hypoallergenic status, and selected breed traits.
- Display breed summaries, descriptions, life expectancy, and images.
- View detailed breed information and image galleries with available image attribution.

### API integration
- Centralized API client for HTTP requests and error handling.
- Runtime validation of API response structures.
- Dynamic pagination instead of a hardcoded page count.
- Collection of paginated breed records with duplicate IDs removed.
- Validation of pagination parameters and next-page metadata.

### Offline-first data access
- Persist breed records locally using Expo SQLite.
- Load cached breed information when available.
- Refresh data from the remote API when connectivity permits.
- Track the last successful breed synchronization time.
- Display synchronization status and refresh errors.
- Preserve previously cached breed data when a network refresh fails before a successful replacement.

### Image handling
- Use thumbnail images for breed cards when available.
- Fall back to other available image sizes.
- Use Expo Image caching and transitions.
- Display image attribution and source/license links when provided.

### Testing and code quality
- TypeScript for static type checking.
- Jest with the Expo testing preset.
- Unit tests for breed filtering, API behavior, and SQLite-related logic.
- Automated checks for TypeScript errors and test regressions.

## Technology stack

| Technology | Purpose |
|---|---|
| React Native | Cross-platform mobile UI |
| Expo | Development and application tooling |
| TypeScript | Static typing and safer code |
| Dog API v2 | Remote breed and group data |
| Expo SQLite | Local persistence |
| Expo Image | Image loading and caching |
| React Navigation | Screen navigation |
| NetInfo | Network connectivity monitoring |
| TanStack Query | Available for server-state and query management |
| Zustand | Available for lightweight state management |
| Jest / jest-expo | Automated testing |

> The presence of a dependency in `package.json` does not necessarily mean it is actively used by every feature. Confirm actual usage in the source before describing it as part of the implemented data flow.

## Getting started

### Prerequisites

- Node.js compatible with the installed Expo SDK
- npm
- Expo Go or an appropriate Android/iOS development environment

### Installation

Clone or download the project, then navigate to its root directory.

```bash
npm install
```

### Run the application

Start the Expo development server:

```bash
npx expo start
```

Run directly on a supported target:

```bash
npm run android
npm run ios
npm run web
```

The web command requires the relevant Expo web dependencies and configuration to be available.

## Development commands

### TypeScript validation

```bash
npx tsc --noEmit
```

Checks the project for TypeScript errors without generating compiled output.

### Run the test suite

```bash
npm test -- --runInBand
```

Runs Jest tests sequentially, which can make test output easier to troubleshoot.

### Watch tests during development

```bash
npm run test:watch
```

Runs Jest in watch mode.

## API reference

- **API base URL:** `https://dogapi.dog/api/v2`
- **API documentation:** https://dogapi.dog/docs/api-v2

The application integrates with the breed and group endpoints.

| Endpoint | Purpose |
|---|---|
| `GET /breeds` | Retrieve a paginated list of breeds |
| `GET /breeds/:id` | Retrieve a specific breed |
| `GET /groups` | Retrieve breed groups |

Pagination is handled dynamically using the API response metadata. API errors should be handled through the shared client rather than duplicated across screens.

## Architecture overview

The application separates UI composition, API communication, data persistence, and shared type definitions.

```text
App.tsx
   |
   v
Screens and reusable components
   |
   +---- API layer
   |       |
   |       v
   |    Dog API v2
   |
   +---- Database layer
   |       |
   |       v
   |    Expo SQLite
   |
   +---- Shared TypeScript types
```

### Main directories

| Path | Responsibility |
|---|---|
| `App.tsx` | Application entry point |
| `src/screens/` | Screen-level UI and orchestration |
| `src/components/breeds/` | Reusable breed UI components |
| `src/api/` | API client, requests, and response parsing |
| `src/database/` | SQLite initialization and persistence |
| `src/types/` | Shared TypeScript interfaces |
| `src/utils/` | Reusable utility and filtering logic |
| `src/__tests__/` | Automated tests |

This structure keeps reusable UI, API requests, persistence, and filtering logic easier to maintain and test independently.

## Offline synchronization strategy

The breed list follows a cache-first display approach:

1. Read existing breed records from SQLite.
2. Display cached records immediately when available.
3. Attempt to fetch the latest breed collection from the API.
4. Replace the local breed collection with the successfully fetched data.
5. Record the synchronization timestamp after the data replacement succeeds.
6. If refresh fails, report the error and retain the previously cached collection.

The timestamp represents the last successful synchronization recorded by the application, rather than the time of the most recent refresh attempt.

## Filtering behavior

Filtering logic is maintained separately from the screen UI.

Supported criteria include:

- Case-insensitive breed-name and alternative-name search.
- Breed group selection.
- Size classification based on available weight or height ranges.
- Coat length.
- Hypoallergenic status.
- Minimum thresholds for selected numeric traits.

Size classification is a heuristic derived from the available breed measurements. It should not be interpreted as an official breed-size classification.

When a selected numeric trait is unavailable, that breed does not satisfy the corresponding trait threshold.

## Testing

Run the following checks before submitting changes:

```bash
npx tsc --noEmit
npm test -- --runInBand
```

The test suite should cover the following areas as the implementation evolves:

- API pagination, including multiple pages and invalid metadata.
- API failures during later pagination requests.
- Breed filtering and missing trait values.
- SQLite reads, writes, and synchronization behavior.
- Offline access and refresh-failure scenarios.

Manual device testing is also important for connectivity changes, image loading, navigation, and the overall user experience.

## Engineering considerations

- Keep API requests in the API layer rather than embedding them throughout UI components.
- Validate external data before treating it as trusted application data.
- Avoid replacing the local cache with an incomplete result after a failed API request.
- Keep filtering logic independent of React components so it can be tested in isolation.
- Prefer appropriately sized images for their display context.
- Preserve clear loading, empty, offline, and error states.
- Do not log sensitive information or unnecessary response payloads in production builds.

## Future improvements

Potential improvements include:

- Automated integration tests for offline-to-online synchronization.
- More extensive gallery and navigation tests.
- Documented release and deployment procedures.
- Performance measurements on representative Android and iOS devices.
- Continuous integration for TypeScript validation and automated tests.

## License and data attribution

Refer to the Dog API documentation for API usage terms. Image attribution and license information should be retained and displayed wherever provided by the API. The application's own source-code license should be specified separately by the project owner.
