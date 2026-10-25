
import { filterBreeds, getBreedSize, type AdvancedFilters } from "../utils/filterBreeds";
import type { Breed } from "../types/breed";

const makeBreed = (
  overrides: Partial<Breed> = {},
): Breed => ({
  id: "breed-1",
  type: "breed",
  attributes: {
    name: "Golden Retriever",
    other_names: ["Golden"],
    hypoallergenic: false,
    male_weight: { min: 29, max: 34 },
    female_weight: { min: 25, max: 29 },
    coat: { length: "medium", type: "double" },
    traits: {
      energy: 5,
      trainability: 5,
      good_with_children: 5,
      good_with_dogs: 4,
      good_with_strangers: 5,
    },
  },
  ...overrides,
});

const emptyFilters: AdvancedFilters = {
  size: null,
  coat: null,
  hypoallergenic: null,
  traits: {},
};

describe("getBreedSize", () => {
  it("classifies a breed using its maximum weight", () => {
    expect(
      getBreedSize(makeBreed({
        attributes: {
          ...makeBreed().attributes,
          male_weight: { min: 5, max: 8 },
          female_weight: { min: 4, max: 9 },
        },
      })),
    ).toBe("small");
  });

  it("uses height when weight is unavailable", () => {
    expect(
      getBreedSize(makeBreed({
        attributes: {
          ...makeBreed().attributes,
          male_weight: undefined,
          female_weight: undefined,
          male_height: { min: 20, max: 35 },
          female_height: { min: 18, max: 38 },
        },
      })),
    ).toBe("small");
  });

  it("returns null when weight and height are unavailable", () => {
    expect(
      getBreedSize(makeBreed({
        attributes: {
          ...makeBreed().attributes,
          male_weight: undefined,
          female_weight: undefined,
          male_height: undefined,
          female_height: undefined,
        },
      })),
    ).toBeNull();
  });
});

describe("filterBreeds", () => {
  const golden = makeBreed();

  const beagle = makeBreed({
    id: "breed-2",
    attributes: {
      ...makeBreed().attributes,
      name: "Beagle",
      other_names: ["English Beagle"],
      male_weight: { min: 9, max: 11 },
      female_weight: { min: 8, max: 10 },
      coat: { type: "double", length: "short" },
      hypoallergenic: false,
      traits: {
        energy: 4,
        trainability: 3,
        good_with_children: 4,
        good_with_dogs: 4,
        good_with_strangers: 3,
      },
    },
  });

  const breeds = [golden, beagle];

  it("returns all breeds when no filters are applied", () => {
    expect(
      filterBreeds({
        breeds,
        searchQuery: "",
        selectedGroupIds: [],
        filters: emptyFilters,
      }),
    ).toHaveLength(2);
  });

  it("searches by breed name without case sensitivity", () => {
    expect(
      filterBreeds({
        breeds,
        searchQuery: "GOLDEN",
        selectedGroupIds: [],
        filters: emptyFilters,
      }).map((breed) => breed.id),
    ).toEqual(["breed-1"]);
  });

  it("searches by alternative names", () => {
    expect(
      filterBreeds({
        breeds,
        searchQuery: "English Beagle",
        selectedGroupIds: [],
        filters: emptyFilters,
      }).map((breed) => breed.id),
    ).toEqual(["breed-2"]);
  });

  it("filters by coat length", () => {
    expect(
      filterBreeds({
        breeds,
        searchQuery: "",
        selectedGroupIds: [],
        filters: { ...emptyFilters, coat: "short" },
      }).map((breed) => breed.id),
    ).toEqual(["breed-2"]);
  });

  it("filters by hypoallergenic status", () => {
    expect(
      filterBreeds({
        breeds,
        searchQuery: "",
        selectedGroupIds: [],
        filters: { ...emptyFilters, hypoallergenic: false },
      }),
    ).toHaveLength(2);
  });

  it("requires every selected trait threshold to pass", () => {
    expect(
      filterBreeds({
        breeds,
        searchQuery: "",
        selectedGroupIds: [],
        filters: {
          ...emptyFilters,
          traits: { energy: 4, trainability: 4 },
        },
      }).map((breed) => breed.id),
    ).toEqual(["breed-1"]);
  });

  it("excludes breeds with missing trait scores when a threshold is selected", () => {
    const breedWithoutEnergy = makeBreed({
      id: "breed-3",
      attributes: {
        ...makeBreed().attributes,
        traits: {
          trainability: 5,
        },
      },
    });

    expect(
      filterBreeds({
        breeds: [breedWithoutEnergy],
        searchQuery: "",
        selectedGroupIds: [],
        filters: {
          ...emptyFilters,
          traits: { energy: 3 },
        },
      }),
    ).toHaveLength(0);
  });

  it("filters by group ID", () => {
    const groupedBreed = makeBreed({
      relationships: {
        group: { data: { id: "sporting", type: "group" } },
      },
    });

    expect(
      filterBreeds({
        breeds: [groupedBreed, beagle],
        searchQuery: "",
        selectedGroupIds: ["sporting"],
        filters: emptyFilters,
      }).map((breed) => breed.id),
    ).toEqual(["breed-1"]);
  });
});
