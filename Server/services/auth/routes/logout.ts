import { type LogoutInput, type LogoutOutput, type ApiResponse, errorRes, ok } from "@kingsmaker/shared/types/types";
import { prisma } from "@kingsmaker/shared/prisma/prisma";
import { removeConnectionFromSessionManager } from "../lib/sessionServiceClient";

export async function handleLogout({ body }: { body: LogoutInput }): Promise<ApiResponse<LogoutOutput>> {
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

        if (!user.sessionId) {
            return errorRes("No session ID found");
        }

        // Remove connection from SessionManager
        await removeConnectionFromSessionManager(user.sessionId);

        const data: LogoutOutput = {
            message: "Successfully logged out"
        };

        return ok<LogoutOutput>(data);
    } catch (error) {
        console.error('Logout error:', error);
        return errorRes("Failed to logout");
    }
}
