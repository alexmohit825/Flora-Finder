export type OrganType = "flower" | "leaf" | "fruit" | "bark" | "habit" | "auto";

export interface CapturedPhoto {
  id: string;          // e.g. `photo-${Date.now()}`
  previewUrl: string;  // object URL for rendering in <img>
  blob: Blob;          // compressed JPEG blob used for upload only
  organ: OrganType;    // 'leaf' | 'flower' | 'whole' | etc.
}

export interface PlantMatch {
  plantId: string;
  commonName: string;
  scientificName: string;
  family: string;
  genus: string;
  confidence: number;
  rank: number;
}

export interface DiseaseDiagnosis {
  isDiseased: boolean;
  healthScore: number;
  diseaseName: string;
  scientificName: string;
  confidence: number;
  severity: "Healthy" | "Low" | "Medium" | "High";
  symptoms: string[];
  causes: string[];
  treatment: {
    immediate: string;
    organic: string;
    chemical: string;
  };
  prevention: string[];
}

export interface PlantObservation {
  queryId: string;
  photos: CapturedPhoto[];
  matches: PlantMatch[];
  diseaseDiagnosis?: DiseaseDiagnosis;
  needsMorePhotos: boolean;
  recommendedNextShots: string[];
  captureHints: string[];
  timestamp: number;
  provider: {
    name: string;
    modelVersion: string;
  };
}

export interface CareProfile {
  sun: string;
  water: string;
  soil: string;
}

export interface ToxicityProfile {
  human: string;
  pets: string;
}

export interface PlantProfile {
  plantId: string;
  commonName: string;
  scientificName: string;
  description: string;
  category: string;
  care: CareProfile;
  toxicity: ToxicityProfile;
}

