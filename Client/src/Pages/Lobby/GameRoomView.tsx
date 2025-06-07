import React, { useEffect, useState } from 'react';
import type { GameRoom } from '@shared/types';
import type { GameMap, GameTile, MapSize } from '@shared/types/map';
import { sessionManager } from '@/singleton/sessionManager';
import { lobbySocket, type LobbyEventHandler } from '@/Request-Respond/ws/lobbySocket';
import { CharacterCustomization } from './CharacterCustomization';
import { MapDisplay } from './MapDisplay';
import { generateMap, generateRandomSeed } from '@/utils/mapGenerator';

interface GameRoomViewProps {
  room: GameRoom;
  onLeaveRoom: () => void;
  onRoomUpdate: (room: GameRoom) => void;
}

export const GameRoomView: React.FC<GameRoomViewProps> = ({
  room,
  onLeaveRoom,
  onRoomUpdate
}) => {
  const [currentRoom, setCurrentRoom] = useState<GameRoom>(room);
  const [gameStarting, setGameStarting] = useState(false);
  const [turnOrder, setTurnOrder] = useState<string[]>([]);
  const [showCustomization, setShowCustomization] = useState(false);
  const [currentMap, setCurrentMap] = useState<GameMap | null>(null);
  const [selectedTile, setSelectedTile] = useState<GameTile | null>(null);
  const [mapSize, setMapSize] = useState<MapSize>('medium');
  
  const session = sessionManager.getSession();
  const currentPlayer = currentRoom.players.find(p => p.userId === session?.userID);
  const isHost = currentRoom.hostId === session?.userID;

  // Generate initial map using server-provided seed
  useEffect(() => {
    if (!currentMap && currentRoom.mapSeed) {
      const newMap = generateMap({
        size: mapSize,
        playerCount: currentRoom.players.length,
        seed: currentRoom.mapSeed // Use server-provided seed for consistency
      });
      setCurrentMap(newMap);
    }
  }, [currentMap, mapSize, currentRoom.players.length, currentRoom.mapSeed]);

  useEffect(() => {
    const handlers: LobbyEventHandler = {
      onRoomUpdated: (updatedRoom) => {
        setCurrentRoom(updatedRoom);
        onRoomUpdate(updatedRoom);
      },

      onPlayerJoined: (roomId, player) => {
        if (roomId === currentRoom.id) {
          console.log(`Player ${player.username} joined the room`);
        }
      },

      onPlayerLeft: (roomId, userId) => {
        if (roomId === currentRoom.id) {
          const leftPlayer = currentRoom.players.find(p => p.userId === userId);
          if (leftPlayer) {
            console.log(`Player ${leftPlayer.username} left the room`);
          }
        }
      },

      onGameStarting: (roomId, playerOrder) => {
        if (roomId === currentRoom.id) {
          setGameStarting(true);
          setTurnOrder(playerOrder);
          console.log("Game Starting! Rolling for turn order...");
        }
      },

      onGameStarted: (roomId, gameId) => {
        if (roomId === currentRoom.id) {
          console.log(`Game Started! Game ID: ${gameId}`);
          // TODO: Navigate to game view
          console.log('Game started with ID:', gameId);
        }
      },

      onError: (message) => {
        console.error("Error:", message);
      }
    };

    // Update handlers (this will replace existing handlers)
    lobbySocket.connect(handlers);

    return () => {
      // Don't disconnect here as other components might need the connection
    };
  }, [currentRoom.id, currentRoom.players, onRoomUpdate]);

  const handleToggleReady = () => {
    lobbySocket.toggleReady(currentRoom.id);
  };

  const handleStartGame = () => {
    if (isHost && canStartGame()) {
      lobbySocket.startGame(currentRoom.id);
    }
  };

  const canStartGame = (): boolean => {
    return (
      currentRoom.players.length >= 2 &&
      currentRoom.players.every(p => p.isReady) &&
      currentRoom.state === "WAITING"
    );
  };

  const handleGenerateMap = () => {
    const newMap = generateMap({
      size: mapSize,
      playerCount: currentRoom.players.length,
      seed: generateRandomSeed()
    });
    setCurrentMap(newMap);
    setSelectedTile(null);
  };

  const handleMapSizeChange = (newSize: MapSize) => {
    setMapSize(newSize);
    const newMap = generateMap({
      size: newSize,
      playerCount: currentRoom.players.length,
      seed: generateRandomSeed()
    });
    setCurrentMap(newMap);
    setSelectedTile(null);
  };

  // Fill empty slots
  const emptySlots = Array.from(
    { length: currentRoom.settings.maxPlayers - currentRoom.players.length },
    (_, index) => (
      <div 
        key={`empty-${index}`} 
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px'
        }}
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#e2e8f0'
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ color: '#a0aec0' }}>Waiting for player...</div>
          </div>
        </div>
      </div>
    )
  );

  if (gameStarting) {
    return (
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Game Starting!</h1>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #3182ce, #63b3ed)',
              animation: 'progress 2s ease-in-out infinite'
            }} />
          </div>
          <div>Rolling for turn order and initializing game...</div>
          
          {turnOrder.length > 0 && (
            <div style={{
              width: '100%',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>Turn Order</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {turnOrder.map((userId, index) => {
                  const player = currentRoom.players.find(p => p.userId === userId);
                  return (
                    <div key={userId} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>{index + 1}. {player?.username}</div>
                      <span style={{
                        backgroundColor: '#3182ce',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        Position {index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Room Header */}
        <div style={{
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>{currentRoom.name}</h1>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ color: '#718096' }}>Room ID: {currentRoom.id}</div>
                <span style={{
                  backgroundColor: '#38a169',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {currentRoom.state}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setShowCustomization(true)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Customize Character
              </button>
              <button 
                onClick={handleToggleReady}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: currentPlayer?.isReady ? '#ed8936' : '#38a169',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {currentPlayer?.isReady ? "Not Ready" : "Ready"}
              </button>
              <button 
                onClick={onLeaveRoom}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>

        {/* Main Game Room Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: '24px', alignItems: 'start' }}>
          
          {/* Left: Players List */}
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white'
          }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '16px' }}>
              Players ({currentRoom.players.length}/{currentRoom.settings.maxPlayers})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentRoom.players.map((player, index) => (
                <div key={player.userId || index} style={{
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  backgroundColor: player.userId === session?.userID ? '#f0f8ff' : '#f9fafb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {player.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{player.username}</div>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                        {player.userId === currentRoom.hostId && (
                          <span style={{
                            backgroundColor: '#805ad5',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '10px'
                          }}>Host</span>
                        )}
                        <span style={{
                          backgroundColor: player.isReady ? '#38a169' : '#ed8936',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '10px'
                        }}>
                          {player.isReady ? "Ready" : "Not Ready"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {emptySlots.map((_, index) => (
                <div key={`empty-${index}`} style={{
                  padding: '12px',
                  border: '1px dashed #cbd5e0',
                  borderRadius: '6px',
                  color: '#a0aec0',
                  textAlign: 'center',
                  fontSize: '14px'
                }}>
                  Waiting for player...
                </div>
              ))}
            </div>
          </div>

          {/* Center: Map Display */}
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>Game Map</h2>
            
            {currentMap && (
              <MapDisplay
                map={currentMap}
                onTileClick={setSelectedTile}
                selectedTile={selectedTile}
              />
            )}

            {/* Map Controls */}
            {isHost && (
              <div style={{
                marginTop: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ fontSize: '14px', color: '#4a5568' }}>Map Size:</label>
                  <select
                    value={mapSize}
                    onChange={(e) => handleMapSizeChange(e.target.value as MapSize)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="small">Small (6×4)</option>
                    <option value="medium">Medium (8×6)</option>
                    <option value="large">Large (10×8)</option>
                  </select>
                </div>
                
                <button
                  onClick={handleGenerateMap}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #3182ce',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#3182ce',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  🎲 Generate New Map
                </button>
              </div>
            )}
          </div>

          {/* Right: Self Info & Room Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Self Info */}
            {currentPlayer && (
              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: 'white'
              }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '16px' }}>Your Info</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Name:</span>
                    <span style={{ fontWeight: 'bold' }}>{currentPlayer.username}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Status:</span>
                    <span style={{
                      backgroundColor: currentPlayer.isReady ? '#38a169' : '#ed8936',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {currentPlayer.isReady ? "Ready" : "Not Ready"}
                    </span>
                  </div>
                  {currentPlayer.character.name && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Character:</span>
                      <span style={{ fontWeight: 'bold' }}>{currentPlayer.character.name}</span>
                    </div>
                  )}
                </div>
                
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    onClick={() => setShowCustomization(true)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Customize Character
                  </button>
                  <button 
                    onClick={handleToggleReady}
                    style={{
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: currentPlayer.isReady ? '#ed8936' : '#38a169',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {currentPlayer.isReady ? "Not Ready" : "Ready"}
                  </button>
                </div>
              </div>
            )}

            {/* Room Settings */}
            <div style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: 'white'
            }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '16px' }}>Room Settings</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>Max Players:</div>
                  <div style={{ fontWeight: 'bold' }}>{currentRoom.settings.maxPlayers}</div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>Spectators:</div>
                  <span style={{
                    backgroundColor: currentRoom.settings.spectatorMode ? '#38a169' : '#e53e3e',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {currentRoom.settings.spectatorMode ? "Allowed" : "Disabled"}
                  </span>
                </div>

                {currentRoom.settings.turnTimeLimit && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>Turn Limit:</div>
                    <div style={{ fontWeight: 'bold' }}>
                      {Math.floor(currentRoom.settings.turnTimeLimit / 60)}:
                      {(currentRoom.settings.turnTimeLimit % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Host Controls */}
            {isHost && (
              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: 'white'
              }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '16px' }}>Host Controls</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {!canStartGame() && (
                    <div style={{
                      backgroundColor: '#bee3f8',
                      color: '#2a69ac',
                      padding: '12px',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      Need at least 2 players and all players ready to start
                    </div>
                  )}
                  
                  <button
                    onClick={handleStartGame}
                    disabled={!canStartGame()}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: canStartGame() ? '#38a169' : '#a0aec0',
                      color: 'white',
                      cursor: canStartGame() ? 'pointer' : 'not-allowed',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    Start Game
                  </button>
                  
                  <button 
                    onClick={onLeaveRoom}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Leave Room
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Character Customization Modal */}
        {showCustomization && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Customize Character</h2>
                <button 
                  onClick={() => setShowCustomization(false)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '24px', 
                    cursor: 'pointer' 
                  }}
                >
                  ×
                </button>
              </div>
              <CharacterCustomization
                currentCharacter={currentPlayer?.character}
                onUpdate={(character) => {
                  lobbySocket.updateCharacter(character);
                  setShowCustomization(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 