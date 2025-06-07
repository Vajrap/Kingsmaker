const generateAndSave = () => {
  const id = crypto.randomUUID();
  localStorage.setItem("kingsmaker-session-id", id);
  return id;
};

export const sessionId =
  localStorage.getItem("kingsmaker-session-id") ?? generateAndSave();
