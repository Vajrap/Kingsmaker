import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GameRoom, Player } from '@shared/types/types';
import { waitingRoomSocket, type WaitingRoomEventHandler } from '@/Request-Respond/ws/waitingRoomSocket';
import { sessionManager } from '@/singleton/sessionManager';
import { WaitingRoomView } from './WaitingRoomView';

interface WaitingRoomViewModelProps {
    roomId: string;
}

export const WaitingRoomViewModel: React.FC<WaitingRoomViewModelProps> = ({ roomId }) => {
    const navigate = useNavigate();
    const [room, setRoom] = useState<GameRoom | null>(null);
    const [players, setPlayers] = useState<(Player & { displayStatus: string })[]>([]);
    const [playerRole, setPlayerRole] = useState<'host' | 'player' | null>(null);
    const [connectionInfo, setConnectionInfo] = useState<{ connectedPlayers: number; disconnectedPlayers: number }>({
        connectedPlayers: 0,
        disconnectedPlayers: 0
    });
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showRetryModal, setShowRetryModal] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);

    const session = sessionManager.getSession();

    // Session validation
    useEffect(() => {
        if (!session) {
            console.log("No session found, redirecting to login");
            navigate('/');
            return;
        }

        // Update presence status to waiting room
        sessionManager.updatePresenceStatus('IN_WAITING_ROOM');
        sessionManager.setWaitingRoomId(roomId);
    }, [session, roomId, navigate]);

    // WebSocket connection
    useEffect(() => {
        if (!session) return;

        const handlers: WaitingRoomEventHandler = {
            onConnected: () => {
                setIsConnected(true);
                setIsLoading(false);
                setShowRetryModal(false);
                setError(null);
            },

            onDisconnected: () => {
                setIsConnected(false);
                setIsLoading(false);
                setShowRetryModal(true);
            },

            onRoomData: (roomData) => {
                console.log('Room data received:', roomData);
                setRoom(roomData.room);
                setPlayers(roomData.room.players);
                setPlayerRole(roomData.playerRole);
                setConnectionInfo(roomData.connectionInfo);
            },

            onPlayerStatusUpdate: (updatedPlayers) => {
                console.log('Player status update:', updatedPlayers);
                setPlayers(updatedPlayers);
                
                // Update connection info
                const connectedCount = updatedPlayers.filter(p => p.connectionStatus === "connected").length;
                const disconnectedCount = updatedPlayers.filter(p => p.connectionStatus !== "connected").length;
                setConnectionInfo({
                    connectedPlayers: connectedCount,
                    disconnectedPlayers: disconnectedCount
                });
            },

            onError: (message, code) => {
                console.error("WaitingRoom error:", message, "Code:", code);
                setError(message);
                setIsLoading(false);

                // Handle specific error cases
                if (code === "ROOM_NOT_FOUND" || message.includes("Room not found")) {
                    setError("Room no longer exists. Redirecting to lobby...");
                    sessionManager.updatePresenceStatus('IN_LOBBY');
                    sessionManager.setWaitingRoomId(null);
                    setTimeout(() => {
                        navigate('/lobby');
                    }, 2000);
                } else if (code === "NOT_IN_ROOM" || message.includes("Not in room")) {
                    setError("You are not in this room. Redirecting to lobby...");
                    sessionManager.updatePresenceStatus('IN_LOBBY');
                    sessionManager.setWaitingRoomId(null);
                    setTimeout(() => {
                        navigate('/lobby');
                    }, 2000);
                } else {
                    setShowRetryModal(true);
                }
            }
        };

        waitingRoomSocket.connect(roomId, handlers).catch((error) => {
            console.error('Failed to connect to waiting room:', error);
            setIsLoading(false);
            setError('Failed to connect to room');
            setShowRetryModal(true);
        });

        return () => {
            console.log("WaitingRoomViewModel unmounting - disconnecting WebSocket");
            waitingRoomSocket.disconnect();
        };
    }, [roomId, session, navigate]);

    // Action handlers
    const handleLeaveRoom = () => {
        waitingRoomSocket.leaveRoom();
        
        // Update presence status
        sessionManager.updatePresenceStatus('IN_LOBBY');
        sessionManager.setWaitingRoomId(null);
        
        // Navigate to lobby
        navigate('/lobby');
    };

    const handleRefreshRoom = () => {
        waitingRoomSocket.refreshRoomData();
    };

    const handleRetryConnection = async () => {
        setIsRetrying(true);
        try {
            await waitingRoomSocket.retryConnection();
            setShowRetryModal(false);
            setError(null);
        } catch (error) {
            console.error('Retry connection failed:', error);
            setError('Failed to reconnect. Please try again.');
        } finally {
            setIsRetrying(false);
        }
    };

    const handlePlayerAction = (action: string, data?: unknown) => {
        // Handle player actions like ready/unready, character selection, etc.
        console.log(`Player action: ${action}`, data);
        
        // TODO: Implement player actions
        // waitingRoomSocket.playerUpdate(action, data);
    };

    return (
        <WaitingRoomView
            room={room}
            players={players}
            playerRole={playerRole}
            connectionInfo={connectionInfo}
            isConnected={isConnected}
            isLoading={isLoading}
            error={error}
            showRetryModal={showRetryModal}
            isRetrying={isRetrying}
            session={session}
            onLeaveRoom={handleLeaveRoom}
            onRefreshRoom={handleRefreshRoom}
            onRetryConnection={handleRetryConnection}
            onPlayerAction={handlePlayerAction}
        />
    );
};

export default WaitingRoomViewModel; 