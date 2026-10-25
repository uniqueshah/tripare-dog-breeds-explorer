# Architecture — Tripare Dog Breeds Explorer

## 1. Overview

Tripare Dog Breeds Explorer is a React Native application built with Expo and TypeScript. It allows users to browse dog breeds, search and filter the available breeds, view breed details, and explore breed images.

The application follows a **separation-of-concerns approach**: screens handle presentation and user interactions, API modules handle remote data access, the database module handles local persistence, and utility functions handle reusable business logic.

The app uses an offline-first data-loading strategy. Cached breeds are displayed when available, while the app attempts to synchronize the latest data from the Dog API.

## 2. Technology Stack

| Technology | Responsibility |
|---|---|
| React Native | Cross-platform mobile UI |
| Expo | Development and native module integration |
| TypeScript | Static typing and safer data handling |
| React Navigation | Screen navigation |
| Dog API v2 | Remote breed and group data |
| Expo SQLite | Persistent local storage |
| Expo Image | Image rendering and caching |
| React Native NetInfo | Network connectivity information |
| Jest and Jest Expo | Automated testing |

TanStack Query and Zustand are present in the dependency list. Their presence alone does not mean they are responsible for the current data flow; document them as active architecture components only if the application code uses them.

## 3. High-Level Architecture

```text
┌──────────────────────────────────────┐
│           Presentation Layer         │
│                                      │
│  Breed List Screen                   │
│  Breed Detail Screen                 │
│  Breed Card / Gallery Components     │
└──────────────────┬───────────────────┘
                   │
          ┌────────┴─────────┐
          │                  │
          ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│   API Layer      │  │  Local Data Layer│
│                  │  │                  │
│ breeds.ts        │  │ breedsDatabase.ts│
│ client.ts        │  │                  │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│    Dog API v2    │  │   Expo SQLite    │
└──────────────────┘  └──────────────────┘

Shared modules:
- TypeScript types
- Filtering utilities
- Reusable UI components
- Automated tests
```

This is a logical architecture diagram. It describes module responsibilities rather than implying that every screen calls every layer directly.

## 4. Main Module Responsibilities

### Presentation layer

**Breed list screen**

- Displays available breeds.
- Supports search and filtering.
- Reads locally cached breeds.
- Initiates synchronization with the remote API.
- Displays loading, refresh, and synchronization error states.

**Breed detail screen**

- Presents information about a selected breed.
- Organizes detail content into the available tabs, such as Overview, Traits, and Gallery.

**Reusable components**

- `BreedCard.tsx` renders a breed summary and thumbnail.
- `BreedGalleryTab.tsx` renders gallery images and available attribution information.

Reusable components keep common UI behavior consistent across screens.

### API layer

**`src/api/client.ts`**

Provides the shared HTTP request functionality. It handles network failures, unsuccessful HTTP responses, JSON parsing errors, and API error reporting.

**`src/api/breeds.ts`**

Owns breed-related API operations, including:

- Fetching a page of breeds.
- Requesting pages using the API's pagination parameters.
- Fetching all available breeds by following pagination metadata.
- Avoiding duplicate breed IDs when combining pages.
- Rejecting invalid pagination metadata and failed page requests.

Keeping these responsibilities outside the screen reduces coupling between the UI and the API.

### Local persistence layer

**`src/database/breedsDatabase.ts`**

Manages the SQLite database and provides functions for:

- Opening and initializing the database.
- Creating the required tables and indexes.
- Reading cached breeds.
- Saving breed records.
- Reading and saving the last successful synchronization timestamp.
- Replacing the cached breed collection after a successful full fetch.

The database module isolates SQL operations from presentation code.

### Shared types and utilities

**`src/types/breed.ts`**

Defines the TypeScript models used by the application, including breed attributes, traits, images, pagination-related types, and breed groups.

**`src/utils/filterBreeds.ts`**

Contains reusable filtering logic, including:

- Search by breed name and alternative names.
- Group filtering.
- Size filtering derived from weight and height.
- Coat-length filtering.
- Hypoallergenic filtering.
- Trait threshold filtering.

Keeping filtering in a separate utility makes it easier to test the logic independently of React Native components.

## 5. Breed Data Flow

### Initial app load

1. The breed list screen starts loading.
2. The app reads existing breed records from SQLite.
3. If cached breeds exist, the screen can display them without waiting for the remote request.
4. The app requests the latest breed collection from the Dog API.
5. The API service retrieves pages dynamically until pagination indicates there are no more pages.
6. Once the complete collection has been fetched successfully, the app replaces the cached collection in SQLite.
7. The app records the successful synchronization timestamp and updates the displayed data.

### Data flow diagram

```text
Open Breed List
      |
      v
Read cached breeds from SQLite
      |
      v
Display cache, if available
      |
      v
Fetch all breed pages from Dog API
      |
      v
Validate pagination and combine results
      |
      v
Replace cached breed collection
      |
      v
Save successful sync timestamp
      |
      v
Update the displayed breed list
```

The cache-first approach improves perceived loading speed and allows previously cached data to remain available when the network is unavailable.

## 6. Pagination Strategy

The API service uses the pagination metadata returned by the server rather than relying on a hard-coded number of pages.

The expected process is:

1. Fetch the initial page.
2. Read the pagination metadata.
3. Request the next page when a valid next page is indicated.
4. Combine the results while avoiding duplicate breed IDs.
5. Stop when the API indicates there is no next page.

The service also guards against repeated pages and invalid pagination metadata.

A failed page request rejects the full fetch. This prevents an incomplete collection from being treated as a complete synchronization result.

## 7. Offline-First and Synchronization Behavior

SQLite provides persistent local storage, while the Dog API provides the latest remote data.

The intended synchronization behavior is:

- **Cache available, API successful:** display cached data first, then update it with the successfully fetched collection.
- **Cache available, API fails:** retain the cached collection and show an appropriate synchronization error.
- **No cache, API successful:** fetch and save the collection, then display it.
- **No cache, API fails:** show the loading/error state and provide a retry path where implemented.
- **Refresh requested:** initiate synchronization again and update the refresh state accordingly.

The database replacement operation and synchronization timestamp update are separate responsibilities. The timestamp is saved only after the replacement operation succeeds.

This design avoids marking a failed synchronization as successful. The previous cache is retained when the remote fetch fails before replacement begins.

## 8. Search and Filtering

Filtering is performed through the pure utility function in `src/utils/filterBreeds.ts`.

The UI supplies the current search term and selected filters to the utility, which returns the matching breeds.

### Supported filter behavior

- **Search:** matches breed names and alternative names.
- **Group:** matches the selected breed group.
- **Size:** derives size from available weight data, with height used as a fallback.
- **Coat length:** matches the selected coat-length option.
- **Hypoallergenic:** matches the selected value.
- **Traits:** applies selected thresholds to available trait values.

When a selected trait threshold requires a value that is missing, the breed does not match that threshold. This prevents missing data from being treated as a positive match.

Draft filter selections are kept separate from applied filters. The displayed results change when the user applies the draft selections.

## 9. Image Handling

The app uses the Expo Image component for breed thumbnails and gallery images.

Where available, different image sizes are used according to their purpose:

- `thumb` for compact list cards.
- `medium` for intermediate image use