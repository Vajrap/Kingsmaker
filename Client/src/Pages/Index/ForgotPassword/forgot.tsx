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
  DialogHeader,
  DialogTitle,
  Dialog,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import {
  dialogBoxStyle,
  headingStyle,
  inputStyle,
  subHeadingStyle,
  warningStyle,
} from "@/theme/styles";
import { sendForgotRequest } from "@/Request-Respond/api/auth/forgot";

export default function ForgotDialogue({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail("");
    }
  }, [isOpen]);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(email));
  }, [email]);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    setLoading(true);
    const result = await sendForgotRequest(email);
    setLoading(false);

    if (result.head === "error") {
      setError(result.body.message);
      return;
    }

    if (result.head !== "forgot") {
      console.error(`Unexpected result`, result);
      setError("Unexpected response from server.");
      return;
    }

    if (result.body.status === true) {
      setSuccess("Reset link sent to email!");
    } else {
      setError("Reset link failed to send.");
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setSuccess("");
    setLoading(false);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Portal>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent {...dialogBoxStyle} boxShadow="2xl">
            <DialogHeader textAlign="center">
              <DialogTitle {...headingStyle}>Forgot Password</DialogTitle>
            </DialogHeader>

            <DialogBody>
              <form onSubmit={handleForgot}>
                {renderEmail(email, setEmail, isEmailValid)}
                {renderStatus(error, success)}
                {renderActions(handleClose, loading, isEmailValid)}
              </form>
            </DialogBody>
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </Dialog.Root>
  );
}

// === Helper Render Functions ===

function renderEmail(
  email: string,
  setEmail: Dispatch<SetStateAction<string>>,
  isEmailValid: boolean,
) {
  return (
    <Stack gap={4} mt={2}>
      <FormControl isRequired>
        <FormLabel {...subHeadingStyle} height="2rem">
          Please enter your email
        </FormLabel>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          {...inputStyle}
        />
        <Box minH="1rem">
          <Text
            opacity={isEmailValid ? 0 : 1}
            transition="opacity 0.2s"
            {...warningStyle}
          >
            Wrong email format.
          </Text>
        </Box>
      </FormControl>
    </Stack>
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
  isEmailValid: boolean,
) {
  return (
    <Box mt={6} display="flex" justifyContent="flex-end" gap={3}>
      <Button variant="ghost" onClick={onClose} rounded="xl">
        Cancel
      </Button>
      <Button
        type="submit"
        loading={loading}
        loadingText="Sending"
        colorScheme="brown"
        rounded="xl"
        fontWeight="bold"
        px={8}
        disabled={!isEmailValid}
      >
        Send Reset Link
      </Button>
    </Box>
  );
}