"use client"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, Input, Button } from "@/shared/components/ui";
import { useAuth } from "@/features/auth/providers/auth-provider";
import { useTheme } from "@/shared/providers/theme-provider";

export default function LoginView() {
  const router = useRouter()
  const { login } = useAuth();
  useTheme();
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const username = formData.get("username")
    const password = formData.get("password")

   
    try {
      await login({
        username: String(username ?? ""),
        password: String(password ?? ""),
      });
      router.replace("/");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Đăng nhập thất bại");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Card>
        <form onSubmit={handleSubmit} className="w-96 rounded-lg bg-white p-8 shadow-md dark:bg-slate-900">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
        
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="mb-2 block text-sm">Tài khoản</label>
          <Input type="text" name="username" placeholder="Nhập username..." required className="w-full p-2 border rounded" />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm">Mật khẩu</label>
          <Input type="password" name="password" placeholder="Nhập mật khẩu..." required className="w-full p-2 border rounded" />
        </div>

        <Button type="submit" className="w-full"
          disabled={isLoading}>{isLoading ? "Đang xử lý..." : "Đăng nhập"}</Button>
        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Chưa có tài khoản?{" "}
          <Link href="/auth/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Đăng ký ngay
          </Link>
        </p>
      </form>
      </Card>
    </div>
  )
}