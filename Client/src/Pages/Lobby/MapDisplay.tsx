import React from 'react';
import type { GameMap, GameTile, TileType } from '@shared/types/map';
import { TILE_COLORS } from '@/utils/mapGenerator';

interface MapDisplayProps {
  map: GameMap;
  onTileClick?: (tile: GameTile) => void;
  selectedTile?: GameTile | null;
}

export const MapDisplay: React.FC<MapDisplayProps> = ({ 
  map, 
  onTileClick, 
  selectedTile 
}) => {
  const tileSize = 40;
  const gap = 2;

  const getTileIcon = (type: TileType): string => {
    switch (type) {
      case 'castle': return '🏰';
      case 'fortress': return '🛡️';
      case 'city': return '🏙️';
      case 'village': return '🏘️';
      case 'forest': return '🌲';
      case 'mine': return '⛏️';
      case 'field': return '🌾';
      case 'ruins': return '🗿';
      default: return '❓';
    }
  };

  const getTileName = (type: TileType): string => {
    switch (type) {
      case 'castle': return 'Castle';
      case 'fortress': return 'Fortress';
      case 'city': return 'City';
      case 'village': return 'Village';
      case 'forest': return 'Forest';
      case 'mine': return 'Mine';
      case 'field': return 'Field';
      case 'ruins': return 'Ruins';
      default: return 'Unknown';
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: '16px'
    }}>
      {/* Map Info */}
      <div style={{
        backgroundColor: '#f7fafc',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '14px',
        color: '#4a5568'
      }}>
        Map: {map.width}×{map.height} • Seed: {map.seed.substring(0, 8)}... • {map.tiles.length} tiles
      </div>

      {/* Game Map Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${map.width}, ${tileSize}px)`,
        gridTemplateRows: `repeat(${map.height}, ${tileSize}px)`,
        gap: `${gap}px`,
        padding: '16px',
        backgroundColor: '#2d3748',
        borderRadius: '8px',
        border: '2px solid #4a5568'
      }}>
        {map.tiles.map((tile) => (
          <div
            key={tile.id}
            onClick={() => onTileClick?.(tile)}
            style={{
              width: `${tileSize}px`,
              height: `${tileSize}px`,
              backgroundColor: TILE_COLORS[tile.type],
              border: selectedTile?.id === tile.id ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: onTileClick ? 'pointer' : 'default',
              fontSize: '12px',
              position: 'relative',
              transition: 'all 0.2s ease'
            }}
            title={`${getTileName(tile.type)} (${tile.x}, ${tile.y})`}
          >
            {/* Tile icon */}
            <span style={{ 
              fontSize: '16px',
              filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))'
            }}>
              {getTileIcon(tile.type)}
            </span>

            {/* Owner indicator */}
            {tile.ownerId && (
              <div style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                backgroundColor: '#3182ce',
                borderRadius: '50%',
                border: '1px solid white'
              }} />
            )}

            {/* Resource indicator */}
            {tile.resources && (
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                left: '-2px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                fontSize: '8px',
                padding: '1px 3px',
                borderRadius: '2px',
                fontWeight: 'bold'
              }}>
                {tile.resources}
              </div>
            )}

            {/* Unrest indicator */}
            {tile.unrest > 0 && (
              <div style={{
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                backgroundColor: '#e53e3e',
                color: 'white',
                fontSize: '8px',
                padding: '1px 3px',
                borderRadius: '2px',
                fontWeight: 'bold'
              }}>
                !{tile.unrest}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tile Legend */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        padding: '12px',
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '12px'
      }}>
        {Object.entries(TILE_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: color,
              borderRadius: '2px',
              border: '1px solid rgba(0,0,0,0.2)'
            }} />
            <span style={{ color: '#4a5568' }}>
              {getTileIcon(type as TileType)} {getTileName(type as TileType)}
            </span>
          </div>
        ))}
      </div>

      {/* Selected Tile Info */}
      {selectedTile && (
        <div style={{
          backgroundColor: '#edf2f7',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #cbd5e0',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          <strong>{getTileName(selectedTile.type)}</strong> at ({selectedTile.x}, {selectedTile.y})
          {selectedTile.resources && <div>Resources: {selectedTile.resources}</div>}
          {selectedTile.captains.length > 0 && <div>Captains: {selectedTile.captains.length}</div>}
          {selectedTile.unrest > 0 && <div style={{ color: '#e53e3e' }}>Unrest: {selectedTile.unrest}</div>}
        </div>
      )}
    </div>
  );
}; 