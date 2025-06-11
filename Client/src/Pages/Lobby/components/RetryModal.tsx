import React from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Spinner,
} from '@chakra-ui/react';
import {
  dialogBoxStyle,
  headingStyle,
  buttonStyle,
} from '@/theme/styles';
import { currentTheme } from '@/singleton/currentTheme';

interface RetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const RetryModal: React.FC<RetryModalProps> = ({ 
  isOpen, 
  onClose,
  onRetry, 
  isRetrying = false 
}) => {
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
      <Box {...dialogBoxStyle} maxWidth="400px" width="90%">
        <Box textAlign="center" mb={6}>
          <Text fontSize="48px" mb={4}>
            🔌
          </Text>
          <Heading {...headingStyle} mb={2}>
            Connection Lost
          </Heading>
          <Text color={currentTheme.mutedTextColor} lineHeight="1.5">
            Your connection to the lobby server has been lost. Would you like to try reconnecting?
          </Text>
        </Box>

        <Flex gap={3} justify="center">
          <Button
            onClick={onClose}
            disabled={isRetrying}
            variant="outline"
            {...buttonStyle}
            bg="transparent"
            w="auto"
            opacity={isRetrying ? 0.6 : 1}
          >
            Back to Login
          </Button>
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            {...buttonStyle}
            w="auto"
            opacity={isRetrying ? 0.8 : 1}
            display="flex"
            alignItems="center"
            gap={2}
          >
            {isRetrying && <Spinner size="sm" color="white" />}
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}; 