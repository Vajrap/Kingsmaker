import { type LogoutBody, type ApiResponse, type LogoutResponse, ok, errorRes } from "@kingsmaker/shared/types/types";
import { prisma } from "@shared/prisma/prisma";
import { removeConnectionFromSessionManager } from "../lib/sessionServiceClient";

export async function handleLogout({ body }: { body: LogoutBody }): Promise<ApiResponse<LogoutResponse>> {
    try {
        // Find user by session token (sessionId)
        const user = await prisma.user.findFirst({
            where: {
                sessionId: body.sessionToken
            }
        });

        if (!user) {
            return errorRes("Invalid session token");
        }

        // Remove connection from sessionManager
        const sessionManagerSuccess = await removeConnectionFromSessionManager(user.id);
        if (!sessionManagerSuccess) {
            console.warn("Failed to remove connection from SessionManager during logout");
        }

        // Clear session from database
        await prisma.user.update({
            where: { id: user.id },
            data: { 
                sessionId: undefined,
                sessionExpireAt: undefined
            }
        });

        return ok({message: "Logged out successfully"});
    } catch (error) {
        console.error("Logout error:", error);
        return errorRes("Failed to logout");
    }
}
