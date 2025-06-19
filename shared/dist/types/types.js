export function errorRes(message) {
    return {
        success: false,
        message
    };
}
export function ok(data, message) {
    return {
        success: true,
        data,
        message
    };
}
// Map configuration constants
export const MAP_CONFIGS = {
    small: { width: 4, height: 6, totalTiles: 24 },
    medium: { width: 6, height: 8, totalTiles: 48 },
    large: { width: 8, height: 10, totalTiles: 80 }
};
export const TILE_DISTRIBUTION = {
    castle: 4, // Player starting positions
    fortress: 2, // Defensive structures
    city: 3, // Major settlements
    village: 6, // Minor settlements
    forest: 4, // Wood resource
    mine: 3, // Iron resource
    field: 4, // Food resource
    ruins: 2, // Exploration sites
    plain: 0, // Will be filled automatically
    road: 0 // Will be generated based on connections
};
