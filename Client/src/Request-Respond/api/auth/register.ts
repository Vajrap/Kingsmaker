import type { ClientMessage, ServerError, ServerMessage } from "../../messages";
import { sendRestRequest } from "@/Request-Respond/ws/sendRequest";

export async function sendRegisterRequest(
  email: string,
  username: string,
  password: string,
): Promise<ServerMessage | ServerError> {
  const body: ClientMessage = {
    head: "register",
    body: {
      email,
      username,
      password,
    },
  };

  const response = await sendRestRequest(
    "http://localhost:3000/api",
    "POST",
    body,
  );

  return response;
}
