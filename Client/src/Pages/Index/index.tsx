import {
  Box, Button, Flex, Heading, Input, Stack, Text, Link, VStack, HStack
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { useState, useEffect, type FormEvent } from "react";
import {
  backgroundStyle, mainBoxStyle, headingStyle, inputStyle, warningStyle,
  buttonStyle, linkStyle, subHeadingStyle,
} from "@/theme/styles";
import { sendLoginRequest } from "@/Request-Respond/api/auth/login";
import { sessionManager } from "@/singleton/sessionManager";
import RegisterDialogue from "./Register/register";
import GuestDialogue from "./Guest/guest";
import ForgotDialogue from "./ForgotPassword/forgot";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isGuestOpen, setGuestOpen] = useState(false);
  const [isForgotOpen, setForgotOpen] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      if (sessionManager.isLoggedIn()) {
        const valid = await sessionManager.validateSession();
        if (valid) {
          window.location.href = '/lobby';
          return;
        }
      }
      const lastLogin = sessionManager.getLastLogin();
      if (lastLogin) setUsername(lastLogin);
      setIsCheckingSession(false);
    };
    checkSession();
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setLoginMessage("Logging in...");
    const res = await sendLoginRequest(username, password);
    if (res.head === "error") {
      setError(res.body.message);
      setLoginMessage("");
    } else {
      setLoginMessage("Login successful! Redirecting...");
    }
  };

  const isUsernameValid = username.length >= 5;
  const isPasswordValid = password.length >= 5 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password);
  const isFormValid = isUsernameValid && isPasswordValid;

  if (isCheckingSession) return <Text>Checking session...</Text>;

  return (
    <>
      <LoginBackground>
        <LoginBox>
          <Stack gap={6}>
            <VStack>
              <Heading {...headingStyle}>KingsMaker</Heading>
            </VStack>
            <LoginForm onSubmit={handleLogin}>
              <LoginFormContent
                username={username}
                password={password}
                isUsernameValid={isUsernameValid}
                isPasswordValid={isPasswordValid}
                error={error}
                loginMessage={loginMessage}
                isFormValid={isFormValid}
                setUsername={setUsername}
                setPassword={setPassword}
                openRegister={() => setRegisterOpen(true)}
                openGuest={() => setGuestOpen(true)}
                openForgot={() => setForgotOpen(true)}
              />
            </LoginForm>
            <Text fontSize="xs" color="brown.500" textAlign="center">
              &copy; {new Date().getFullYear()} KingsMaker. All rights reserved.
            </Text>
          </Stack>
        </LoginBox>
      </LoginBackground>

      <RegisterDialogue isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)} />
      <GuestDialogue isOpen={isGuestOpen} onClose={() => setGuestOpen(false)} />
      <ForgotDialogue isOpen={isForgotOpen} onClose={() => setForgotOpen(false)} />
    </>
  );
}

function LoginBackground({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      minH={backgroundStyle.minH}
      align={backgroundStyle.align}
      justify={backgroundStyle.justify}
      bg={backgroundStyle.bg}
      backgroundImage="url('/cover_2.png')"
      backgroundSize="90%"
      backgroundRepeat="no-repeat"
      backgroundPosition="center"
    >
      {children}
    </Flex>
  );
}

function LoginBox({ children }: { children: React.ReactNode }) {
  return (
    <Box {...mainBoxStyle} position="relative" top="4rem">
      {children}
    </Box>
  );
}

function LoginForm({
  onSubmit,
  children,
}: {
  onSubmit: (e: FormEvent) => void;
  children: React.ReactNode;
}) {
  return <form onSubmit={onSubmit}>{children}</form>;
}

function LoginFormContent({
  username,
  password,
  isUsernameValid,
  isPasswordValid,
  error,
  loginMessage,
  isFormValid,
  setUsername,
  setPassword,
  openRegister,
  openGuest,
  openForgot,
}: {
  username: string;
  password: string;
  isUsernameValid: boolean;
  isPasswordValid: boolean;
  error: string;
  loginMessage: string;
  isFormValid: boolean;
  setUsername: (val: string) => void;
  setPassword: (val: string) => void;
  openRegister: () => void;
  openGuest: () => void;
  openForgot: () => void;
}) {
  return (
    <>
      <FormControl isRequired isInvalid={!isUsernameValid && username.length > 0}>
        <FormLabel {...subHeadingStyle}>Username</FormLabel>
        <Input
          autoComplete="username"
          {...inputStyle}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Text opacity={!isUsernameValid && username ? 1 : 0} {...warningStyle}>
          Username must be at least 5 characters.
        </Text>
      </FormControl>

      <FormControl isRequired isInvalid={!isPasswordValid && password.length > 0}>
        <FormLabel {...subHeadingStyle}>Password</FormLabel>
        <Input
          type="password"
          value={password}
          autoComplete="current-password"
          {...inputStyle}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Text opacity={!isPasswordValid && password ? 1 : 0} {...warningStyle}>
          Must include uppercase, lowercase, number.
        </Text>
      </FormControl>

      <Text mt={4} color={error ? "red.500" : "gray.500"}>
        {error || loginMessage || "Please Login..."}
      </Text>

      <VStack align="start" mt={4}>
        <HStack w="100%" justify="space-between">
          <Button type="submit" disabled={!isFormValid} {...buttonStyle} w="50%">
            Login
          </Button>
          <Button onClick={openGuest} {...buttonStyle} w="50%">
            Guest
          </Button>
        </HStack>
        <Button onClick={openRegister} {...buttonStyle} w="100%" mt="1rem">
          Register
        </Button>
      </VStack>

      <VStack align="center" mt={2}>
        <Link onClick={openForgot} {...linkStyle}>
          Forgot Password?
        </Link>
      </VStack>
    </>
  );
}