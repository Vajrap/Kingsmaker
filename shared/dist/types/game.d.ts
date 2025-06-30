export type TileType = "castle" | "fortress" | "city" | "village" | "forest" | "mine" | "field" | "ruins" | "plain" | "road";
export interface GameTile {
    id: string;
    x: number;
    y: number;
    type: TileType;
    ownerId?: string;
    resources?: number;
    captains: string[];
    unrest: number;
    buildings?: string[];
}
export interface GameMap {
    id: string;
    width: number;
    height: number;
    seed: string;
    tiles: GameTile[];
    playerStartPositions: {
        [playerId: string]: {
            x: number;
            y: number;
        };
    };
}
export type MapSize = "small" | "medium" | "large";
export interface MapGenerationConfig {
    size: MapSize;
    playerCount: number;
    seed?: string;
}
export declare const MAP_CONFIGS: {
    small: {
        width: number;
        height: number;
        totalTiles: number;
    };
    medium: {
        width: number;
        height: number;
        totalTiles: number;
    };
    large: {
        width: number;
        height: number;
        totalTiles: number;
    };
};
export declare const TILE_DISTRIBUTION: Record<TileType, number>;
//# sourceMappingURL=game.d.ts.map