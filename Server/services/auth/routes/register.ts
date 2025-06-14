import { errorRes, ok, type ApiResponse, type RegisterBody, type RegisterResponse } from "@shared/types/types";
import { prisma } from "../lib/prisma";
import bcrypt from 'bcrypt';

export async function handleRegister({ body }: { body: RegisterBody }): Promise<ApiResponse<RegisterResponse>> {
    const userNameAvailable = await isUserNameAvailable(body.username)
    if (userNameAvailable) {
        return errorRes("User name is already used.");
    }

    const emailAvailable = await isEmailAvailable(body.email)
    if (emailAvailable) {
        return errorRes("Email is already taken");
    }

    if (!validatePassword(body.password)) {
        return errorRes("Password is invalid");
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    let createdUser = await prisma.user.create({
        data: {
            username: body.username,
            email: body.email,
            password: hashedPassword,
            isConfirmed: false,
            type: "registered"
        }
    })

    sendConfirmationEmail(createdUser);

    return ok<RegisterResponse>(createdUser)
}

function sendConfirmationEmail(user: any) {
    // Implementation of sending confirmation email
}

function validatePassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

async function isUserNameAvailable(username: string): Promise<boolean> {
    const existedUser = await prisma?.user.findUnique({
        where: {
            username: username
        }
    })
    if (existedUser) {
        return false;
    }
    return true;
}

async function isEmailAvailable(email: string): Promise<boolean> {
    const existedEmail = await prisma?.user.findUnique({
        where: {
            email: email
        }
    })
    if (existedEmail) {
        return false;
    }
    return true;
}
