import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  backendAuthRequest,
  cookieOptions,
  errorResponse,
  readJson,
  REFRESH_COOKIE,
  ACCESS_COOKIE,
  getSetCookieValue,
} from "@/server/auth/backend";

export async function POST() {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json({ status: "error", message: "Phiên đăng nhập đã hết hạn" }, { status: 401 });
  }

  const response = await backendAuthRequest("/auth/refresh", { refresh_token: refreshToken }, refreshToken);
  const data = await readJson(response);
  if (!response.ok) {
    const result = errorResponse(data, response.status);
    result.cookies.delete(REFRESH_COOKIE);
    return result;
  }

  const payload = (data.data ?? data) as Record<string, unknown>;
  const accessToken =
    payload.access_token ??
    payload.accessToken ??
    getSetCookieValue(response, ACCESS_COOKIE);
  const rotatedRefreshToken =
    payload.refresh_token ??
    payload.refreshToken ??
    getSetCookieValue(response, REFRESH_COOKIE);
  if (typeof accessToken !== "string" || !accessToken) {
    const result = errorResponse({ message: "Máy chủ không trả về access token" }, 502);
    result.cookies.delete(REFRESH_COOKIE);
    return result;
  }

  const result = NextResponse.json({
    status: "success",
    data: { accessToken },
  });
  if (typeof rotatedRefreshToken === "string" && rotatedRefreshToken) {
    result.cookies.set(REFRESH_COOKIE, rotatedRefreshToken, cookieOptions);
  }
  return result;
}
