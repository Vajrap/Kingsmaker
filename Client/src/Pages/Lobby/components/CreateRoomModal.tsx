import React, { useState } from 'react';
import type { RoomSettings } from '@shared/types';
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

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (name: string, settings: RoomSettings) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom
}) => {
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<2 | 3 | 4>(4);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const [turnTimeLimit, setTurnTimeLimit] = useState<number>(300);
  const [hasTimeLimit, setHasTimeLimit] = useState(false);
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

    if (hasTimeLimit && (turnTimeLimit < 30 || turnTimeLimit > 1800)) {
      newErrors.turnTimeLimit = 'Turn time must be between 30 seconds and 30 minutes';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const settings: RoomSettings = {
      maxPlayers,
      spectatorMode,
      turnTimeLimit: hasTimeLimit ? turnTimeLimit : undefined
    };

    setIsLoading(true);
    onCreateRoom(roomName.trim(), settings);
    
    setRoomName('');
    setMaxPlayers(4);
    setSpectatorMode(false);
    setTurnTimeLimit(300);
    setHasTimeLimit(false);
    setErrors({});
    setIsLoading(false);
  };

  const handleClose = () => {
    setRoomName('');
    setMaxPlayers(4);
    setSpectatorMode(false);
    setTurnTimeLimit(300);
    setHasTimeLimit(false);
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
            <Flex justify="space-between" align="start">
              <Box>
                <Text {...textStyle}>Turn Time Limit</Text>
                <Text fontSize="sm" opacity={0.7}>
                  Set a time limit for each player's turn
                </Text>
              </Box>
              <input
                type="checkbox"
                checked={hasTimeLimit}
                onChange={(e) => setHasTimeLimit(e.target.checked)}
              />
            </Flex>
          </Box>

          {hasTimeLimit && (
            <Box>
              <Text {...textStyle} mb={2}>Time Limit (seconds)</Text>
              <Input
                type="number"
                value={turnTimeLimit}
                onChange={(e) => setTurnTimeLimit(parseInt(e.target.value) || 300)}
                min={30}
                max={1800}
                step={30}
                {...inputStyle}
              />
              <Text fontSize="xs" opacity={0.6} mt={1}>
                {Math.floor(turnTimeLimit / 60)}:{(turnTimeLimit % 60).toString().padStart(2, '0')} minutes
              </Text>
              {errors.turnTimeLimit && (
                <Text {...warningStyle} mt={1}>{errors.turnTimeLimit}</Text>
              )}
            </Box>
          )}

          <Box>
            <Flex justify="space-between" align="start">
              <Box>
                <Text {...textStyle}>Spectator Mode</Text>
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