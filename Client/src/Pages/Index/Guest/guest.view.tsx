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
  import type { Dispatch, SetStateAction } from "react";
  import {
    dialogBoxStyle,
    headingStyle,
    inputStyle,
    subHeadingStyle,
    warningStyle,
  } from "@/theme/styles";
  
  export default function GuestView({
    isOpen,
    onClose,
    guestName,
    setGuestName,
    error,
    success,
    loading,
    onGuest,
  }: {
    isOpen: boolean;
    onClose: () => void;
    guestName: string;
    setGuestName: Dispatch<SetStateAction<string>>;
    error: string;
    success: string;
    loading: boolean;
    onGuest: (e: React.FormEvent) => void;
  }) {
    
    return (
      <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Portal>
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent {...dialogBoxStyle} boxShadow="2xl">
              {renderHeader()}
              <DialogBody>
                <form onSubmit={onGuest}>
                  {renderGuestName(guestName, setGuestName)}
                  {renderStatus(error, success)}
                  {renderActions(onClose, loading)}
                </form>
              </DialogBody>
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </Dialog.Root>
    );
  }
  
  function renderHeader() {
    return (
      <DialogHeader textAlign="center">
        <DialogTitle {...headingStyle}>Guest Login</DialogTitle>
      </DialogHeader>
    );
  }
  
  function renderGuestName(
    guestName: string,
    setGuestName: Dispatch<SetStateAction<string>>,
  ) {
    return (
      <Stack gap={4} mt={2}>
        <FormControl isRequired>
          <FormLabel {...subHeadingStyle} height={"2rem"}>
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
  