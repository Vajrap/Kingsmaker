import type { WaitingRoomMetadata } from '@shared/types/types';
import { 
  Badge, 
  Box, 
  Button, 
  Flex, 
  Heading, 
  Spinner, 
  Text 
} from '@chakra-ui/react';
import {
  lobbyHeaderStyle,
  lobbyButtonGroupStyle,
  lobbyButtonStyle,
  lobbySectionTitleStyle,
  lobbyTableContainerStyle,
  lobbyTableStyle,
  lobbyTableHeaderStyle,
  lobbyTableHeaderCellStyle,
  lobbyTableRowStyle,
  lobbyTableCellStyle,
  lobbyTableTextStyle,
  lobbyTableSubTextStyle,
  lobbyLoadingContainerStyle,
  lobbyLoadingSpinnerStyle,
  lobbyLoadingTextStyle,
} from '@/theme/lobbyStyles';
import { CreateRoomModal } from './components/CreateRoomModal';
// import { GameRoomView } from './GameRoomView'; // TODO: Update for waiting room service
import { RetryModal } from './components/RetryModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { backgroundStyle, buttonStyle, headingStyle, subHeadingStyle, textStyle } from '@/theme/styles';

export type LobbyMainViewProps = {
  // State
  rooms: WaitingRoomMetadata[];
  currentRoom: WaitingRoomMetadata | null;
  isConnected: boolean;
  isLoading: boolean;
  showCreateModal: boolean;
  showRetryModal: boolean;
  isRetrying: boolean;
  showProfileModal: boolean;
  showSettingsModal: boolean;
  session: { username: string } | null;

  // Actions
  onSetShowCreateModal: (show: boolean) => void;
  onSetShowRetryModal: (show: boolean) => void;
  onSetIsRetrying: (retrying: boolean) => void;
  onSetShowProfileModal: (show: boolean) => void;
  onSetShowSettingsModal: (show: boolean) => void;
  onHandleLogout: () => void;
  onHandleRefreshRooms: () => void;
  onHandleJoinRoom: (roomId: string) => void;
  onRetryConnection: () => void;
  onCreateRoom: (name: string, maxPlayers: 2 | 3 | 4) => void;
};

export function LobbyMainView({
  rooms,
  currentRoom,
  isLoading,
  showCreateModal,
  showRetryModal,
  isRetrying,
  showProfileModal,
  showSettingsModal,
  session,
  onSetShowCreateModal,
  onSetShowRetryModal,
  onSetShowProfileModal,
  onSetShowSettingsModal,
  onHandleLogout,
  onHandleRefreshRooms,
  onHandleJoinRoom,
  onRetryConnection,
  onCreateRoom,
}: LobbyMainViewProps) {

  if (isLoading) {
    return (
      <Flex {...lobbyLoadingContainerStyle}>
        <Spinner {...lobbyLoadingSpinnerStyle} />
        <Text {...lobbyLoadingTextStyle}>Connecting to lobby...</Text>
      </Flex>
    );
  }

  // Show room view if in a room
  if (currentRoom) {
    // TODO: GameRoomView needs to be updated for waiting room service
    // For now, show a placeholder
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Room: {currentRoom.name}</h2>
        <p>Players: {currentRoom.currentPlayers}/{currentRoom.maxPlayers}</p>
        <p>Status: {currentRoom.state}</p>
        <button onClick={() => window.location.reload()}>Back to Lobby</button>
        <p><em>Room view will be implemented with waiting room service</em></p>
      </div>
    );
  }

  // Show room browser
  return (
    <Box {...backgroundStyle} padding={"1vw"} background={"white"}>
      <Flex {...lobbyHeaderStyle}>
        <Box>
          <Heading {...headingStyle} justifyContent={"space-between"} alignItems={"center"}>Game Lobby</Heading>
          <Text {...textStyle}>Welcome, {session?.username}! Create or join a room to start playing.</Text>
        </Box>
        <Flex {...lobbyButtonGroupStyle}>
          <Button onClick={() => onSetShowProfileModal(true)} {...buttonStyle} w="auto">👤 Profile</Button>
          <Button onClick={() => onSetShowSettingsModal(true)} {...buttonStyle} w="auto">⚙️ Settings</Button>
          <Button onClick={onHandleLogout} {...buttonStyle} w="auto">🚪 Logout</Button>
        </Flex>
      </Flex>

      <Flex {...subHeadingStyle} justifyContent={"space-between"} alignItems={"center"} padding={"1vw"}> 
        <Heading {...lobbySectionTitleStyle}>Available Rooms</Heading>
        <Flex gap={2}>
          <Button onClick={onHandleRefreshRooms} {...buttonStyle} w="auto">Refresh</Button>
          <Button onClick={() => onSetShowCreateModal(true)} {...buttonStyle} w="auto">Create Room</Button>
        </Flex>
      </Flex>

      {rooms.length === 0 ? (
        <Text {...textStyle} textAlign={"center"} paddingLeft={"1vw"} paddingRight={"1vw"}>No rooms available. Be the first to create one!</Text>
      ) : (
        <Box {...lobbyTableContainerStyle} paddingLeft={"1vw"} paddingRight={"1vw"}>
          <Box {...lobbyTableStyle}>
            <Box {...lobbyTableHeaderStyle}>
              <Box as="tr">
                <Box {...lobbyTableHeaderCellStyle}>Room Name</Box>
                <Box {...lobbyTableHeaderCellStyle}>Players</Box>
                <Box {...lobbyTableHeaderCellStyle}>Status</Box>
                <Box {...lobbyTableHeaderCellStyle}>Actions</Box>
              </Box>
            </Box>
            <Box as="tbody">
              {rooms.map(room => (
                <Box {...lobbyTableRowStyle} key={room.id}>
                  <Box {...lobbyTableCellStyle}>
                    <Text {...lobbyTableTextStyle}>{room.name}</Text>
                    <Text {...lobbyTableSubTextStyle}>ID: {room.id}</Text>
                  </Box>
                  <Box {...lobbyTableCellStyle}>
                    <Text {...lobbyTableTextStyle}>{room.currentPlayers}/{room.maxPlayers}</Text>
                  </Box>
                  <Box {...lobbyTableCellStyle}>
                    <Badge colorScheme={room.state === 'WAITING' ? 'green' : room.state === 'STARTING' ? 'orange' : 'red'}>
                      {room.state}
                    </Badge>
                  </Box>
                  <Box {...lobbyTableCellStyle}>
                    <Button
                      onClick={() => onHandleJoinRoom(room.id)}
                      disabled={room.state !== 'WAITING' || room.currentPlayers >= room.maxPlayers}
                      {...lobbyButtonStyle}
                      size="sm"
                    >
                      Join
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      <CreateRoomModal 
        isOpen={showCreateModal} 
        onClose={() => onSetShowCreateModal(false)} 
        onCreateRoom={(name, settings) => onCreateRoom(name, settings.maxPlayers)}
      />

      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => onSetShowProfileModal(false)} 
      />
      
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => onSetShowSettingsModal(false)} 
      />

      <RetryModal
        isOpen={showRetryModal}
        onClose={() => onSetShowRetryModal(false)}
        onRetry={onRetryConnection}
        isRetrying={isRetrying}
      />
    </Box>
  );
} 