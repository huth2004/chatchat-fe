import { AuthService } from "./auth.service";
import { apiRequest } from "@/shared/utils/api-client";
import { Response } from "@/shared/core/response";
import * as AuthTypes from "@/features/auth/types/auth.type";
import {
  clearAccessToken,
  setAccessToken,
} from "@/shared/utils/access-token";

function parseCurrentUser(value: unknown): AuthTypes.AuthUser | null {
  if (!value || typeof value !== "object") return null;

  const payload = value as Record<string, unknown>;
  const candidate =
    payload.user ??
    payload.currentUser ??
    payload.profile ??
    value;
  if (!candidate || typeof candidate !== "object") return null;

  const user = candidate as Record<string, unknown>;
  if (
    typeof user.id !== "string" ||
    typeof user.username !== "string" ||
    (user.role !== "admin" && user.role !== "user")
  ) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    avatar: typeof user.avatar === "string" ? user.avatar : null,
    role: user.role,
  };
}

class AuthImplService implements AuthService {
  async getCurrentUser(): Promise<Response<AuthTypes.AuthUser>> {
    const response = await apiRequest<unknown>("/auth/me");
    if (response.status !== "success") {
      return {
        status: response.status,
        message: response.message,
      };
    }

    const user = parseCurrentUser(response.data);
    if (!user) {
      return {
        status: "error",
        message: "Máy chủ không trả về thông tin người dùng hợp lệ",
      };
    }

    return { ...response, data: user };
  }

  register(
    registerUser: AuthTypes.RegisterUser,
  ): Promise<Response<AuthTypes.AuthUser>> {
    return apiRequest<AuthTypes.AuthUser>("/auth/register", {
      method: "POST",
      body: JSON.stringify(registerUser),
    });
  }

  async login(
    loginUser: AuthTypes.LoginUser,
  ): Promise<Response<AuthTypes.AuthUser>> {
    const loginResponse = await apiRequest<AuthTypes.AccessTokenResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(loginUser),
      },
    );

    if (loginResponse.status !== "success") {
      return {
        status: loginResponse.status,
        message: loginResponse.message,
      };
    }

    if (!loginResponse.data?.accessToken) {
      return {
        status: "error",
        message: "Máy chủ không trả về access token",
      };
    }

    setAccessToken(loginResponse.data.accessToken);
    return this.getCurrentUser();
  }

  async logout(): Promise<Response<null>> {
    clearAccessToken();
    return apiRequest<null>("/auth/logout", { method: "POST" });
  }
}

export const authService: AuthService = new AuthImplService();
