
import type { Breed } from "../types/breed";

const mockRunAsync = jest.fn();
const mockWithTransactionAsync = jest.fn();
const mockExecAsync = jest.fn();
const mockOpenDatabaseAsync = jest.fn();

jest.mock("expo-sqlite", () => ({
  openDatabaseAsync: (...args: unknown[]) =>
    mockOpenDatabaseAsync(...args),
}));

import { replaceAllBreeds } from "../database/breedsDatabase";

const makeBreed = (id: string, name: string): Breed => ({
  id,
  type: "breed",
  attributes: {
    name,
  },
});

describe("replaceAllBreeds", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockRunAsync.mockResolvedValue({ changes: 1 });
    mockExecAsync.mockResolvedValue(undefined);

    mockWithTransactionAsync.mockImplementation(
      async (callback: () => Promise<void>) => callback(),
    );

    mockOpenDatabaseAsync.mockResolvedValue({
      runAsync: mockRunAsync,
      execAsync: mockExecAsync,
      withTransactionAsync: mockWithTransactionAsync,
      getAllAsync: jest.fn().mockResolvedValue([]),
      getFirstAsync: jest.fn().mockResolvedValue(null),
    });
  });

  it("deletes the previous collection and inserts the replacement breeds in a transaction", async () => {
    const breeds = [
      makeBreed("breed-1", "Golden Retriever"),
      makeBreed("breed-2", "Beagle"),
    ];

    await replaceAllBreeds(breeds);

    expect(mockWithTransactionAsync).toHaveBeenCalledTimes(1);

    expect(mockRunAsync).toHaveBeenNthCalledWith(
      1,
      "DELETE FROM breeds",
    );

    expect(mockRunAsync).toHaveBeenCalledTimes(3);

    expect(mockRunAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("INSERT INTO breeds"),
      "breed-1",
      "Golden Retriever",
      null,
      JSON.stringify(breeds[0]),
      expect.any(Number),
    );

    expect(mockRunAsync).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("INSERT INTO breeds"),
      "breed-2",
      "Beagle",
      null,
      JSON.stringify(breeds[1]),
      expect.any(Number),
    );
  });

  it("propagates an error if an insert fails", async () => {
    const failure = new Error("Insert failed");

    mockRunAsync.mockImplementation(async (sql: string) => {
      if (sql.includes("INSERT INTO breeds")) {
        throw failure;
      }

      return { changes: 1 };
    });

    mockWithTransactionAsync.mockImplementation(
      async (callback: () => Promise<void>) => callback(),
    );

    await expect(
      replaceAllBreeds([makeBreed("breed-1", "Beagle")]),
    ).rejects.toThrow("Insert failed");
  });

  it("can replace the collection with an empty list", async () => {
    await replaceAllBreeds([]);

    expect(mockWithTransactionAsync).toHaveBeenCalledTimes(1);
    expect(mockRunAsync).toHaveBeenCalledTimes(1);
    expect(mockRunAsync).toHaveBeenCalledWith("DELETE FROM breeds");
  });
});
