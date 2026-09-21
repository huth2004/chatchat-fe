import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  backendAuthRequest,
  REFRESH_COOKIE,
} from "@/server/auth/backend";

export async function POST() {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    await backendAuthRequest("/auth/logout", { refresh_token: refreshToken }, refreshToken).catch(() => undefined);
  }

  const result = NextResponse.json({ status: "success", data: null });
  result.cookies.delete(REFRESH_COOKIE);
  result.cookies.delete(ACCESS_COOKIE);
  return result;
}
