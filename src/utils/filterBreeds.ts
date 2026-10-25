
import type { Breed } from "../types/breed";

export type Size = "small" | "medium" | "large" | null;

export type FilterableTrait =
  | "energy"
  | "trainability"
  | "good_with_children"
  | "good_with_dogs"
  | "good_with_strangers";

export type AdvancedFilters = {
  size: Size;
  coat: string | null;
  hypoallergenic: boolean | null;
  traits: Partial<Record<FilterableTrait, number>>;
};

/**
 * Determines breed size using the existing app rules:
 * Weight takes priority; height is the fallback.
 */
export function getBreedSize(breed: Breed): Size {
  const attributes = breed.attributes;

  const weights = [
    attributes.male_weight?.max,
    attributes.female_weight?.max,
  ].filter((value): value is number => typeof value === "number");

  if (weights.length > 0) {
    const maxWeight = Math.max(...weights);

    if (maxWeight <= 10) return "small";
    if (maxWeight <= 25) return "medium";
    return "large";
  }

  const heights = [
    attributes.male_height?.max,
    attributes.female_height?.max,
  ].filter((value): value is number => typeof value === "number");

  if (heights.length === 0) return null;

  const maxHeight = Math.max(...heights);

  if (maxHeight <= 40) return "small";
  if (maxHeight <= 60) return "medium";
  return "large";
}

type FilterBreedsOptions = {
  breeds: Breed[];
  searchQuery: string;
  selectedGroupIds: string[];
  filters: AdvancedFilters;
};

export function filterBreeds({
  breeds,
  searchQuery,
  selectedGroupIds,
  filters,
}: FilterBreedsOptions): Breed[] {
  const query = searchQuery.trim().toLowerCase();

  return breeds.filter((breed) => {
    const attributes = breed.attributes;

    // 1. Search by breed name or alternative name.
    const searchMatch =
      !query ||
      attributes.name.toLowerCase().includes(query) ||
      (attributes.other_names ?? []).some((name) =>
        name.toLowerCase().includes(query),
      );

    // 2. Filter by selected groups.
    const groupId = breed.relationships?.group?.data?.id;

    const groupMatch =
      selectedGroupIds.length === 0 ||
      (!!groupId && selectedGroupIds.includes(groupId));

    // 3. Filter by size.
    const sizeMatch =
      !filters.size || getBreedSize(breed) === filters.size;

    // 4. Filter by coat length.
    const coatMatch =
      !filters.coat ||
      attributes.coat?.length?.toLowerCase() === filters.coat;

    // 5. Filter by hypoallergenic status.
    const hypoMatch =
      filters.hypoallergenic === null ||
      attributes.hypoallergenic === filters.hypoallergenic;

    // 6. Every selected trait must meet its minimum score.
    const traitsMatch = (
      Object.entries(filters.traits) as [FilterableTrait, number][]
    ).every(([key, minimumScore]) => {
      const score = attributes.traits?.[key];

      return (
        typeof score === "number" && score >= minimumScore
      );
    });

    return (
      searchMatch &&
      groupMatch &&
      sizeMatch &&
      coatMatch &&
      hypoMatch &&
      traitsMatch
    );
  });
}
