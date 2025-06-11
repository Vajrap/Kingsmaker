import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  Link,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import type { Dispatch, SetStateAction, FormEvent } from "react";
import {
  backgroundStyle,
  mainBoxStyle,
  headingStyle,
  inputStyle,
  warningStyle,
  buttonStyle,
  linkStyle,
  subHeadingStyle,
} from "@/theme/styles";


export type LoginViewProps = {
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  error: string;
  onLogin: (e: FormEvent) => void;
  onRegister: () => void;
  onForgotPassword: () => void;
  onGuest: () => void;
  loginMessage: string;
};

function validateUsername(username: string) {
  return username.length >= 5;
}

function validatePassword(password: string) {
  return (
    password.length >= 5 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export function LoginView({
  username,
  setUsername,
  password,
  setPassword,
  error,
  onLogin,
  onRegister,
  onForgotPassword,
  loginMessage,
  onGuest,
}: LoginViewProps) {
  const isUsernameValid = validateUsername(username);
  const isPasswordValid = validatePassword(password);
  const isFormValid = isUsernameValid && isPasswordValid;

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
      <Box {...mainBoxStyle} position="relative" top="4rem">
        <Stack gap={6}>
          {renderHeading()}
          <form onSubmit={onLogin}>
            {renderUsername(username, setUsername, isUsernameValid)}
            {renderPassword(password, setPassword, isPasswordValid)}
            {renderLogin(loginMessage, error)}
            {renderButtons(isFormValid, onLogin, onRegister, onGuest)}
            {renderForgotPassword(onForgotPassword)}
          </form>
        </Stack>
        {renderFooter()}
      </Box>
    </Flex>
  );
}

const renderHeading = () => (
  <VStack align={"center"}>
    <Heading {...headingStyle}>KingsMaker</Heading>
  </VStack>
);

const renderUsername = (
  username: string,
  setUsername: Dispatch<SetStateAction<string>>,
  isValid: boolean,
) => (
  <FormControl
    id="username"
    isRequired
    isInvalid={!isValid && username.length > 0}
  >
    <FormLabel {...subHeadingStyle}>Username</FormLabel>
    <Input
      {...inputStyle}
      autoComplete="username"
      onChange={(e) => setUsername(e.target.value)}
    />
    <Box minH="3rem">
      <Text
        opacity={!isValid && username.length > 0 ? 1 : 0}
        transition="opacity 0.2s"
        {...warningStyle}
      >
        Username must be at least 5 characters.
      </Text>
    </Box>
  </FormControl>
);

const renderPassword = (
  password: string,
  setPassword: Dispatch<SetStateAction<string>>,
  isValid: boolean,
) => (
  <FormControl
    id="password"
    isRequired
    isInvalid={!isValid && password.length > 0}
  >
    <FormLabel {...subHeadingStyle}>Password</FormLabel>
    <Input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      autoComplete="current-password"
      {...inputStyle}
    />
    <Box minH="3rem">
      <Text
        opacity={!isValid && password.length > 0 ? 1 : 0}
        transition="opacity 0.2s"
        {...warningStyle}
      >
        Password must be at least 5 characters and include uppercase, lowercase,
        and a number.
      </Text>
    </Box>
  </FormControl>
);

const renderButtons = (
  isFormValid: boolean,
  onLogin: (e: FormEvent) => void,
  onRegister: () => void,
  onGuest: () => void,
) => (
  <VStack w="100%" align="flex-start">
    <HStack w ="98%" justify="space-between">
      <Button
        type="submit"
        disabled={!isFormValid}
        {...buttonStyle}
        onClick={onLogin}
        w="50%"
      >
        Login
      </Button>
      <Button 
        onClick={onGuest} 
        {...buttonStyle}
        w="50%"
      >
        Guest
      </Button>
    </HStack>
    <Button onClick={onRegister} {...buttonStyle} w="100%" mt="1rem">
      Register
    </Button>
  </VStack>
);

const renderForgotPassword = (onForgotPassword: () => void) => (
  <VStack
    // align center
    align={"center"}
  >
    <Link onClick={onForgotPassword} cursor="pointer" {...linkStyle}>
      Forgot Password?
    </Link>
  </VStack>
);

const renderFooter = () => (
  <Text mt={8} fontSize="xs" color="brown.500" textAlign="center">
    &copy; {new Date().getFullYear()} KingsMaker. All rights reserved.
  </Text>
);

function renderLogin(loginMessage: string, error: string) {
  if (!loginMessage && !error) {
    return (
      <Box mt={6} display="flex" justifyContent="flex-end" gap={3}>
        <Text color={"gray.500"}>Please Login...</Text>
      </Box>
    );
  }
  return (
    <Box mt={6} display="flex" justifyContent="flex-end" gap={3}>
      <Text color={error ? "red.500" : "gray.500"}>
        {error || loginMessage}
      </Text>
    </Box>
  );
}
