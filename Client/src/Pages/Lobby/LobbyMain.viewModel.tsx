import React, { useEffect, useState } from 'react';
import type { WaitingRoomMetadata } from '@shared/types/types';
import { lobbySocket, type LobbyEventHandler } from '@/Request-Respond/ws/lobbySocket';
import { sessionManager } from '@/singleton/sessionManager';
import { LobbyMainView } from './LobbyMain.view';

export const LobbyMainViewModel: React.FC = () => {
  const [rooms, setRooms] = useState<WaitingRoomMetadata[]>([]);
  const [currentRoom, setCurrentRoom] = useState<WaitingRoomMetadata | null>(null);
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

    const handlers: LobbyEventHandler = {
      onConnected: () => {
        setIsConnected(true);
        setIsLoading(false);
        setShowRetryModal(false);

        // Get room list on connection
        lobbySocket.getRoomList();
      },

      onDisconnected: () => {
        setIsConnected(false);
        setIsLoading(false);
        setShowRetryModal(true);
      },

      onRoomList: (roomList) => {
        setRooms(roomList);
      },

      onRoomCreated: (room) => {
        setCurrentRoom(room);
        sessionStorage.setItem('kingsmaker-currentRoomID', room.id);
        console.log(`Room "${room.name}" created successfully`);
      },

      onRoomJoined: (roomId, success) => {
        if (success) {
          sessionStorage.setItem('kingsmaker-currentRoomID', roomId);
          // Find the room in our list to set as current
          const room = rooms.find(r => r.id === roomId);
          if (room) {
            setCurrentRoom(room);
          }
        } else {
          console.error(`Failed to join room ${roomId}`);
        }
      },

      onLobbyUpdate: (roomList, onlinePlayers) => {
        setRooms(roomList);
        console.log(`Lobby update: ${roomList.length} rooms, ${onlinePlayers} players online`);
      },

      onError: (message, code) => {
        console.error("Lobby error:", message, "Code:", code);
        
        // If error is related to room not found, clear stored room
        if (message.includes("Room not found") || message.includes("Failed to join room")) {
          const storedRoomId = sessionStorage.getItem('kingsmaker-currentRoomID');
          if (storedRoomId) {
            console.log(`Clearing invalid room ${storedRoomId} from storage`);
            sessionStorage.removeItem('kingsmaker-currentRoomID');
            setCurrentRoom(null);
          }
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← Removed session dependency to prevent reconnection loops

  const handleLogout = () => {
    sessionManager.logout();
    window.location.href = '/';
  };

  const handleRefreshRooms = () => {
    lobbySocket.getRoomList();
  };

  const handleJoinRoom = (roomId: string) => {
    lobbySocket.joinRoom(roomId);
  };

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    try {
      await lobbySocket.retryConnection();
      setShowRetryModal(false);
    } catch (error) {
      console.error('Retry connection failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCreateRoom = (name: string, maxPlayers: 2 | 3 | 4) => {
    lobbySocket.createRoom(name, maxPlayers);
    setShowCreateModal(false);
  };

  return (
    <LobbyMainView
      rooms={rooms}
      currentRoom={currentRoom}
      isConnected={isConnected}
      isLoading={isLoading}
      showCreateModal={showCreateModal}
      showRetryModal={showRetryModal}
      isRetrying={isRetrying}
      showProfileModal={showProfileModal}
      showSettingsModal={showSettingsModal}
      session={session}
      onSetShowCreateModal={setShowCreateModal}
      onSetShowRetryModal={setShowRetryModal}
      onSetIsRetrying={setIsRetrying}
      onSetShowProfileModal={setShowProfileModal}
      onSetShowSettingsModal={setShowSettingsModal}
      onHandleLogout={handleLogout}
      onHandleRefreshRooms={handleRefreshRooms}
      onHandleJoinRoom={handleJoinRoom}
      onRetryConnection={handleRetryConnection}
      onCreateRoom={handleCreateRoom}
    />
  );
}; 