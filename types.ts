
export interface WildlifeEntry {
  id: string;
  itemName: string; // Species Name
  scientificName?: string;
  category: string; // e.g., Bird, Mammal, Reptile, Insect, Plant
  rarity: string; // e.g., Common, Uncommon, Rare
  points: number;
  timestamp: number;
  imageUrl?: string;
  description: string;
  conservationStatus: string; 
  location?: {
    lat: number;
    lng: number;
  };
  imageSignature?: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  quantity?: number;
  userNotes?: string;
  isInternetImage?: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  totalPoints: number;
  sightingsLogged: number;
  rank: number;
  badges: string[];
  internetWarningCount: number;
  isBanned: boolean;
  level: number;
}

export interface AnalysisResult {
  itemName: string;
  scientificName: string;
  category: string;
  rarity: string;
  description: string;
  conservationStatus: string;
  estimatedPoints: number;
  funFact?: string;
  isInternetImage: boolean;
}

export enum ViewState {
  SCANNER = 'SCANNER',
  LEADERBOARD = 'LEADERBOARD',
  PROFILE = 'PROFILE',
  MAP = 'MAP',
  WAYPOINT_INFO = 'WAYPOINT_INFO',
  ANIMALS_LIST = 'ANIMALS_LIST',
}
