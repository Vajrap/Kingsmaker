import { type ApiResponse, type LoginResponse, type LoginBody, errorRes, ok } from "@shared/types/types";
import { prisma } from "../lib/prisma";

export async function handleLogin({ body }: {body: LoginBody}): Promise<ApiResponse<LoginResponse>> {
    const user = await findUser(body.username);
    if (!user) {
        return errorRes("User not found");
    };

    const validate = await validatePassword(user, body.password);
    if (!validate) {
        return errorRes("Invalid password");
    };

    const now = new Date();
    const sessionToken = crypto.randomUUID();

    await prisma.session.create({
        data: {
            id: sessionToken,
            userID: user.id,
            expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30),
            createdAt: now
        }
    });

    const data = {
        id: user.id,
        nameAlias: user.nameAlias,
        username: user.username,
        email: user.email,
        type: user.type,
        sessionToken
    };

    return ok(data)
}

async function findUser(username: string): Promise<any | null> {
    return prisma.user.findUnique({
        where: {
            username: username
        }
    });
}

async function validatePassword(user: any, password: string): Promise<boolean> {
    let result = await Bun.password.verify(password, user.password);
    return result;
}
