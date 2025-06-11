import type { ClientMessage, ServerError, ServerMessage } from "../../messages";
import { sendRestRequest } from "@/Request-Respond/ws/sendRequest";

export async function sendForgotRequest(
  email: string,
): Promise<ServerMessage | ServerError> {
  const body: ClientMessage = {
    head: "forgot",
    body: {
      email,
    },
  };

  const response = await sendRestRequest(
    "http://localhost:3000/api",
    "POST",
    body,
  );

  return response;
}
