import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
} from '@chakra-ui/react';
import {
  subHeadingStyle,
  inputStyle,
  buttonStyle,
  warningStyle,
  textStyle,
  mainBoxStyle,
} from '@/theme/styles';
import { currentTheme } from '@/singleton/currentTheme';
import { sessionId } from '@/Request-Respond/ws/session';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (sessionId: string, settings: {
    roomName: string;
    maxPlayers: 2 | 3 | 4;
    turnTimeLimit: number;
    allowSpectators: boolean;
    allowAnonymousSpectators: boolean;
    mapSeed: string;
  }) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom
}) => {
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<2 | 3 | 4>(4);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const [allowAnonymousSpectators, setAllowAnonymousSpectators] = useState(false);
  const [turnTimeLimit, setTurnTimeLimit] = useState<number>(300);
  const [mapSeed, setMapSeed] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});


  const handleSubmit = () => {
    const newErrors: { [key: string]: string } = {};

    if (!roomName.trim()) {
      newErrors.roomName = 'Room name is required';
    } else if (roomName.trim().length < 3) {
      newErrors.roomName = 'Room name must be at least 3 characters';
    } else if (roomName.trim().length > 30) {
      newErrors.roomName = 'Room name must be less than 30 characters';
    }

    if (!mapSeed.trim()) {
      newErrors.mapSeed = 'Map seed is required';
    } else if (mapSeed.trim().length < 3) {
      newErrors.mapSeed = 'Map seed must be at least 3 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const settings = {
      roomName: roomName.trim(),
      maxPlayers,
      turnTimeLimit,
      allowSpectators: spectatorMode,
      allowAnonymousSpectators,
      mapSeed: mapSeed.trim(),
    };

    setIsLoading(true);
    onCreateRoom(sessionId, settings);

    setRoomName('');
    setMaxPlayers(4);
    setSpectatorMode(false);
    setTurnTimeLimit(300);
    setMapSeed('');
    setErrors({});
    setIsLoading(false);
  };

  const handleClose = () => {
    setRoomName('');
    setMaxPlayers(4);
    setSpectatorMode(false);
    setTurnTimeLimit(300);
    setMapSeed('');
    setErrors({});
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Flex
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.5)"
      align="center"
      justify="center"
      zIndex={1000}
    >
      <Box {...mainBoxStyle} bg="white" maxWidth="500px" width="90%" maxHeight="90vh" overflow="auto">
        <Flex justify="space-between" align="center" mb={5}>
          <Heading {...subHeadingStyle}>Create Game Room</Heading>
          <Button
            onClick={handleClose}
            bg="transparent"
            border="none"
            fontSize="24px"
            cursor="pointer"
            p={0}
            minW="auto"
            h="auto"
            _hover={{ bg: "transparent", opacity: 0.7 }}
          >
            ×
          </Button>
        </Flex>

        <Box display="flex" flexDirection="column" gap={4}>
          <Box>
            <Text {...textStyle} mb={2}>Room Name</Text>
            <Input
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              maxLength={30}
              {...inputStyle}
            />
            {errors.roomName && (
              <Text {...warningStyle} mt={1}>{errors.roomName}</Text>
            )}
          </Box>

          <Box>
            <Text {...textStyle} mb={2}>Maximum Players</Text>
            <select
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value) as 2 | 3 | 4)}
              style={{
                width: '100%',
                color: currentTheme.textColor,
                background: currentTheme.panelBackgroundColor,
              }}
            >
              <option value={2}>2 Players</option>
              <option value={3}>3 Players</option>
              <option value={4}>4 Players</option>
            </select>
          </Box>

          <Box>
            <Text {...textStyle} mb={2}>Turn Time Limit (minutes)</Text>
            <select
              value={turnTimeLimit}
              onChange={(e) => setTurnTimeLimit(parseInt(e.target.value))}
              style={{
                width: '100%',
                color: currentTheme.textColor,
                background: currentTheme.panelBackgroundColor,
              }}
            >
              {[60, 90, 120, 150, 180, 210, 240, 270, 300, 360, 420, 480, 540, 600].map(sec => (
                <option key={sec} value={sec}>
                  {Math.floor(sec / 60)}:{(sec % 60).toString().padStart(2, '0')} minutes
                </option>
              ))}
            </select>
          </Box>

          <Box>
            <Text {...textStyle} mb={2}>Map Seed</Text>
            <Input
              placeholder="Enter map seed (e.g., random123)"
              value={mapSeed}
              onChange={(e) => setMapSeed(e.target.value)}
              maxLength={50}
              {...inputStyle}
            />
            {errors.mapSeed && (
              <Text {...warningStyle} mt={1}>{errors.mapSeed}</Text>
            )}
            <Text fontSize="sm" opacity={0.7} mt={1}>
              A unique identifier that determines the map layout
            </Text>
          </Box>

          <Box>
            <Flex justify="space-between" align="start">
              <Box>
                <Text {...textStyle}>Allow Spectator</Text>
                <Text fontSize="sm" opacity={0.7}>
                  Allow others to watch the game
                </Text>
              </Box>
              <input
                type="checkbox"
                checked={spectatorMode}
                onChange={(e) => setSpectatorMode(e.target.checked)}
              />
            </Flex>
          </Box>
        </Box>

        <Box>
          <Flex justify="space-between" align="start">
            <Box>
              <Text {...textStyle}>Allow Spectators to be annonymous</Text>
              <Text fontSize="sm" opacity={0.7}>
                The Spectators names will be hidden
              </Text>
            </Box>
            <input
              type="checkbox"
              checked={allowAnonymousSpectators}
              disabled={!spectatorMode}
              onChange={(e) => setAllowAnonymousSpectators(e.target.checked)}
            />
          </Flex>
        </Box>

        <Flex justify="flex-end" gap={3} mt={6}>
          <Button
            onClick={handleClose}
            variant="outline"
            {...buttonStyle}
            w="auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            {...buttonStyle}
            w="auto"
          >
            {isLoading ? 'Creating...' : 'Create Room'}
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};
