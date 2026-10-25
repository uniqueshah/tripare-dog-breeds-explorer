
import type {
  BreedGroup,
  GroupsPageResponse,
} from "../types/breed";

import { ApiError, getJson } from "./client";

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parseGroupsResponse(
  payload: unknown,
): GroupsPageResponse {
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    throw new ApiError("Unexpected groups API response.");
  }

  const groups: BreedGroup[] = payload.data.map(
    (item: unknown): BreedGroup => {
      if (
        !isRecord(item) ||
        typeof item.id !== "string" ||
        item.type !== "group" ||
        !isRecord(item.attributes) ||
        typeof item.attributes.name !== "string"
      ) {
        throw new ApiError("Invalid group record received.");
      }

      return item as unknown as BreedGroup;
    },
  );

  let meta: GroupsPageResponse["meta"];

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

  return { data: groups, meta };
}

export async function fetchAllGroups(): Promise<BreedGroup[]> {
  const groupsById = new Map<string, BreedGroup>();
  const visitedPages = new Set<number>();
  let page = 1;

  while (true) {
    if (visitedPages.has(page)) {
      throw new ApiError("Invalid group pagination.");
    }

    visitedPages.add(page);

    const payload = await getJson(
      `/groups?page[number]=${page}&page[size]=100`,
    );

    const result = parseGroupsResponse(payload);

    // console.log("all groups: ", result);

    for (const group of result.data) {
      groupsById.set(group.id, group);
    }

    const nextPage = result.meta?.pagination?.next;

    if (nextPage === undefined) {
      break;
    }

    if (!Number.isInteger(nextPage) || nextPage <= page) {
      throw new ApiError("Invalid group pagination metadata.");
    }

    page = nextPage;
  }

  return Array.from(groupsById.values());
}
