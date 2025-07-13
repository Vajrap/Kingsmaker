import { sendRestRequest } from "@/Request-Respond/sendRequest";
import { sessionManager } from "@/singleton/sessionManager";
import type {
    ApiResponse,
    LoginBody,
    LoginResponse,
} from "@shared/types/types";

export async function sendLoginRequest(
    username: string,
    password: string,
): Promise<ApiResponse<LoginResponse>> {
    const body: LoginBody = {
        username,
        password,
    };

    console.log(body.password);

    const response = (await sendRestRequest(
        "http://localhost:7001/login",
        "POST",
        body,
    )) as ApiResponse<LoginResponse>;

    if (response.success) {
        // Successful login - save session and redirect
        console.log(`RESPONSE`);
        console.log(response.data);
        sessionManager.saveSession({
            sessionId: response.data.sessionId,
            userType: response.data.userType as "registered" | "guest",
            username: response.data.username,
            loginTime: Date.now().toString(),
            presenceStatus: response.data.presenceStatus || "INITIAL",
        });

        // Let the parent component handle navigation
        // window.location.href = "/lobby";
    }

    return response;
}
