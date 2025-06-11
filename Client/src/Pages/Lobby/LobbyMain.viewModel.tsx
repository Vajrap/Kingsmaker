import React, { useEffect, useState } from 'react';
import type { GameRoom, RoomSettings } from '@shared/types';
import { lobbySocket, type LobbyEventHandler } from '@/Request-Respond/ws/lobbySocket';
import { sessionManager } from '@/singleton/sessionManager';
import { LobbyMainView } from './LobbyMain.view';

export const LobbyMainViewModel: React.FC = () => {
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

    const handlers: LobbyEventHandler = {
      onConnected: () => {
        setIsConnected(true);
        setIsLoading(false);
        setShowRetryModal(false);

        // Restore room if available
        const storedRoomId = sessionStorage.getItem('kingsmaker-currentRoomID');
        if (storedRoomId) {
          console.log(`Attempting to rejoin room: ${storedRoomId}`);
          // Get room info first to validate it exists
          lobbySocket.getRoomInfo(storedRoomId);
        }

        // Always get room list
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

      onRoomJoined: (room) => {
        sessionStorage.setItem('kingsmaker-currentRoomID', room.id);
        setCurrentRoom(room);
      },

      onRoomLeft: () => {
        setCurrentRoom(null);
        // Refresh room list
        sessionStorage.removeItem('kingsmaker-currentRoomID');
        lobbySocket.getRoomList();
      },

      onRoomPresence: (roomId) => {
        const sessionRoomId = sessionStorage.getItem('kingsmaker-currentRoomID');
        console.log(`checking for current room, id = ${roomId} and currentRoom = ${sessionRoomId}`)
        if (sessionRoomId === roomId) {
          return true;
        }
        return false;
      },

      onRoomInfoAndJoin: (room) => {
        // This is called when we get room info during auto-reconnection
        const storedRoomId = sessionStorage.getItem('kingsmaker-currentRoomID');
        if (storedRoomId && room.id === storedRoomId) {
          console.log(`Room ${storedRoomId} still exists, rejoining...`);
          lobbySocket.joinRoom(storedRoomId);
        }
      },

      onError: (message) => {
        console.error("Lobby error:", message);
        
        // If error is related to room not found, clear stored room
        if (message.includes("Room not found") || message.includes("Failed to join room")) {
          const storedRoomId = sessionStorage.getItem('kingsmaker-currentRoomID');
          if (storedRoomId) {
            console.log(`Clearing invalid room ${storedRoomId} from storage`);
            sessionStorage.removeItem('kingsmaker-currentRoomID');
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

  const handleCreateRoom = (name: string, settings: RoomSettings) => {
    lobbySocket.createRoom(name, settings);
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