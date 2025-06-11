import React from 'react';
import { sessionManager } from '@/singleton/sessionManager';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
} from '@chakra-ui/react';
import {
  dialogBoxStyle,
  headingStyle,
  subHeadingStyle,
  buttonStyle,
} from '@/theme/styles';
import { currentTheme } from '@/singleton/currentTheme';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const session = sessionManager.getSession();
  
  if (!session) {
    return null;
  }

  const formatLoginTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAccountTypeBadge = () => {
    if (session.userType === 'registered') {
      return {
        text: 'Registered Account',
        color: '#38a169',
        bgColor: '#f0fff4'
      };
    } else {
      return {
        text: 'Guest Account',
        color: '#ed8936',
        bgColor: '#fffaf0'
      };
    }
  };

  const badge = getAccountTypeBadge();

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
      <Box {...dialogBoxStyle} maxWidth="500px" width="90%">
        {/* Header */}
        <Flex
          justify="space-between"
          align="center"
          mb={6}
          borderBottom="1px solid"
          borderColor={currentTheme.borderColor}
          pb={4}
        >
          <Heading {...headingStyle}>Player Profile</Heading>
          <Button
            onClick={onClose}
            bg="transparent"
            border="none"
            fontSize="24px"
            cursor="pointer"
            p={0}
            minW="auto"
            h="auto"
            color={currentTheme.mutedTextColor}
            _hover={{ bg: "transparent", opacity: 0.7 }}
          >
            ×
          </Button>
        </Flex>

        {/* Profile Content */}
        <Box display="flex" flexDirection="column" gap={6}>
          {/* User Avatar & Basic Info */}
          <Flex align="center" gap={5}>
            <Box
              width="80px"
              height="80px"
              borderRadius="50%"
              bg={currentTheme.hudBackgroundColor}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="32px"
              fontWeight="bold"
              color={currentTheme.textColor}
            >
              {session.username[0]?.toUpperCase() || '?'}
            </Box>
            <Box flex={1}>
              <Heading {...subHeadingStyle} mb={2}>
                {session.username}
              </Heading>
              <Box
                bg={badge.bgColor}
                color={badge.color}
                px={3}
                py={1}
                borderRadius="16px"
                fontSize="sm"
                fontWeight="500"
                display="inline-block"
              >
                {badge.text}
              </Box>
            </Box>
          </Flex>

          {/* Account Details */}
          <Box bg={currentTheme.hudBackgroundColor} borderRadius="md" p={5}>
            <Text {...subHeadingStyle} mb={4}>Account Information</Text>
            <Box display="flex" flexDirection="column" gap={3}>
              <Flex justify="space-between">
                <Text color={currentTheme.mutedTextColor}>User ID:</Text>
                <Text fontFamily="monospace" color={currentTheme.textColor}>{session.userID}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color={currentTheme.mutedTextColor}>Last Login:</Text>
                <Text color={currentTheme.textColor}>{formatLoginTime(session.loginTime)}</Text>
              </Flex>
            </Box>
          </Box>

          {/* Game Stats (Placeholder) */}
          <Box bg={currentTheme.hudBackgroundColor} borderRadius="md" p={5}>
            <Text {...subHeadingStyle} mb={4}>Game Statistics</Text>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={4}>
              <Box textAlign="center">
                <Text fontSize="xl" fontWeight="bold" color={currentTheme.primaryColor}>0</Text>
                <Text fontSize="sm" color={currentTheme.mutedTextColor}>Games Played</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="xl" fontWeight="bold" color={currentTheme.successColor}>0</Text>
                <Text fontSize="sm" color={currentTheme.mutedTextColor}>Games Won</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="xl" fontWeight="bold" color={currentTheme.warningColor}>0%</Text>
                <Text fontSize="sm" color={currentTheme.mutedTextColor}>Win Rate</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="xl" fontWeight="bold" color={currentTheme.accentColor}>0</Text>
                <Text fontSize="sm" color={currentTheme.mutedTextColor}>Hours Played</Text>
              </Box>
            </Box>
            <Box
              mt={4}
              p={3}
              bg={currentTheme.panelBackgroundColor}
              borderRadius="md"
              fontSize="sm"
              textAlign="center"
              color={currentTheme.mutedTextColor}
            >
              💡 Game statistics will be tracked once you start playing! 
            </Box>
          </Box>

          {/* Actions */}
          <Flex gap={3} justify="flex-end">
            {session.userType === 'guest' && (
              <Button
                variant="outline"
                {...buttonStyle}
                bg="transparent"
                w="auto"
                onClick={() => {
                  // TODO: Navigate to registration
                  alert('Registration feature coming soon!');
                }}
              >
                Create Account
              </Button>
            )}
            <Button
              onClick={onClose}
              {...buttonStyle}
              w="auto"
            >
              Close
            </Button>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
}; 