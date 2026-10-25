
import { fetchBreedPage } from "../api/breeds";
// import {global} from "@jest/globals";

const mockBreed = {
  id: "affenpinscher",
  type: "breed",
  attributes: {
    name: "Affenpinscher",
  },
};

describe("fetchBreedPage", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns breeds from a successful API response", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        data: [mockBreed],
        meta: {
          pagination: {
            current: 1,
            next: 2,
            last: 6,
            records: 283,
          },
        },
      }),
    } as Response);

    const result = await fetchBreedPage(1, 48);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].attributes.name).toBe("Affenpinscher");
    expect(result.meta?.pagination?.next).toBe(2);
  });

  it("rejects when the API returns an error status", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: async () => "Server error",
    } as Response);

    await expect(fetchBreedPage(1, 48)).rejects.toThrow();
  });
});
