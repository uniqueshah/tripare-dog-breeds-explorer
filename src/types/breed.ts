
export interface NumericRange {
  min: number;
  max: number;
}

export interface BreedImageAttribution {
  author: string;
  license: string;
  license_url: string;
  source: string;
  source_url: string;
}

export interface BreedImage {
  id: string;
  url: string;
  thumb: string;
  medium: string;
  large: string;
  attribution: BreedImageAttribution;
}

export interface BreedOrigin {
  country?: string;
  region?: string;
  era?: string;
}

export interface BreedCoat {
  type?: string;
  length?: string;
  colors?: string[];
}

export interface BreedTraits {
  energy?: number;
  barking?: number;
  drooling?: number;
  grooming?: number;
  shedding?: number;
  trainability?: number;
  good_with_dogs?: number;
  exercise_minutes?: number;
  apartment_friendly?: number;
  good_with_children?: number;
  good_with_strangers?: number;
  temperament?: string[];
}

export interface BreedAttributes {
  name: string;
  description?: string;
  hypoallergenic?: boolean;
  life?: NumericRange;
  male_weight?: NumericRange;
  female_weight?: NumericRange;
  male_height?: NumericRange;
  female_height?: NumericRange;
  origin?: BreedOrigin;
  coat?: BreedCoat;
  traits?: BreedTraits;
  other_names?: string[];
  recognized_by?: string[];
  sources?: Array<{
    url: string;
    title: string;
  }>;
  images?: BreedImage[];
}

export interface Breed {
  id: string;
  type: "breed";
  attributes: BreedAttributes;
  relationships?: {
    group?: {
      data?: {
        id: string;
        type: "group";
      } | null;
    };
  };
}

export interface PaginationMeta {
  current?: number;
  next?: number;
  last?: number;
  records?: number;
}

export interface BreedsPageResponse {
  data: Breed[];
  meta?: {
    pagination?: PaginationMeta;
  };
  links?: {
    self?: string;
    current?: string;
    next?: string;
    last?: string;
  };
}


export interface BreedGroup {
  id: string;
  type: "group";
  attributes: {
    name: string;
  };
  relationships?: {
    breeds?: {
      data: Array<{
        id: string;
        type: "breed";
      }>;
    };
  };
}

export interface GroupsPageResponse {
  data: BreedGroup[];
  meta?: {
    pagination?: PaginationMeta;
  };
}

