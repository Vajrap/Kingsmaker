type SuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

type ErrorResponse = {
  success: false;
  message: string;
};

export function errorRes(message: string): ErrorResponse {
  return {
    success: false,
    message
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export function ok<T>(data: T, message?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    message
  };
}

export type LoginBody = {
    username: string;
    password: string;
}

export type LoginResponse = {
  id: number;
  nameAlias: string;
  username: string;
  email: string;
  type: 'registered' | 'guest' | 'admin';
  sessionToken: string;
};

export type RegisterBody = {
    username: string;
    email: string;
    password: string;
}

export type RegisterResponse = {
  id: number;
  nameAlias: string;
  username: string;
  email: string;
  type: 'registered' | 'guest' | 'admin';
};

export type LogoutBody = {
    sessionToken: string;
}

export type LogoutResponse = {
  message: string;
};

export type AutoLoginBody = {
    sessionToken: string;
}
