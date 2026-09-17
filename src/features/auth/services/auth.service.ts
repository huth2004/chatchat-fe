import * as AuthTypes from "@/shared/types/auth.type";

export interface AuthService {
  register(registerUser: AuthTypes.RegisterUser): Promise<AuthTypes.AuthUser>;
  login(loginUser: AuthTypes.LoginUser): Promise<AuthTypes.AuthUser>;
  logout(): Promise<void>;
}
