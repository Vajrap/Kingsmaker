// Login Model - Data layer for login functionality

export interface LoginCredentials {
    username: string
    password: string
}

export interface LoginValidationResult {
    isValid: boolean
    errors: string[]
}

export class LoginModel {
    validateCredentials(credentials: LoginCredentials): LoginValidationResult {
        const errors: string[] = []

        if (!credentials.username.trim()) {
            errors.push('Username is required')
        }

        if (credentials.username.length < 3) {
            errors.push('Username must be at least 3 characters long')
        }

        if (!credentials.password) {
            errors.push('Password is required')
        }

        if (credentials.password.length < 6) {
            errors.push('Password must be at least 6 characters long')
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    sanitizeUsername(username: string): string {
        return username.trim().toLowerCase()
    }
}

export const loginModel = new LoginModel()
