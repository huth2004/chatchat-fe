import { NextResponse } from "next/server";

export const API_URL = (
  process.env.BACKEND_API_URL ??
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001"
).replace(/\/+$/, "");
export const REFRESH_COOKIE = "refresh_token";
export const ACCESS_COOKIE = "access_token";
export const AUTH_REQUEST_TIMEOUT_MS = 10000;

export function backendUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const apiPath = normalizedPath.startsWith("/api/")
    ? normalizedPath
    : `/api${normalizedPath}`;
  return `${API_URL}${apiPath}`;
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export const accessCookieOptions = {
  ...cookieOptions,
  maxAge: 60 * 15,
};

export async function backendAuthRequest(
  path: string,
  body?: unknown,
  refreshToken?: string,
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (refreshToken) headers.set("Cookie", `${REFRESH_COOKIE}=${refreshToken}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(backendUrl(path), {
      method: "POST",
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Máy chủ phản hồi quá lâu. Vui lòng thử lại.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function readJson(response: Response) {
  return (await response.json().catch(() => ({}))) as Record<string, unknown>;
}

export function errorResponse(body: Record<string, unknown>, status: number) {
  return NextResponse.json(
    { status: "error", message: body.message ?? "Yêu cầu xác thực thất bại" },
    { status },
  );
}

export function getSetCookieValue(response: Response, name: string) {
  const cookies = response.headers.getSetCookie?.() ?? [];
  const prefix = `${name}=`;
  const header = cookies.find((cookie) => cookie.startsWith(prefix));
  return header?.slice(prefix.length).split(";")[0] || null;
}
