import type { User } from "@prisma/client";

export class SessionModel {
  id: string;
  userId: number;
  expiresAt: Date;
  createdAt: Date;
  user?: User;

  constructor(id: string, userId: number, expiresAt: Date, createdAt: Date = new Date(), user?: User) {
    this.id = id;
    this.userId = userId;
    this.expiresAt = expiresAt;
    this.createdAt = createdAt;
    this.user = user;
  }

  static create(userId: number, durationMs: number): SessionModel {
    const id = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMs);
    return new SessionModel(id, userId, expiresAt, now);
  }
}
