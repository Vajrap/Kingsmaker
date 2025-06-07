export type TileType = 
  | 'castle'     // Starting positions (4 max)
  | 'fortress'   // Victory targets, defensive bonus
  | 'city'       // Economy, 3 building slots, 10 captains
  | 'village'    // Small economy, 1 building slot, 3 captains  
  | 'forest'     // Wood resource
  | 'mine'       // Iron resource
  | 'field'      // Food resource
  | 'ruins'      // Exploration, relics
  | 'plain'      // Empty land, no special effects
  | 'road';      // Provides movement bonus

export interface GameTile {
  id: string;
  type: TileType;
  x: number;
  y: number;
  ownerId?: string;    // Player who controls this tile
  unrest: number;      // Unrest level (0-5)
  buildings: string[]; // Built structures
  captains: string[];  // Captain cards (face-down)
  resources?: number;  // Available resources for harvest
}

export interface GameMap {
  id: string;
  seed: string;        // For reproducible generation
  width: number;
  height: number;
  tiles: GameTile[];
  playerStartPositions: { [playerId: string]: { x: number; y: number } };
}

export type MapSize = 'small' | 'medium' | 'large';

export interface MapGenerationConfig {
  size: MapSize;
  playerCount: number;
  seed?: string;
}

// Map size configurations
export const MAP_CONFIGS = {
  small: { width: 6, height: 4, totalTiles: 24 },
  medium: { width: 8, height: 6, totalTiles: 48 },
  large: { width: 10, height: 8, totalTiles: 80 }
} as const;

// Tile distribution ratios (per 24 tiles for small map)
export const TILE_DISTRIBUTION = {
  castle: 4,    // Always matches player count (2-4)
  fortress: 3,  // Victory targets  
  city: 2,      // Major economy
  village: 3,   // Minor economy
  forest: 2,    // Wood resource
  mine: 1,      // Iron resource  
  field: 2,     // Food resource
  ruins: 1,     // Exploration
  road: 3,      // Movement bonus
  plain: 3      // Fill remaining space
} as const; 