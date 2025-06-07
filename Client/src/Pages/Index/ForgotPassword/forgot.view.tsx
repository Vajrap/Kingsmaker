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
  
  export default function ForgotView({
    isOpen,
    onClose,
    email,
    setEmail,
    error,
    success,
    loading,
    onForgot,
    isEmailValid,
  }: {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    setEmail: Dispatch<SetStateAction<string>>;
    error: string;
    success: string;
    loading: boolean;
    onForgot: (e: React.FormEvent) => void;
    isEmailValid: boolean;
  }) {
    
    return (
      <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Portal>
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent {...dialogBoxStyle} boxShadow="2xl">
              {renderHeader()}
              <DialogBody>
                <form onSubmit={onForgot}>
                  {renderEmail(email, setEmail, isEmailValid)}
                  {renderStatus(error, success)}
                  {renderActions(onClose, loading, isEmailValid)}
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
        <DialogTitle {...headingStyle}>Forgot Password</DialogTitle>
      </DialogHeader>
    );
  }
  
  function renderEmail(
    email: string,
    setEmail: Dispatch<SetStateAction<string>>,
    isEmailValid: boolean,
  ) {
    return (
      <Stack gap={4} mt={2}>
        <FormControl isRequired>
          <FormLabel {...subHeadingStyle} height={"2rem"}>
            Please enter your email
          </FormLabel>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            {...inputStyle}
          />
          <Box minH="1rem">
            <Text
              opacity={isEmailValid === true ? 0 : 1}
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