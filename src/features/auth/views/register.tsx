"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authService } from "@/features/auth";
import { Button, Card, Input } from "@/shared/components/ui";
import { useTheme } from "@/shared/providers/theme-provider";

export default function RegisterView() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  useTheme();

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== repeatPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    if (!acceptTerms) {
      setError("Vui lòng đồng ý với điều khoản sử dụng.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.register({
        username: username.trim(),
        password,
        acceptTerms,
      });

      if (result.status !== "success") {
        setError(result.message ?? "Không thể tạo tài khoản.");
        return;
      }

      router.push("/auth/login?registered=true");
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : "Không thể kết nối đến máy chủ.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Card className="w-full max-w-md p-8">
        <h1 className="mb-8 text-center text-2xl font-bold tracking-tight">
          Đăng ký
        </h1>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-medium">
              Tài khoản
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Nhập username..."
              autoComplete="username"
              minLength={3}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Mật khẩu
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nhập mật khẩu..."
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div>
            <label
              htmlFor="repeatPassword"
              className="mb-2 block text-sm font-medium"
            >
              Nhập lại mật khẩu
            </label>
            <Input
              id="repeatPassword"
              type="password"
              value={repeatPassword}
              onChange={(event) => setRepeatPassword(event.target.value)}
              placeholder="Nhập lại mật khẩu..."
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <label className="flex items-start gap-3 text-sm text-slate-500 dark:text-slate-400">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(event) => setAcceptTerms(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-indigo-600"
            />
            <span>
              Tôi đồng ý với{" "}
              <span className="font-medium text-indigo-600">điều khoản sử dụng</span>
              .
            </span>
          </label>

          <Button type="submit" disabled={isLoading} className="h-12 w-full">
            {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Đã có tài khoản?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Đăng nhập
          </Link>
        </p>
      </Card>
    </main>
  );
}
