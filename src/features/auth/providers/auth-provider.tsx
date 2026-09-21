"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { authService } from "@/features/auth";
import type { AuthUser, LoginUser } from "@/features/auth/types/auth.type";
import { refreshAccessToken } from "@/shared/utils/api-client";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: LoginUser) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  

  useEffect(() => {
const restoreSession = async () => {
    try {
      if (!(await refreshAccessToken())) return;

      const currentUser = await authService.getCurrentUser();
      if (currentUser.status === "success" && currentUser.data) {
        setUser(currentUser.data);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

    void restoreSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const isAuthPage = pathname.startsWith("/auth/");
    if (!user && !isAuthPage) router.replace("/auth/login");
    if (user && isAuthPage) router.replace("/");
  }, [isLoading, pathname, router, user]);

  const login = useCallback(async (credentials: LoginUser) => {
    const result = await authService.login(credentials);
    if (result.status !== "success") {
      throw new Error(result.message ?? "Đăng nhập thất bại");
    }

    if (!result.data) {
      throw new Error("Không thể tải thông tin tài khoản");
    }
    setUser(result.data);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    router.replace("/auth/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [isLoading, login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải được dùng bên trong AuthProvider");
  return context;
}
