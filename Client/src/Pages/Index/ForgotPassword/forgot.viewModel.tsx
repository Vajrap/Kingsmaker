import { useState, useEffect } from "react";
import ForgotView from "./forgot.view";
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

    if (result.head != "forgot") {
      console.error(`Unexpected result`, result);
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
    <ForgotView
      isOpen={isOpen}
      onClose={handleClose}
      email={email}
      setEmail={setEmail}
      error={error}
      success={success}
      loading={loading}
      onForgot={handleForgot}
      isEmailValid={isEmailValid}
    />
  );
}
