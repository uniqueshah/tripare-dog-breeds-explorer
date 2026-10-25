
import * as SQLite from "expo-sqlite";
import type { Breed, BreedGroup } from "../types/breed";

const DATABASE_NAME = "tripare.db";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS breeds (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          group_id TEXT,
          payload TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_breeds_name
        ON breeds(name COLLATE NOCASE);

        CREATE INDEX IF NOT EXISTS idx_breeds_group
        ON breeds(group_id);

        CREATE TABLE IF NOT EXISTS breed_groups (
         id TEXT PRIMARY KEY NOT NULL,
         name TEXT NOT NULL,  
         payload TEXT NOT NULL
      );

       CREATE INDEX IF NOT EXISTS idx_breed_groups_name
       ON breed_groups(name COLLATE NOCASE);
      `);

      return db;
    })().catch((error: unknown) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parseStoredBreed(payload: string): Breed | null {
  try {
    const value: unknown = JSON.parse(payload);

    if (
      !isRecord(value) ||
      typeof value.id !== "string" ||
      value.type !== "breed" ||
      !isRecord(value.attributes) ||
      typeof value.attributes.name !== "string"
    ) {
      return null;
    }

    return value as unknown as Breed;
  } catch {
    return null;
  }
}

// Getting all breeds from the database, ordered by name (case-insensitive).
export async function getAllBreeds(): Promise<Breed[]> {
  const db = await getDatabase();

  const rows = await db.getAllAsync<{ payload: string }>(
    "SELECT payload FROM breeds ORDER BY name COLLATE NOCASE",
  );

  return rows
    .map((row) => parseStoredBreed(row.payload))
    .filter((breed): breed is Breed => breed !== null);
}

// Getting a single breed by its ID from the database.
export async function getBreedById(
  id: string,
): Promise<Breed | null> {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{ payload: string }>(
    "SELECT payload FROM breeds WHERE id = ? LIMIT 1",
    [id],
  );

  if (!result) {
    return null;
  }

  return parseStoredBreed(result.payload);
}

// Saving or updating breeds in the database. If a breed with the same ID already exists, it will be updated.
export async function saveBreeds(
  breeds: Breed[],
): Promise<void> {
  const db = await getDatabase();
  const updatedAt = Date.now();

  await db.withTransactionAsync(async () => {
    for (const breed of breeds) {
      const groupId =
        breed.relationships?.group?.data?.id ?? null;

      await db.runAsync(
        `INSERT INTO breeds (
          id, name, group_id, payload, updated_at
        )
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          group_id = excluded.group_id,
          payload = excluded.payload,
          updated_at = excluded.updated_at`,
        breed.id,
        breed.attributes.name,
        groupId,
        JSON.stringify(breed),
        updatedAt,
      );
    }
  });
}


/**
 * Replaces the cached breed collection atomically.
 * If any write fails, SQLite rolls back the transaction,
 * preserving the previous collection.
 */
export async function replaceAllBreeds(
  breeds: Breed[],
): Promise<void> {
  const db = await getDatabase();
  const updatedAt = Date.now();

  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM breeds");

    for (const breed of breeds) {
      const groupId =
        breed.relationships?.group?.data?.id ?? null;

      await db.runAsync(
        `INSERT INTO breeds (
          id, name, group_id, payload, updated_at
        )
        VALUES (?, ?, ?, ?, ?)`,
        breed.id,
        breed.attributes.name,
        groupId,
        JSON.stringify(breed),
        updatedAt,
      );
    }
  });
}


// Getting all breed groups from the database, ordered by name (case-insensitive).
export async function getAllGroups(): Promise<BreedGroup[]> {
  const db = await getDatabase();

  const rows = await db.getAllAsync<{ payload: string }>(
    "SELECT payload FROM breed_groups ORDER BY name COLLATE NOCASE",
  );

  const groups: BreedGroup[] = [];

  for (const row of rows) {
    try {
      const value: unknown = JSON.parse(row.payload);

      if (
        isRecord(value) &&
        typeof value.id === "string" &&
        value.type === "group" &&
        isRecord(value.attributes) &&
        typeof value.attributes.name === "string"
      ) {
        groups.push(value as unknown as BreedGroup);
      }
    } catch {
      // Ignore malformed rows and continue reading valid groups.
    }
  }

  return groups;
}

// Saving or updating breed groups in the database. If a group with the same ID already exists, it will be updated.
export async function saveGroups(
  groups: BreedGroup[],
): Promise<void> {
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    for (const group of groups) {
      await db.runAsync(
        `INSERT INTO breed_groups (id, name, payload)
         VALUES (?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           payload = excluded.payload`,
        group.id,
        group.attributes.name,
        JSON.stringify(group),
      );
    }
  });
}

// Saving the timestamp of the last successful breed synchronization in the database.
export async function saveLastBreedSync(
  timestamp = new Date().toISOString(),
): Promise<void> {
  const db = await getDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  await db.runAsync(
    `INSERT INTO app_metadata (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    "last_breed_sync",
    timestamp,
  );
}

// Retrieving the timestamp of the last successful breed synchronization from the database.
export async function getLastBreedSync(): Promise<string | null> {
  const db = await getDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_metadata
     WHERE key = ? LIMIT 1`,
    "last_breed_sync",
  );

  return row?.value ?? null;
}


