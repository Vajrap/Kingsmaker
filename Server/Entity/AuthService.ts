import { PrismaClient, type User as PrismaUser } from '@prisma/client';
import { User } from './User';
import { SessionModel } from './Session';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export class AuthService {
  // Register a new user
  static async register(email: string, username: string, password: string): Promise<User | null> {
    try {
      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashed,
          isConfirmed: false,
          achievements: [],
        },
      });
      return AuthService.toEntity(user);
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  }

  // Login a registered user
  static async login(username: string, password: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.password) return null;
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;
    return AuthService.toEntity(user);
  }

  // Login or create a guest user
  static async guestLogin(guestName: string): Promise<User> {
    let user = await prisma.user.findUnique({ where: { username: guestName } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: guestName,
          email: null,
          password: null,
          isConfirmed: false,
          achievements: [],
        },
      });
    }
    return AuthService.toEntity(user);
  }

  // Create a session for a user, should
  static async createSession(userId: number, durationMs: number = 24 * 60 * 60 * 1000): Promise<SessionModel> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMs);
    const session = await prisma.session.create({
      data: {
        userID: userId,
        expiresAt,
      },
    });
    return new SessionModel(session.id, session.userID, session.expiresAt, session.createdAt);
  }

  // Validate a session token
  static async validateSession(sessionId: string): Promise<User | null> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) {
      // Clean up expired session
      if (session) {
        await prisma.session.delete({ where: { id: sessionId } });
      }
      return null;
    }
    return AuthService.toEntity(session.user);
  }

  // Logout - delete session
  static async logout(sessionId: string): Promise<void> {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {
      // Session might not exist, ignore error
    });
  }

  // Convert Prisma user to Entity user
  static toEntity(user: PrismaUser): User {
    // Handle JSON achievements field
    let achievements: string[] = [];
    if (user.achievements) {
      try {
        achievements = Array.isArray(user.achievements)
          ? user.achievements as string[]
          : JSON.parse(user.achievements as string);
      } catch {
        achievements = [];
      }
    }

    return new User(
      String(user.id),
      user.username,
      user.email ? 'registered' : 'guest',
      user.email,
      user.password,
      user.nameAlias ?? '',
      user.isConfirmed,
      user.highestScore,
      user.totalGames,
      user.totalWins,
      user.totalLosses,
      user.totalTies,
      achievements,
      [], // unlockables, to be populated if needed
      [], // customizations, to be populated if needed
    );
  }
}
