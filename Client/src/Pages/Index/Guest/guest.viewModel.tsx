import { useState, useEffect } from "react";
import GuestView from "./guest.view";
import { sendGuestLoginRequest } from "@/Request-Respond/api/auth/guest";

function generateRandomName() {
  const prefixes = [
    "Mighty", "Silent", "Crimson", "Azure", "Golden", "Shadow", "Iron", "Swift", "Emerald", "Frost", "Brave", "Lucky", "Clever", "Wild", "Gentle", "Noble", "Grand", "Tiny", "Lone", "Daring"
  ];
  const names = [
    "Peacock", "Wolf", "Tiger", "Dragon", "Lion", "Fox", "Bear", "Falcon", "Serpent", "Hawk", "Otter", "Eagle", "Panther", "Rabbit", "Stag", "Swan", "Badger", "Raven", "Coyote", "Bison"
  ];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const name = names[Math.floor(Math.random() * names.length)];
  const number = Math.floor(10 + Math.random() * 90); // 2 digit
  return `${prefix}${name}${number}`;
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
      // Success - the API will handle redirect to lobby automatically
      setSuccess("Guest login successful! Redirecting...");
      // Close modal after a brief delay
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
    <GuestView
      isOpen={isOpen}
      onClose={handleClose}
      guestName={guestName}
      setGuestName={setGuestName}
      error={error}
      success={success}
      loading={loading}
      onGuest={handleGuest}
    />
  );
}
