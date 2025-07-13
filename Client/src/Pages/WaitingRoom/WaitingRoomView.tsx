import React from 'react';
import {
    Box,
    Button,
    Flex,
    Heading,
    Text,
    Badge,
    Spinner,
    VStack,
    HStack,
} from '@chakra-ui/react';
import type { GameRoom, Player } from '@shared/types/types';
import type { UserSession } from '@/singleton/sessionManager';
import { backgroundStyle, buttonStyle, headingStyle, textStyle } from '@/theme/styles';
import { RetryModal } from '../Lobby/components/RetryModal';

export interface WaitingRoomViewProps {
    room: GameRoom | null;
    players: (Player & { displayStatus: string })[];
    playerRole: 'host' | 'player' | null;
    connectionInfo: { connectedPlayers: number; disconnectedPlayers: number };
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    showRetryModal: boolean;
    isRetrying: boolean;
    session: UserSession | null;
    onLeaveRoom: () => void;
    onRefreshRoom: () => void;
    onRetryConnection: () => void;
    onPlayerAction: (action: string, data?: unknown) => void;
}

export const WaitingRoomView: React.FC<WaitingRoomViewProps> = ({
    room,
    players,
    playerRole,
    connectionInfo,
    isConnected,
    isLoading,
    error,
    showRetryModal,
    isRetrying,
    session,
    onLeaveRoom,
    onRefreshRoom,
    onRetryConnection,
    onPlayerAction,
}) => {
    if (isLoading) {
        return (
            <Flex 
                {...backgroundStyle}
                justify="center"
                align="center"
                minH="100vh"
                flexDirection="column"
            >
                <Spinner size="xl" mb={4} />
                <Text {...textStyle}>Connecting to room...</Text>
            </Flex>
        );
    }

    if (error && !showRetryModal) {
        return (
            <Flex 
                {...backgroundStyle}
                justify="center"
                align="center"
                minH="100vh"
                flexDirection="column"
            >
                <Text {...headingStyle} color="red.500" mb={4}>Error</Text>
                <Text {...textStyle} mb={4}>{error}</Text>
                <Button onClick={onLeaveRoom} {...buttonStyle}>
                    Back to Lobby
                </Button>
            </Flex>
        );
    }

    if (!room) {
        return (
            <Flex 
                {...backgroundStyle}
                justify="center"
                align="center"
                minH="100vh"
                flexDirection="column"
            >
                <Text {...textStyle}>Room not found</Text>
                <Button onClick={onLeaveRoom} {...buttonStyle} mt={4}>
                    Back to Lobby
                </Button>
            </Flex>
        );
    }

    return (
        <Box {...backgroundStyle} padding="2rem" minH="100vh">
            {/* Header */}
            <Flex justify="space-between" align="center" mb={6}>
                <VStack align="start" gap={1}>
                    <Heading {...headingStyle}>
                        {room.name}
                        {playerRole === 'host' && <Badge ml={2} colorScheme="blue">Host</Badge>}
                    </Heading>
                    <Text {...textStyle}>
                        Welcome, {session?.username}!
                    </Text>
                </VStack>
                
                <HStack gap={4}>
                    <VStack align="center" gap={1}>
                        <Text fontSize="sm" opacity={0.8}>Connection</Text>
                        <Badge colorScheme={isConnected ? 'green' : 'red'}>
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </Badge>
                    </VStack>
                    <Button onClick={onRefreshRoom} {...buttonStyle} size="sm">
                        Refresh
                    </Button>
                    <Button onClick={onLeaveRoom} {...buttonStyle} size="sm" colorScheme="red">
                        Leave Room
                    </Button>
                </HStack>
            </Flex>

            {/* Room Info */}
            <Box mb={6} p={4} border="1px solid" borderColor="gray.200" borderRadius="md" bg="white">
                <Flex justify="space-between" align="center">
                    <VStack align="start" gap={2}>
                        <Text fontSize="lg" fontWeight="bold">Room Information</Text>
                        <HStack gap={4}>
                            <Text>Players: {players.length}/{room.maxPlayers}</Text>
                            <Text>Status: <Badge colorScheme={room.state === 'WAITING' ? 'green' : 'orange'}>{room.state}</Badge></Text>
                            <Text>Turn Time: {Math.floor(room.turnTimeLimit / 60)}:{(room.turnTimeLimit % 60).toString().padStart(2, '0')} min</Text>
                        </HStack>
                    </VStack>
                    
                    <VStack align="end" gap={1}>
                        <Text fontSize="sm" opacity={0.8}>Connection Status</Text>
                        <HStack gap={4}>
                            <Badge colorScheme="green">
                                {connectionInfo.connectedPlayers} Online
                            </Badge>
                            {connectionInfo.disconnectedPlayers > 0 && (
                                <Badge colorScheme="orange">
                                    {connectionInfo.disconnectedPlayers} Offline
                                </Badge>
                            )}
                        </HStack>
                    </VStack>
                </Flex>
            </Box>

            {/* Players List */}
            <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md" bg="white">
                <Heading size="md" mb={4}>Players</Heading>
                <VStack gap={3} align="stretch">
                    {players.map((player, index) => (
                        <PlayerCard
                            key={player.userId}
                            player={player}
                            isHost={index === 0}
                            isCurrentUser={player.userId === session?.sessionId}
                            onPlayerAction={onPlayerAction}
                        />
                    ))}
                    
                    {/* Empty slots */}
                    {Array.from({ length: room.maxPlayers - players.length }).map((_, index) => (
                        <Box
                            key={`empty-${index}`}
                            p={4}
                            border="2px dashed"
                            borderColor="gray.300"
                            borderRadius="md"
                            textAlign="center"
                            opacity={0.5}
                        >
                            <Text>Waiting for player...</Text>
                        </Box>
                    ))}
                </VStack>
            </Box>

            {/* Game Actions */}
            {playerRole === 'host' && (
                <Box mt={6} p={4} border="1px solid" borderColor="gray.200" borderRadius="md" bg="white">
                    <Heading size="md" mb={4}>Host Actions</Heading>
                    <HStack gap={4}>
                        <Button 
                            onClick={() => onPlayerAction('start_game')}
                            {...buttonStyle}
                            colorScheme="green"
                            disabled={players.length < 2 || !players.every(p => p.isReady)}
                        >
                            Start Game
                        </Button>
                        <Button 
                            onClick={() => onPlayerAction('kick_player')}
                            {...buttonStyle}
                            colorScheme="orange"
                            disabled={players.length <= 1}
                        >
                            Kick Player
                        </Button>
                    </HStack>
                    <Text fontSize="sm" mt={2} opacity={0.8}>
                        {players.length < 2 && "Need at least 2 players to start"}
                        {players.length >= 2 && !players.every(p => p.isReady) && "All players must be ready"}
                    </Text>
                </Box>
            )}

            {/* Retry Modal */}
            <RetryModal
                isOpen={showRetryModal}
                onClose={() => {/* Cannot close - must retry or leave */}}
                onRetry={onRetryConnection}
                isRetrying={isRetrying}
            />
        </Box>
    );
};

// Player Card Component
interface PlayerCardProps {
    player: Player & { displayStatus: string };
    isHost: boolean;
    isCurrentUser: boolean;
    onPlayerAction: (action: string, data?: unknown) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, isHost, isCurrentUser, onPlayerAction }) => {
    const getStatusColor = (status: string) => {
        if (status === 'Online') return 'green';
        if (status.includes('Disconnected')) return 'orange';
        return 'gray';
    };

    return (
        <Box
            p={4}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            bg={isCurrentUser ? 'blue.50' : 'white'}
        >
            <Flex justify="space-between" align="center">
                <VStack align="start" gap={1}>
                    <HStack>
                        <Text fontWeight="bold">{player.username}</Text>
                        {isHost && <Badge colorScheme="blue">Host</Badge>}
                        {isCurrentUser && <Badge colorScheme="purple">You</Badge>}
                    </HStack>
                    <HStack gap={2}>
                        <Badge colorScheme={getStatusColor(player.displayStatus)}>
                            {player.displayStatus}
                        </Badge>
                        <Badge colorScheme={player.isReady ? 'green' : 'red'}>
                            {player.isReady ? 'Ready' : 'Not Ready'}
                        </Badge>
                    </HStack>
                </VStack>

                <VStack gap={2}>
                    {isCurrentUser && (
                        <Button
                            size="sm"
                            onClick={() => onPlayerAction('toggle_ready')}
                            colorScheme={player.isReady ? 'red' : 'green'}
                        >
                            {player.isReady ? 'Unready' : 'Ready'}
                        </Button>
                    )}
                    {player.character && (
                        <Text fontSize="sm" opacity={0.8}>
                            {player.character.name}
                        </Text>
                    )}
                </VStack>
            </Flex>
        </Box>
    );
};

export default WaitingRoomView; 