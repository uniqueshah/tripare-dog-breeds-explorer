
import type {
  Breed,
  BreedsPageResponse,
} from "../types/breed";

import { ApiError, getJson } from "./client";

const PAGE_SIZE = 48;

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parseBreedsResponse(
  payload: unknown,
): BreedsPageResponse {
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    throw new ApiError("Unexpected breeds API response.");
  }

  const breeds: Breed[] = payload.data.map(
    (item: unknown): Breed => {
      if (
        !isRecord(item) ||
        typeof item.id !== "string" ||
        item.type !== "breed" ||
        !isRecord(item.attributes) ||
        typeof item.attributes.name !== "string"
      ) {
        throw new ApiError("Invalid breed record received.");
      }

      return item as unknown as Breed;
    },
  );

  let meta: BreedsPageResponse["meta"];

  if (isRecord(payload.meta)) {
    const pagination = payload.meta.pagination;

    if (isRecord(pagination)) {
      meta = {
        pagination: {
          current:
            typeof pagination.current === "number"
              ? pagination.current
              : undefined,
          next:
            typeof pagination.next === "number"
              ? pagination.next
              : undefined,
          last:
            typeof pagination.last === "number"
              ? pagination.last
              : undefined,
          records:
            typeof pagination.records === "number"
              ? pagination.records
              : undefined,
        },
      };
    }
  }

  return { data: breeds, meta };
}

export async function fetchBreedPage(
  page = 1,
  pageSize = PAGE_SIZE,
): Promise<BreedsPageResponse> {
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 1000
  ) {
    throw new Error("Invalid pagination parameters.");
  }

  const query = new URLSearchParams({
    "page[number]": String(page),
    "page[size]": String(pageSize),
  });

  const payload = await getJson(`/breeds?${query.toString()}`);

  return parseBreedsResponse(payload);
}

export async function fetchAllBreeds(): Promise<Breed[]> {
  const breedsById = new Map<string, Breed>();
  const visitedPages = new Set<number>();

  let page = 1;

  while (true) {
    if (visitedPages.has(page)) {
      throw new ApiError("Invalid pagination: repeated page.");
    }

    visitedPages.add(page);

    const result = await fetchBreedPage(page);

    // console.log("all breeds: ", result);

    for (const breed of result.data) {
      breedsById.set(breed.id, breed);
    }

    const nextPage = result.meta?.pagination?.next;

    if (nextPage === undefined) {
      break;
    }

    if (
      !Number.isInteger(nextPage) ||
      nextPage <= page
    ) {
      throw new ApiError("Invalid next-page metadata.");
    }

    page = nextPage;
  }

  return Array.from(breedsById.values());
}


export async function fetchBreedById(
  id: string,
): Promise<Breed> {
  if (!id.trim()) {
    throw new ApiError("A breed ID is required.");
  }

  const payload = await getJson(
    `/breeds/${encodeURIComponent(id)}`,
  );

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("data" in payload)
  ) {
    throw new ApiError("Invalid breed response.");
  }

  const breed = payload.data;

  if (
    typeof breed !== "object" ||
    breed === null ||
    !("id" in breed) ||
    !("type" in breed) ||
    !("attributes" in breed) ||
    typeof breed.id !== "string" ||
    breed.type !== "breed" ||
    typeof breed.attributes !== "object" ||
    breed.attributes === null ||
    !("name" in breed.attributes) ||
    typeof breed.attributes.name !== "string"
  ) {
    throw new ApiError("Invalid breed data.");
  }

  return breed as Breed;
}
