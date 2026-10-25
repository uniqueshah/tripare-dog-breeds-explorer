# DECISIONS.md

# Technical Decisions — Tripare Dog Breeds Explorer

This document records the key technical decisions made for the Tripare Dog Breeds Explorer application, including the rationale, trade-offs, and implementation approach.

## 1. State Management

**Decision:** Use React's built-in state management (`useState`, `useEffect`, and other hooks as needed) for screen-level state. Avoid introducing a global state management library unless the application requirements justify it.

**Why this choice?**
- The application has a relatively focused scope, primarily displaying dog breeds and their details.
- React hooks provide a simple, maintainable way to manage loading states, API results, and user interactions.
- Avoiding an additional library reduces dependencies, boilerplate, and maintenance overhead.
- Shared data can be lifted to a common component or exposed through React Context if cross-screen sharing becomes necessary.

**Trade-offs:**
- React hooks alone do not provide a centralized global store.
- As application complexity grows, coordinating shared state across multiple screens may become harder.
- A library such as Redux Toolkit or Zustand can be introduced if more complex shared state or workflows emerge.

## 2. Database Choice

**Decision:** Use Expo SQLite for local persistent storage.

**Why this choice?**
- SQLite stores data directly on the device and supports access without an internet connection.
- Data persists across application restarts, unlike in-memory state.
- It is suitable for storing breed information and other structured application data.
- It supports SQL queries and constraints, making local data management predictable.

**Trade-offs:**
- The application must handle database initialization, schema changes, and cache updates.
- Cached data can become stale when the remote API changes.
- SQLite stores structured data but does not automatically download or cache remote image files.

## 3. Offline-First Data and Sync Strategy

**Decision:** Use a local-cache-first reading strategy with remote API refresh when connectivity is available.

**Reading strategy:**
1. Initialize the SQLite database.
2. Read locally cached breed data and display it when available.
3. Check network availability and attempt to retrieve the latest data from the remote API.
4. If the request succeeds, update SQLite and refresh the displayed data.
5. If the request fails, continue using cached data when available.
6. If no cached data exists, display a suitable error state with a retry option.

**Synchronization strategy:**
- The remote API is the source of truth for breed information.
- SQLite is the local cache used to improve responsiveness and support offline browsing.
- Refresh cached records using stable breed identifiers to avoid duplicate entries.
- Handle failed refreshes without deleting previously valid cached data.
- Avoid unnecessary requests and database writes where possible