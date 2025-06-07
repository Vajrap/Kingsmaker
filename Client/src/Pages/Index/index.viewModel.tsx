import { useState, useEffect, type FormEvent } from "react";
import { LoginView } from "./index.view";
import RegisterDialogue from "./Register/register.viewModel";
import { sendLoginRequest } from "@/Request-Respond/api/auth/login";
import GuestDialogue from "./Guest/guest.viewModel";
import ForgotDialogue from "./ForgotPassword/forgot.viewModel";
import { sessionManager } from "@/singleton/sessionManager";

export default function LoginContainer() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isGuestOpen, setGuestOpen] = useState(false);
  const [isForgotOpen, setForgotOpen] = useState(false);
  const [, setLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      if (sessionManager.isLoggedIn()) {
        const isValid = await sessionManager.validateSession();
        if (isValid) {
          // User has valid session, redirect to lobby
          window.location.href = '/lobby';
          return;
        }
      }
      
      // Set last login username for convenience
      const lastLogin = sessionManager.getLastLogin();
      if (lastLogin) {
        setUsername(lastLogin);
      }
      
      setIsCheckingSession(false);
    };

    checkSession();
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoginMessage("");

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setLoginMessage("Logging in...");
    const response = await sendLoginRequest(username, password);
    setLoading(false);

    if (response.head === "error") {
      setLoginMessage("");
      setError(`${response.body.message}`);
    } else if (response.head === "login") {
      // Success - redirect will happen automatically in the API call
      setLoginMessage("Login successful! Redirecting...");
      setError("");
    }

    console.log(response);
  };

  const handleRegister = () => setRegisterOpen(true);
  const handleForgotPassword = () => setForgotOpen(true);
  const handleGuest = () => { setGuestOpen(true)};

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Checking session...
      </div>
    );
  }

  return (
    <>
      <LoginView
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        error={error}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onForgotPassword={handleForgotPassword}
        loginMessage={loginMessage}
        onGuest={handleGuest}
      />
      <RegisterDialogue
        isOpen={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
      />
      <GuestDialogue
        isOpen={isGuestOpen}
        onClose={() => setGuestOpen(false)}
      />
      <ForgotDialogue
        isOpen={isForgotOpen}
        onClose={() => setForgotOpen(false)}
      />
    </>
  );
}
