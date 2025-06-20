import { type LogoutBody, type ApiResponse, errorRes, ok } from "../shared/types/types";
import { prisma } from "../shared/prisma/prisma";
import { removeConnectionFromSessionManager } from "../lib/sessionServiceClient";

export async function handleLogout({ body }: { body: LogoutBody }): Promise<ApiResponse<string>> {
    try {
        // Clear the user's session in the database
        const user = await prisma.user.update({
            where: { sessionId: body.sessionToken },
            data: {
                sessionId: "",
                sessionExpireAt: new Date()
            }
        });

        if (!user) {
            return errorRes("Session not found");
        }

        // Remove connection from SessionManager
        const removed = await removeConnectionFromSessionManager(user.id);
        if (!removed) {
            console.warn("Failed to remove connection from SessionManager during logout");
        }

        return ok<string>("Successfully logged out");
    } catch (error) {
        console.error('Logout error:', error);
        return errorRes("Failed to logout");
    }
}
