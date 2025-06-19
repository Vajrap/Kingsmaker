import { type AuthBody, type ApiResponse, type LoginResponse, errorRes, ok } from "@kingsmaker/shared/types/types";
import { prisma } from "@shared/prisma/prisma";
import { checkConnectionInSessionManager, addConnectionToSessionManager } from "../lib/sessionServiceClient";

export async function handleAutoLogin({ body }: { body: AuthBody }): Promise<ApiResponse<LoginResponse>> {
    try {
        // Find user by session token (sessionId)
        const user = await prisma.user.findFirst({
            where: {
                sessionId: body.token
            }
        });

        if (!user) {
            return errorRes("Invalid session token");
        }

        // Check if session is expired
        if (!user.sessionExpireAt || new Date() > user.sessionExpireAt) {
            return errorRes("Session has expired");
        }

        // Check if user is already connected in sessionManager
        const existingConnection = await checkConnectionInSessionManager(user.id);
        if (!existingConnection) {
            // User not connected, add them to sessionManager
            const sessionManagerResponse = await addConnectionToSessionManager(user);
            if (!sessionManagerResponse) {
                console.warn("Failed to add connection to SessionManager during autoLogin");
            }
        }

        const data: LoginResponse = {
            sessionId: user.sessionId,
            userType: user.type,
            username: user.username,
            nameAlias: user.nameAlias,
        };

        return ok(data);
    } catch (error) {
        console.error("AutoLogin error:", error);
        return errorRes("Auto login failed");
    }
}
