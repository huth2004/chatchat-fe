// Type for UI
export type UserRole = "admin" | "user";

export type AuthUser = {
  id: string;
  username: string;
  avatar: string | null;
  role: UserRole;
};

export type RegisterUser = {
  username: string;
  password: string;
  acceptTerms: boolean;
};

export type LoginUser = {
  username: string;
  password: string;
};

export type AccessTokenResponse = {
  accessToken: string;
};

// Type for API
export type UserRoleDTO = "admin" | "user";

export type AuthUserDTO = {
  id: string;
  username: string;
  avatar: string | null;
  role: UserRoleDTO;
};

export type RegisterUserDTO = {
  username: string;
  password: string;
  acceptTerms: boolean;
};

export type LoginUserDTO = {
  username: string;
  password: string;
};
