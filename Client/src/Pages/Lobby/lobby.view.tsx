import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { sessionManager, type UserSession } from "@/singleton/sessionManager";
import { logoutRequest } from "@/Request-Respond/api/auth/auth";
import {
  backgroundStyle,
  mainBoxStyle,
  headingStyle,
  buttonStyle,
  subHeadingStyle,
} from "@/theme/styles";

export default function LobbyView() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const session = sessionManager.getSession();
    if (!session) {
      // No session, redirect to login
      window.location.href = '/';
      return;
    }

    setUserSession(session);
    setLoading(false);

    // Validate session with backend
    sessionManager.validateSession().then((isValid) => {
      if (!isValid) {
        window.location.href = '/';
      }
    });
  }, []);

  const handleLogout = async () => {
    await logoutRequest();
  };

  if (loading) {
    return (
      <Flex {...backgroundStyle}>
        <Box {...mainBoxStyle}>
          <Text>Loading...</Text>
        </Box>
      </Flex>
    );
  }

  if (!userSession) {
    return (
      <Flex {...backgroundStyle}>
        <Box {...mainBoxStyle}>
          <Text>Redirecting to login...</Text>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex {...backgroundStyle}>
      <Box {...mainBoxStyle} maxW="4xl" w="full">
        <VStack align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <VStack align="start" >
              <Heading {...headingStyle}>KingsMaker Lobby</Heading>
              <Text {...subHeadingStyle}>
                Welcome, {userSession.username}
                {userSession.userType === 'guest' && ' (Guest)'}
              </Text>
            </VStack>
            <Button {...buttonStyle} onClick={handleLogout} maxW="200px">
              Logout
            </Button>
          </HStack>

          {/* User Info */}
          <Box p={4} border="1px solid" borderColor="gray.300" borderRadius="md">
            <Text {...subHeadingStyle} mb={2}>User Information</Text>
            <VStack align="start">
              <Text>Username: {userSession.username}</Text>
              <Text>Account Type: {userSession.userType}</Text>
              <Text>Session ID: {userSession.sessionID.substring(0, 8)}...</Text>
              <Text>Login Time: {new Date(userSession.loginTime).toLocaleString()}</Text>
            </VStack>
          </Box>

          {/* Placeholder Content */}
          <Box p={8} textAlign="center" border="2px dashed" borderColor="gray.300" borderRadius="md">
            <Text {...headingStyle} mb={4}>Game Lobby Coming Soon!</Text>
            <Text>This is where you'll be able to:</Text>
            <VStack mt={4} >
              <Text>• Create or join game rooms</Text>
              <Text>• View your statistics and achievements</Text>
              <Text>• Customize your profile and unlockables</Text>
              <Text>• Chat with other players</Text>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
} 