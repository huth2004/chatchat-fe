import { cookies } from "next/headers";
import { API_URL, backendUrl, REFRESH_COOKIE } from "@/server/auth/auth-backend";

const PROXY_TIMEOUT_MS = 15000;
const forwardedHeaders = ["accept", "authorization", "content-type"];

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxy(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const incomingUrl = new URL(request.url);
  const backendPath = `/${path.join("/")}${incomingUrl.search}`;
  const headers = new Headers();

  for (const name of forwardedHeaders) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (refreshToken) headers.set("Cookie", `${REFRESH_COOKIE}=${refreshToken}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

  try {
    const response = await fetch(backendUrl(backendPath), {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
      cache: "no-store",
      signal: controller.signal,
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === "AbortError"
        ? "Backend phản hồi quá lâu"
        : `Không thể kết nối backend tại ${API_URL}`;
    return Response.json({ status: "error", message }, { status: 504 });
  } finally {
    clearTimeout(timeout);
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
