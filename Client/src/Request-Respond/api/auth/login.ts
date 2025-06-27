import { sendRestRequest } from "@/Request-Respond/ws/sendRequest";
import { sessionManager } from "@/singleton/sessionManager";
import type {
    ApiResponse,
    LoginBody,
    LoginResponse,
} from "@shared/types/types";

type WrappedLoginResponse = { data: LoginResponse };

export async function sendLoginRequest(
    username: string,
    password: string,
): Promise<ApiResponse<WrappedLoginResponse>> {
    const body: LoginBody = {
        username,
        password,
    };

    console.log(body.password);

    const response = (await sendRestRequest(
        "http://localhost:7001/login",
        "POST",
        body,
    )) as ApiResponse<WrappedLoginResponse>;

    if (response.success) {
        // Successful login - save session and redirect
        console.log(`RESPONSE`);
        console.log(response.data.data.sessionId);
        sessionManager.saveSession({
            sessionId: response.data.data.sessionId,
            userType: response.data.data.userType as "registered" | "guest",
            username: response.data.data.username,
            loginTime: Date.now().toString(),
        });

        // Redirect to lobby
        window.location.href = "/lobby";
    }

    return response;
}
