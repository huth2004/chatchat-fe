import { NextResponse } from "next/server";
import {
  backendAuthRequest,
  cookieOptions,
  errorResponse,
  readJson,
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  getSetCookieValue,
} from "@/server/auth/auth-backend";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body !== "object" ||
    typeof body.username !== "string" ||
    typeof body.password !== "string"
  ) {
    return errorResponse({ message: "Vui lòng nhập username và mật khẩu" }, 400);
  }

  try {
    const response = await backendAuthRequest("/auth/login", body);
    const data = await readJson(response);

    if (!response.ok) return errorResponse(data, response.status);

    const payload = (data.data ?? data) as Record<string, unknown>;
    const refreshToken =
      payload.refresh_token ??
      payload.refreshToken ??
      getSetCookieValue(response, REFRESH_COOKIE);
    const accessToken =
      payload.access_token ??
      payload.accessToken ??
      getSetCookieValue(response, ACCESS_COOKIE);

    if (typeof accessToken !== "string" || !accessToken) {
      return errorResponse({ message: "Máy chủ không trả về access token" }, 502);
    }

    const result = NextResponse.json({
      status: "success",
      data: { accessToken },
    });
    if (typeof refreshToken === "string" && refreshToken) {
      result.cookies.set(REFRESH_COOKIE, refreshToken, cookieOptions);
    }
    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể kết nối máy chủ";
    return errorResponse({ message }, 504);
  }
}
