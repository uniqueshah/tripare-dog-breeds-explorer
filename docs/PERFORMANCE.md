 # Performance Guide — Tripare Dog Breeds Explorer

## 1. Overview

Tripare Dog Breeds Explorer is built with React Native and Expo. Its performance strategy focuses on responsive browsing, efficient image loading, predictable data synchronization, and smooth interactions when working with a large collection of dog breeds.

The application uses several techniques to support these goals:

- Local SQLite caching.
- Paginated API requests.
- Reusable UI components.
- Expo Image for image rendering and caching.
- Centralized filtering logic.
- TypeScript for maintainable data handling.

This document describes the existing design and identifies additional optimizations that can be introduced when measurements show they are necessary.

## 2. Performance Goals

The main goals are to:

- Display previously cached breeds quickly.
- Avoid unnecessary network requests.
- Keep scrolling responsive.
- Reduce repeated image downloads.
- Keep search and filtering predictable.
- Avoid replacing valid cached data with incomplete results.
- Identify performance problems through measurement rather than guesswork.

## 3. Data Loading and SQLite Caching

### Cache-first loading

The breed list reads cached data from SQLite before completing the remote synchronization process.

The general flow is:

```text
Open breed list
      |
      v
Read SQLite cache
      |
      v
Display cached breeds, if available
      |
      v
Fetch the latest breed collection
      |
      v
Replace cache after successful fetch
      |
      v
Update the displayed data
```

### Benefits

- Returning users can see previously downloaded breeds without waiting for the API.
- Cached data remains useful when the device is offline.
- The app can refresh the collection without requiring users to start with an empty list.
- Failed remote requests do not need to erase existing cached data.

### Performance considerations

SQLite queries should retrieve only the data required by the relevant operation. Indexes should be maintained for frequently queried columns, and database changes should be evaluated against realistic collection sizes.

If the application eventually stores substantially more data, consider measuring database query time and evaluating whether additional indexes or more targeted queries are warranted.

## 4. API Pagination

The API service retrieves breed records using the server's pagination metadata.

The service follows the available next-page information