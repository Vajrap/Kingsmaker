import type { GameMap, GameTile, TileType, MapGenerationConfig } from '@shared/types/map';
import { MAP_CONFIGS, TILE_DISTRIBUTION } from '@shared/types/map';

// Seeded random number generator for reproducible maps
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashCode(seed);
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

// Tile type colors for visual representation
export const TILE_COLORS: Record<TileType, string> = {
  castle: '#8B5CF6',    // Purple - Player starting positions
  fortress: '#374151',  // Dark gray - Defensive structures
  city: '#F59E0B',      // Gold - Major settlements
  village: '#10B981',   // Green - Minor settlements
  forest: '#059669',    // Dark green - Wood resource
  mine: '#6B7280',      // Gray - Iron resource
  field: '#FCD34D',     // Yellow - Food resource
  ruins: '#7C2D12',     // Brown - Exploration sites
  plain: '#F5DEB3',     // Beige - Empty land
  road: '#708090'       // Slate gray - Movement paths
};

export function generateRandomSeed(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function generateMap(config: MapGenerationConfig): GameMap {
  const seed = config.seed || generateRandomSeed();
  const rng = new SeededRandom(seed);
  const mapConfig = MAP_CONFIGS[config.size];
  
  // Scale tile distribution based on map size
  const scale = mapConfig.totalTiles / 24; // 24 is base (small) size
  const scaledDistribution = Object.entries(TILE_DISTRIBUTION).reduce((acc, [type, count]) => {
    if (type === 'castle') {
      acc[type as TileType] = Math.min(count, config.playerCount); // Only as many castles as players
    } else {
      acc[type as TileType] = Math.round(count * scale);
    }
    return acc;
  }, {} as Record<TileType, number>);

  // Create tile pool
  const tilePool: TileType[] = [];
  Object.entries(scaledDistribution).forEach(([type, count]) => {
    for (let i = 0; i < count; i++) {
      tilePool.push(type as TileType);
    }
  });

  // Fill remaining slots with plain tiles (most of map should be empty land)
  while (tilePool.length < mapConfig.totalTiles) {
    tilePool.push('plain');
  }

  // Shuffle tile pool
  for (let i = tilePool.length - 1; i > 0; i--) {
    const j = rng.nextInt(i + 1);
    [tilePool[i], tilePool[j]] = [tilePool[j], tilePool[i]];
  }

  // Generate tiles in grid
  const tiles: GameTile[] = [];
  let tileIndex = 0;

  for (let y = 0; y < mapConfig.height; y++) {
    for (let x = 0; x < mapConfig.width; x++) {
      const tileType = tilePool[tileIndex];
      
      tiles.push({
        id: `tile_${x}_${y}`,
        type: tileType,
        x,
        y,
        unrest: 0,
        buildings: [],
        captains: generateCaptainPool(tileType),
        resources: generateResourceAmount(tileType, rng)
      });
      
      tileIndex++;
    }
  }

  // Assign player starting positions (place castles strategically)
  const playerStartPositions = assignStartingPositions(tiles, config.playerCount, mapConfig);

  return {
    id: `map_${seed}`,
    seed,
    width: mapConfig.width,
    height: mapConfig.height,
    tiles,
    playerStartPositions
  };
}

function generateCaptainPool(tileType: TileType): string[] {
  switch (tileType) {
    case 'city':
      return Array(10).fill('captain_card'); // 10 face-down captain cards
    case 'village':
      return Array(3).fill('captain_card');  // 3 face-down captain cards
    default:
      return []; // No captains in other locations
  }
}

function generateResourceAmount(tileType: TileType, rng: SeededRandom): number | undefined {
  switch (tileType) {
    case 'forest':
    case 'mine':
    case 'field':
      return 3 + rng.nextInt(3); // 3-5 resources
    default:
      return undefined; // No harvestable resources
  }
}

function assignStartingPositions(
  tiles: GameTile[], 
  playerCount: number, 
  mapConfig: { width: number; height: number }
): { [playerId: string]: { x: number; y: number } } {
  
  // Find all castle tiles
  const castleTiles = tiles.filter(tile => tile.type === 'castle');
  
  // Try to spread castles evenly across the map
  const positions: { x: number; y: number }[] = [];
  
  if (playerCount === 2) {
    // Place on opposite sides
    positions.push(
      { x: 0, y: Math.floor(mapConfig.height / 2) },
      { x: mapConfig.width - 1, y: Math.floor(mapConfig.height / 2) }
    );
  } else if (playerCount === 3) {
    // Triangle formation
    positions.push(
      { x: 0, y: 0 },
      { x: mapConfig.width - 1, y: 0 },
      { x: Math.floor(mapConfig.width / 2), y: mapConfig.height - 1 }
    );
  } else if (playerCount === 4) {
    // Four corners
    positions.push(
      { x: 0, y: 0 },
      { x: mapConfig.width - 1, y: 0 },
      { x: 0, y: mapConfig.height - 1 },
      { x: mapConfig.width - 1, y: mapConfig.height - 1 }
    );
  }

  // Assign positions to castle tiles and create player mapping
  const playerStartPositions: { [playerId: string]: { x: number; y: number } } = {};
  
  for (let i = 0; i < Math.min(playerCount, positions.length, castleTiles.length); i++) {
    const position = positions[i];
    const castleTile = castleTiles[i];
    
    // Update castle tile position
    castleTile.x = position.x;
    castleTile.y = position.y;
    
    // Map player position (we'll update with actual player IDs later)
    playerStartPositions[`player_${i + 1}`] = position;
  }

  return playerStartPositions;
}

export function getTileAt(map: GameMap, x: number, y: number): GameTile | null {
  return map.tiles.find(tile => tile.x === x && tile.y === y) || null;
}

export function getAdjacentTiles(map: GameMap, x: number, y: number): GameTile[] {
  const adjacent: GameTile[] = [];
  const directions = [
    { dx: 0, dy: -1 }, // North
    { dx: 1, dy: 0 },  // East  
    { dx: 0, dy: 1 },  // South
    { dx: -1, dy: 0 }  // West
  ];

  directions.forEach(({ dx, dy }) => {
    const newX = x + dx;
    const newY = y + dy;
    
    if (newX >= 0 && newX < map.width && newY >= 0 && newY < map.height) {
      const tile = getTileAt(map, newX, newY);
      if (tile) adjacent.push(tile);
    }
  });

  return adjacent;
} 