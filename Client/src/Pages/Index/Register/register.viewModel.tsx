import { useState } from "react";
import RegisterView from "./register.view";
import { sendRegisterRequest } from "@/Request-Respond/api/auth/register";

export default function RegisterModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await sendRegisterRequest(email, username, password);
    setLoading(false);

    if (result.head === "error") {
      setError(result.body.message);
      return;
    }

    if (result.head != "register") {
      console.error(`Unexpected result`, result);
      return;
    }

    if (result.body.status === true) {
      setSuccess("Registration successful!");
    } else {
      setError("Registration failed.");
    }
  };

  const handleClose = () => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setLoading(false);
    onClose();
  };

  return (
    <RegisterView
      isOpen={isOpen}
      onClose={handleClose}
      email={email}
      setEmail={setEmail}
      username={username}
      setUsername={setUsername}
      password={password}
      setPassword={setPassword}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      error={error}
      success={success}
      loading={loading}
      onRegister={handleRegister}
      acceptTerms={acceptTerms}
      setAcceptTerms={setAcceptTerms}
    />
  );
}
