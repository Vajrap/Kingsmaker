export type LoginInput = {
    username: string;
    password: string;
};
export type AuthInput = {
    token: string;
};
export type GuestInput = {};
export type LoginOutput = {
    sessionId: string;
    userType: "registered" | "guest" | "admin";
    username: string;
    nameAlias: string;
    presenceStatus: "INITIAL" | "IN_LOBBY" | "IN_WAITING_ROOM" | "IN_GAME" | "OFFLINE";
};
export type RegisterInput = {
    username: string;
    email: string;
    password: string;
};
export type RegisterOutput = {
    id: number;
    nameAlias: string;
    username: string;
    email: string;
    type: "registered" | "guest" | "admin";
};
export type LogoutInput = {
    sessionToken: string;
};
export type LogoutOutput = {
    message: string;
};
//# sourceMappingURL=auth.d.ts.map