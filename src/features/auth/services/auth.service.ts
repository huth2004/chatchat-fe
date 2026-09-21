import { Response } from "@/shared/core/response";
import * as AuthTypes from "@/features/auth/types/auth.type";

export interface AuthService {
  getCurrentUser(): Promise<Response<AuthTypes.AuthUser>>;
  register(
    registerUser: AuthTypes.RegisterUser,
  ): Promise<Response<AuthTypes.AuthUser>>;
  login(loginUser: AuthTypes.LoginUser): Promise<Response<AuthTypes.AuthUser>>;
  logout(): Promise<Response<null>>;
}
