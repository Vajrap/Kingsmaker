import {
    type RegisterInput,
    type RegisterOutput,
    type ApiResponse,
    errorRes,
    ok,
    prisma,
} from "@kingsmaker/shared";
import {
    uniqueNamesGenerator,
    adjectives,
    colors,
    animals,
} from "unique-names-generator";

export async function handleRegister({
    body,
}: {
    body: RegisterInput;
}): Promise<ApiResponse<RegisterOutput>> {
    try {
        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
            where: { username: body.username },
        });

        if (existingUser) {
            return errorRes("ERROR", "Username already exists");
        }

        if (!validatePassword(body.password)) {
            return errorRes("ERROR", "Invalid password");
        }

        if (!isUserNameAvailable(body.username)) {
            return errorRes("ERROR", "Username already exists");
        }

        if (!isEmailAvailable(body.email)) {
            return errorRes("ERROR", "Email already exists");
        }

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({
            where: { email: body.email },
        });

        if (existingEmail) {
            return errorRes("ERROR", "Email already exists");
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
                sessionExpireAt: new Date(),
                portrait: "",
                skin: "",
                might: 2,
                intelligence: 2,
                dexterity: 2,
            },
        });

        const data: RegisterOutput = {
            id: user.id,
            nameAlias: user.nameAlias,
            username: user.username,
            email: user.email,
            type: "registered",
        };

        // Send confirmation email
        sendConfirmationEmail(user);

        return ok<RegisterOutput>(data);
    } catch (error) {
        console.error("Registration error:", error);
        return errorRes("ERROR", "Failed to register user");
    }
}

function sendConfirmationEmail(user: any) {
    // Implementation of sending confirmation email
}

function validatePassword(password: string): boolean {
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

async function isUserNameAvailable(username: string): Promise<boolean> {
    const existedUser = await prisma?.user.findUnique({
        where: {
            username: username,
        },
    });
    if (existedUser) {
        return false;
    }
    return true;
}

async function isEmailAvailable(email: string): Promise<boolean> {
    const existedEmail = await prisma?.user.findUnique({
        where: {
            email: email,
        },
    });
    if (existedEmail) {
        return false;
    }
    return true;
}

export async function generateUniqueNameAlias(): Promise<string> {
    const maxRetries = 5;
    for (let i = 0; i < maxRetries; i++) {
        const nameAlias = uniqueNamesGenerator({
            dictionaries: [adjectives, colors, animals],
            separator: "-",
            length: 3,
        });

        // Check if this name alias already exists
        const exists = await prisma.user.findUnique({ where: { nameAlias } });
        if (!exists) return nameAlias;
    }

    // If we can't generate a unique name after retries, append a timestamp
    const fallbackName = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: "-",
        length: 2,
    });
    return `${fallbackName}-${Date.now()}`;
}
