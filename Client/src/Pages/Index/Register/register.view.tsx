import {
  Box,
  Button,
  Input,
  Stack,
  Text,
  Portal,
  DialogBackdrop,
  DialogPositioner,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Dialog,
  Link,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import type { Dispatch, SetStateAction } from "react";
import {
  dialogBoxStyle,
  headingStyle,
  inputStyle,
  subHeadingStyle,
  warningStyle,
} from "@/theme/styles";

function validateEmail(email: string) {
  return /.+@.+\..+/.test(email);
}

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

export default function RegisterView({
  isOpen,
  onClose,
  email,
  setEmail,
  username,
  setUsername,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  acceptTerms,
  setAcceptTerms,
  error,
  success,
  loading,
  onRegister,
}: {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: Dispatch<SetStateAction<string>>;
  acceptTerms: boolean;
  setAcceptTerms: Dispatch<SetStateAction<boolean>>;
  error: string;
  success: string;
  loading: boolean;
  onRegister: (e: React.FormEvent) => void;
}) {
  const isFormValid =
    validateEmail(email) &&
    validateUsername(username) &&
    validatePassword(password) &&
    confirmPassword === password &&
    acceptTerms;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Portal>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent {...dialogBoxStyle} boxShadow="2xl">
            {renderHeader()}
            <DialogBody>
              <form onSubmit={onRegister}>
                {renderAccountSection(email, setEmail, username, setUsername)}
                {renderPasswordSection(
                  password,
                  setPassword,
                  confirmPassword,
                  setConfirmPassword,
                )}
                {renderTermsCheckbox(acceptTerms, setAcceptTerms)}
                {renderStatus(error, success)}
                {renderActions(onClose, loading, isFormValid)}
              </form>
            </DialogBody>
            {renderFooter()}
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </Dialog.Root>
  );
}

function renderHeader() {
  return (
    <DialogHeader textAlign="center">
      <DialogTitle {...headingStyle}>KingsMaker's Register</DialogTitle>
    </DialogHeader>
  );
}

function renderAccountSection(
  email: string,
  setEmail: Dispatch<SetStateAction<string>>,
  username: string,
  setUsername: Dispatch<SetStateAction<string>>,
) {
  return (
    <Stack gap={4} mt={2}>
      <FormControl isRequired>
        <FormLabel {...subHeadingStyle} height={"2rem"}>
          Email
        </FormLabel>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          {...inputStyle}
        />
        <Box minH="1rem">
          <Text
            opacity={validateEmail(email) === true ? 0 : 1}
            transition="opacity 0.2s"
            {...warningStyle}
          >
            Wrong email format.
          </Text>
        </Box>
      </FormControl>
      <FormControl isRequired>
        <FormLabel {...subHeadingStyle} height={"2rem"}>
          Username
        </FormLabel>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          {...inputStyle}
        />
        <Box minH="1rem">
          <Text
            opacity={username.length < 5 ? 1 : 0}
            transition="opacity 0.2s"
            {...warningStyle}
          >
            User name needs to be at least 5 characters long.
          </Text>
        </Box>
      </FormControl>
    </Stack>
  );
}

function renderPasswordSection(
  password: string,
  setPassword: Dispatch<SetStateAction<string>>,
  confirmPassword: string,
  setConfirmPassword: Dispatch<SetStateAction<string>>,
) {
  return (
    <Stack gap={4} mt={4}>
      <FormControl isRequired>
        <FormLabel {...subHeadingStyle} height={"2rem"}>
          Password
        </FormLabel>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          {...inputStyle}
        />
        <Box minH="1rem">
          <Text
            opacity={validatePassword(password) === true ? 0 : 1}
            transition="opacity 0.2s"
            {...warningStyle}
          >
            At least 5 characters long; Upper, Lower, and number.
          </Text>
        </Box>
      </FormControl>

      <FormControl isRequired>
        <FormLabel {...subHeadingStyle} height={"2rem"}>
          Confirm Password
        </FormLabel>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          {...inputStyle}
        />
        <Box minH="1rem">
          <Text
            opacity={password === confirmPassword ? 0 : 1}
            transition="opacity 0.2s"
            {...warningStyle}
          >
            Passwords do not match.
          </Text>
        </Box>
      </FormControl>
    </Stack>
  );
}

function renderTermsCheckbox(
  acceptTerms: boolean,
  setAcceptTerms: Dispatch<SetStateAction<boolean>>,
) {
  return (
    <Box
      as="label"
      display="flex"
      alignItems="center"
      gap={3}
      cursor="pointer"
      minH="5rem"
    >
      <Box
        as="div"
        role="checkbox"
        aria-checked={acceptTerms}
        tabIndex={0}
        w="1.2rem"
        h="1.2rem"
        border="2px solid"
        borderColor="gray.400"
        borderRadius="sm"
        display="flex"
        alignItems="center"
        justifyContent="center"
        onClick={() => setAcceptTerms(!acceptTerms)}
        bg={acceptTerms ? "green.100" : "white"}
        cursor="pointer"
      >
        {acceptTerms && (
          <Box as="span" color="green.500" fontSize="sm" fontWeight="bold">
            ✓
          </Box>
        )}
      </Box>
      <Text color="black" fontSize="sm">
        I agree to the{" "}
        <Link color="blue.500" href="/terms" target="_blank">
          Terms and Conditions
        </Link>
      </Text>
    </Box>
  );
}

function renderStatus(error: string, success: string) {
  return (
    <Stack mt={4}>
      {error && <Text color="red.500">{error}</Text>}
      {success && <Text color="green.600">{success}</Text>}
    </Stack>
  );
}

function renderActions(
  onClose: () => void,
  loading: boolean,
  isFormValid: boolean,
) {
  return (
    <Box mt={6} display="flex" justifyContent="flex-end" gap={3}>
      <Button variant="ghost" onClick={onClose} rounded="xl">
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={!isFormValid}
        loading={loading}
        loadingText="Registering"
        colorScheme="brown"
        rounded="xl"
        fontWeight="bold"
        px={8}
      >
        Register
      </Button>
    </Box>
  );
}

function renderFooter() {
  return (
    <DialogFooter gap={3} height={100}>
      <Text fontSize="xs" color="brown.500" textAlign="center" w="full">
        &copy; {new Date().getFullYear()} KingsMaker. All rights reserved.
      </Text>
    </DialogFooter>
  );
}
