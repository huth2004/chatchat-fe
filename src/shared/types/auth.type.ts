// Type for UI
export type UserRole = "admin" | "user";

export type AuthUser = {
  id: string;
  username: string;
  avatar?: string;
  role: UserRole;
  token: string;
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

// Type for API
export type UserRoleDTO = "admin" | "user";

export type AuthUserDTO = {
  id: string;
  username: string;
  avatar?: string;
  role: UserRoleDTO;
  token: string;
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
