import React, { useEffect, useState } from 'react';
import type { GameRoom, RoomSettings } from '@shared/types';
import { lobbySocket, type LobbyEventHandler } from '@/Request-Respond/ws/lobbySocket';
import { sessionManager } from '@/singleton/sessionManager';
import { CreateRoomModal } from './CreateRoomModal';
import { GameRoomView } from './GameRoomView';
import { RetryModal } from './RetryModal';
import { ProfileModal } from './ProfileModal';
import { SettingsModal } from './SettingsModal';

export const LobbyMain: React.FC = () => {
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const session = sessionManager.getSession();

  // Session check in separate useEffect to avoid connection loops
  useEffect(() => {
    if (!session) {
      console.log("No session found, redirecting to login");
      window.location.href = '/';
    }
  }, [session]);

  useEffect(() => {
    // Only proceed if we have a session
    if (!session) return;

    console.log("Setting up lobby connection (should only happen once)");

    const handlers: LobbyEventHandler = {
      onConnected: () => {
        console.log("Connected to lobby");
        setIsConnected(true);
        setIsLoading(false);
        setShowRetryModal(false);
        // Request room list after connection
        lobbySocket.getRoomList();
      },
      
      onDisconnected: () => {
        setIsConnected(false);
        setIsLoading(false);
        setShowRetryModal(true);
        console.log("Connection lost, showing retry modal");
      },

      onRoomList: (roomList) => {
        setRooms(roomList);
      },

      onRoomCreated: (room) => {
        setCurrentRoom(room);
        console.log(`Room "${room.name}" created successfully`);
      },

      onRoomJoined: (room) => {
        setCurrentRoom(room);
      },

      onRoomLeft: () => {
        setCurrentRoom(null);
        // Refresh room list
        lobbySocket.getRoomList();
      },

      onError: (message) => {
        console.error("Lobby error:", message);
      }
    };

    lobbySocket.connect(handlers).catch((error) => {
      console.error('Failed to connect to lobby:', error);
      setIsLoading(false);
      setShowRetryModal(true);
    });

    return () => {
      console.log("LobbyMain unmounting - disconnecting WebSocket");
      lobbySocket.disconnect();
    };
  }, []); // ← Removed session dependency to prevent reconnection loops

  const handleJoinRoom = (roomId: string) => {
    lobbySocket.joinRoom(roomId);
  };

  const handleRefreshRooms = () => {
    lobbySocket.getRoomList();
  };

  const handleLeaveRoom = () => {
    if (currentRoom) {
      lobbySocket.leaveRoom(currentRoom.id);
    }
  };

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    try {
      await lobbySocket.retryConnection();
      setShowRetryModal(false);
      setIsConnected(true);
      // Request room list after successful reconnection
      lobbySocket.getRoomList();
    } catch (error) {
      console.error('Failed to reconnect:', error);
      // Keep the modal open if retry fails
    } finally {
      setIsRetrying(false);
    }
  };

  const handleGoToLogin = () => {
    window.location.href = '/';
  };

  const handleLogout = () => {
    // Disconnect from lobby socket first
    lobbySocket.disconnect();
    // Clear session
    sessionManager.clearSession();
    // Redirect to login
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3182ce',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div>Connecting to lobby...</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If in a room, show room view
  if (currentRoom) {
    return (
      <GameRoomView 
        room={currentRoom} 
        onLeaveRoom={handleLeaveRoom}
        onRoomUpdate={setCurrentRoom}
      />
    );
  }

  // Show room browser only if connected
  if (!isConnected) {
    return (
      <>
        <RetryModal
          isOpen={showRetryModal}
          onRetry={handleRetryConnection}
          onGoToLogin={handleGoToLogin}
          isRetrying={isRetrying}
        />
      </>
    );
  }

  // Show room browser
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header with Profile and Settings */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f7fafc',
          padding: '16px 24px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>Game Lobby</h1>
            <div style={{ color: '#718096' }}>
              Welcome, {session?.username}! Create or join a room to start playing.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowProfileModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#4a5568'
              }}
            >
              <span style={{ fontSize: '16px' }}>👤</span>
              Profile
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#4a5568'
              }}
            >
              <span style={{ fontSize: '16px' }}>⚙️</span>
              Settings
            </button>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: '1px solid #e53e3e',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#e53e3e'
              }}
            >
              <span style={{ fontSize: '16px' }}>🚪</span>
              Logout
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Available Rooms</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handleRefreshRooms}
              style={{
                padding: '6px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Refresh
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#3182ce',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Create Room
            </button>
          </div>
        </div>

        {rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ color: '#a0aec0', fontSize: '18px' }}>
              No rooms available. Be the first to create one!
            </div>
          </div>
        ) : (
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f7fafc' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Room Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Players</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{room.name}</div>
                        <div style={{ fontSize: '14px', color: '#a0aec0' }}>
                          ID: {room.id}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div>
                        {room.players.length}/{room.settings.maxPlayers}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        backgroundColor: room.state === 'WAITING' ? '#38a169' : 
                                        room.state === 'STARTING' ? '#ed8936' : '#e53e3e',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {room.state}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleJoinRoom(room.id)}
                        disabled={room.state !== 'WAITING' || room.players.length >= room.settings.maxPlayers}
                        style={{
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: '4px',
                          backgroundColor: (room.state !== 'WAITING' || room.players.length >= room.settings.maxPlayers) ? '#a0aec0' : '#3182ce',
                          color: 'white',
                          cursor: (room.state !== 'WAITING' || room.players.length >= room.settings.maxPlayers) ? 'not-allowed' : 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Join
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <CreateRoomModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateRoom={(name: string, settings: RoomSettings) => {
            lobbySocket.createRoom(name, settings);
            setShowCreateModal(false);
          }}
        />

        {/* Profile Modal */}
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      </div>
    </div>
  );
}; 