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
import { sendGuestLoginRequest } from "@/Request-Respond/api/auth/guest";
import { adjectives, animals, uniqueNamesGenerator } from "unique-names-generator";

function generateRandomName() {
  const nameAlias = uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '',
    style: 'capital'
  }) + Math.floor(Math.random() * 1000).toString();
  return nameAlias;
}

export default function GuestDialogue({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [guestName, setGuestName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGuestName(generateRandomName());
    }
  }, [isOpen]);

  const handleGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    setLoading(true);
    const result = await sendGuestLoginRequest(guestName);
    setLoading(false);

    if (result.head === "error") {
      setError(result.body.message);
      return;
    }

    if (result.head === "guest") {
      setSuccess("Guest login successful! Redirecting...");
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      console.error(`Unexpected result`, result);
      setError("Unexpected response from server.");
    }
  };

  const handleClose = () => {
    setGuestName("");
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
              <DialogTitle {...headingStyle}>Guest Login</DialogTitle>
            </DialogHeader>

            <DialogBody>
              <form onSubmit={handleGuest}>
                {renderGuestName(guestName, setGuestName)}
                {renderStatus(error, success)}
                {renderActions(handleClose, loading)}
              </form>
            </DialogBody>
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </Dialog.Root>
  );
}

// === Helper UI Render Functions ===

function renderGuestName(
  guestName: string,
  setGuestName: Dispatch<SetStateAction<string>>,
) {
  return (
    <Stack gap={4} mt={2}>
      <FormControl isRequired>
        <FormLabel {...subHeadingStyle} height="2rem">
          Please enter your guest name
        </FormLabel>
        <Input
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          {...inputStyle}
        />
        <Box minH="1rem">
          <Text
            opacity={guestName.length < 5 ? 1 : 0}
            transition="opacity 0.2s"
            {...warningStyle}
          >
            Guest name needs to be at least 5 characters long.
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
) {
  return (
    <Box mt={6} display="flex" justifyContent="flex-end" gap={3}>
      <Button variant="ghost" onClick={onClose} rounded="xl">
        Cancel
      </Button>
      <Button
        type="submit"
        loading={loading}
        loadingText="Logging in"
        colorScheme="brown"
        rounded="xl"
        fontWeight="bold"
        px={8}
      >
        Login
      </Button>
    </Box>
  );
}