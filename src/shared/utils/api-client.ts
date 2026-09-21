import type { Response } from "@/shared/core/response";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "./access-token";

const REQUEST_TIMEOUT_MS = 10000;
let refreshPromise: Promise<boolean> | null = null;

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export function refreshAccessToken(): Promise<boolean> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then(async (refreshResponse) => {
        if (!refreshResponse.ok) {
          clearAccessToken();
          return false;
        }

        const refreshBody = (await refreshResponse.json().catch(() => ({}))) as
          Partial<Response<{ accessToken: string }>>;
        const refreshedToken = refreshBody.data?.accessToken;
        if (!refreshedToken) {
          clearAccessToken();
          return false;
        }

        setAccessToken(refreshedToken);
        return true;
      })
      .catch(() => {
        return false;
      })
      .finally(() => {
        refreshPromise = null;
      });

    return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<Response<T>> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const isAuthProxyRequest = ["/auth/login", "/auth/refresh", "/auth/logout"].includes(path);
  const requestUrl = isAuthProxyRequest ? `/api${path}` : `/api/proxy${path}`;
  const fetchRequest = async (url: string) => {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    return fetch(url, {
      ...options,
      headers,
      credentials: "include",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));
  };

  let response: globalThis.Response;
  try {
    response = await fetchRequest(requestUrl);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Máy chủ phản hồi quá lâu. Vui lòng thử lại.", 504);
    }
    throw new ApiError("Không thể kết nối đến máy chủ", 0);
  }

  if (response.status === 401 && !isAuthProxyRequest) {
    if (await refreshAccessToken()) response = await fetchRequest(requestUrl);
  }

  const body = (await response.json().catch(() => ({}))) as Partial<Response<T>>;
  if (!response.ok) {
    throw new ApiError(body.message ?? "Yêu cầu không thành công", response.status);
  }

  return {
    status: body.status ?? "success",
    message: body.message,
    data: body.data,
    metadata: body.metadata,
  };
}
