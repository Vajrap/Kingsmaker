export type LoginBody = {
    username: string;
    password: string;
};
export type AuthBody = {
    token: string;
};
export type GuestBody = {};
export type LoginResponse = {
    sessionId: string;
    userType: "registered" | "guest" | "admin";
    username: string;
    nameAlias: string;
    presenceStatus: "INITIAL" | "IN_LOBBY" | "IN_WAITING_ROOM" | "IN_GAME" | "OFFLINE";
};
export type RegisterBody = {
    username: string;
    email: string;
    password: string;
};
export type RegisterResponse = {
    id: number;
    nameAlias: string;
    username: string;
    email: string;
    type: "registered" | "guest" | "admin";
};
export type LogoutBody = {
    sessionToken: string;
};
export type LogoutResponse = {
    message: string;
};
//# sourceMappingURL=auth.d.ts.map