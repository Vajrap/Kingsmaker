import { Player } from "./player";

export type LoginInput = {
    username: string;
    password: string;
};

export type AuthInput = {
    token: string;
};

export type GuestInput = {};

export type LoginOutput = {
    player: Player;
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

export enum ALREADY_LOGIN {
    GUEST = "ALREADY_LOGGED_IN_GUEST",
    REGIST = "ALREADY_LOGGED_IN_REGIST",
}
