import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GameRoom } from '@shared/types/types';
import { lobbySocket, type LobbyEventHandler } from '@/Request-Respond/ws/lobbySocket';
import { sessionManager } from '@/singleton/sessionManager';
import { LobbyMainView } from './LobbyMain.view';

export const LobbyMainViewModel: React.FC = () => {
  const navigate = useNavigate();
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

  // Session check and presence validation
  useEffect(() => {
    const validateSessionAndPresence = async () => {
      if (!session) {
        console.log("No session found, redirecting to login");
        navigate('/');
        return;
      }

      // Update presence status to IN_LOBBY
      sessionManager.updatePresenceStatus('IN_LOBBY');

      // Check presence status for potential redirects
      const validation = await sessionManager.validatePresenceStatus();
      if (!validation.valid && validation.redirectTo) {
        if (validation.redirectTo === 'login') {
          navigate('/');
        } else if (validation.redirectTo === 'waiting-room' && validation.roomId) {
          navigate(`/waiting-room/${validation.roomId}`);
        }
        // If redirectTo is 'lobby', we're already in the right place
      } else if (validation.valid && validation.roomId) {
        // User should be in waiting room
        navigate(`/waiting-room/${validation.roomId}`);
      }
      
      // If validation is successful and we're supposed to be in lobby, stay here
      console.log('Presence validation result:', validation);
    };

    validateSessionAndPresence();
  }, [session, navigate]);

  useEffect(() => {
    // Only proceed if we have a session
    if (!session) return;
    console.log(`Session: ${session.sessionId}`);
    const handlers: LobbyEventHandler = {
      onConnected: () => {
        setIsConnected(true);
        setIsLoading(false);
        setShowRetryModal(false);
      },

      onDisconnected: () => {
        setIsConnected(false);
        setIsLoading(false);
        setShowRetryModal(true);
      },

      onRoomList: (roomList) => {
        setRooms(roomList);
      },

      onRoomCreated: (roomId) => {
        console.log(`Room created successfully with ID: ${roomId}`);
        // Update presence status and room ID
        sessionManager.updatePresenceStatus('IN_WAITING_ROOM');
        sessionManager.setWaitingRoomId(roomId);
        // Navigate to waiting room
        navigate(`/waiting-room/${roomId}`);
      },

      onRoomJoined: (roomId, success) => {
        if (success) {
          console.log(`Successfully joined room ${roomId}`);
          // Update presence status and room ID
          sessionManager.updatePresenceStatus('IN_WAITING_ROOM');
          sessionManager.setWaitingRoomId(roomId);
          // Navigate to waiting room
          navigate(`/waiting-room/${roomId}`);
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

  const handleRefreshRooms = (sessionID: string) => {
    lobbySocket.getRoomList(sessionID);
  };

  const handleJoinRoom = (sessionID: string, roomId: string) => {
    lobbySocket.joinRoom(sessionID, roomId);
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

  const handleCreateRoom = (
    sessionId: string,
    settings: {
      roomName: string;
      maxPlayers: 2 | 3 | 4;
      turnTimeLimit: number;
      allowSpectators: boolean;
      allowAnonymousSpectators: boolean;
    }
  ) => {
    lobbySocket.createRoom(sessionId, settings);
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
