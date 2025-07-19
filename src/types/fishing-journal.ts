export interface FishingTrip {
  id: string;
  userId: string;
  date: Date;
  location: {
    coordinates: {
      lat: number;
      lng: number;
    };
    name: string;
    address: string;
  };
  duration: number; // in minutes
  weather: {
    temperature: number;
    windSpeed: number;
    conditions: string;
    barometricPressure?: number;
  };
  catches: Catch[];
  techniques: FishingTechnique[];
  baitUsed: string[];
  equipment: string[];
  notes: string;
  photos: string[];
  waterConditions: {
    temperature?: number;
    clarity: 'clear' | 'murky' | 'muddy';
    currentStrength: 'calm' | 'moderate' | 'strong';
    tideStatus: 'high' | 'low' | 'rising' | 'falling';
  };
  successScore: number; // 1-10 rating
  createdAt: Date;
  updatedAt: Date;
}

export interface Catch {
  id: string;
  species: string;
  size: number; // in cm
  weight?: number; // in grams
  quantity: number;
  time: Date;
  method: string;
  bait: string;
  location: string; // description of specific spot
  kept: boolean; // true if kept, false if released
  photos: string[];
  notes?: string;
}

export interface FishingTechnique {
  name: string;
  description: string;
  effectiveness: number; // 1-5 rating
  conditions: string[]; // when it works best
}

export interface FishingAnalytics {
  totalTrips: number;
  totalCatches: number;
  totalSpecies: number;
  averageSuccessScore: number;
  favoriteLocations: LocationStats[];
  bestTechniques: TechniqueStats[];
  seasonalPatterns: SeasonalData[];
  monthlyStats: MonthlyStats[];
  speciesStats: SpeciesStats[];
  improvements: string[];
}

export interface LocationStats {
  name: string;
  coordinates: { lat: number; lng: number };
  visitCount: number;
  totalCatches: number;
  averageSuccess: number;
  bestSeason: string;
}

export interface TechniqueStats {
  name: string;
  timesUsed: number;
  successRate: number;
  averageCatchSize: number;
  bestConditions: string[];
}

export interface SeasonalData {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  tripCount: number;
  catchCount: number;
  averageSuccess: number;
  bestSpecies: string[];
}

export interface MonthlyStats {
  month: string;
  year: number;
  trips: number;
  catches: number;
  successScore: number;
  topSpecies: string[];
}

export interface SpeciesStats {
  species: string;
  count: number;
  averageSize: number;
  averageWeight?: number;
  bestBait: string;
  bestTechnique: string;
  bestLocations: string[];
  seasonality: string[];
}
