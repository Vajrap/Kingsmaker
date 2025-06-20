import { type RegisterBody, type RegisterResponse, type ApiResponse, errorRes, ok } from "../shared/types/types";
import { prisma } from "../shared/prisma/prisma";
import { generateUniqueNameAlias } from "../logic/nameAlias";

export async function handleRegister({ body }: { body: RegisterBody }): Promise<ApiResponse<RegisterResponse>> {
    try {
        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
            where: { username: body.username }
        });

        if (existingUser) {
            return errorRes("Username already exists");
        }

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({
            where: { email: body.email }
        });

        if (existingEmail) {
            return errorRes("Email already exists");
        }

        // Generate unique name alias
        const nameAlias = await generateUniqueNameAlias();

        // Hash password
        const hashedPassword = await Bun.password.hash(body.password);

        // Create user
        const user = await prisma.user.create({
            data: {
                username: body.username,
                email: body.email,
                password: hashedPassword,
                nameAlias: nameAlias,
                type: "registered",
                isConfirmed: false,
                sessionId: "",
                sessionExpireAt: new Date()
            }
        });

        const data: RegisterResponse = {
            id: user.id,
            nameAlias: user.nameAlias,
            username: user.username,
            email: user.email,
            type: "registered"
        };

        return ok<RegisterResponse>(data);
    } catch (error) {
        console.error('Registration error:', error);
        return errorRes("Failed to register user");
    }
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
