"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, EyeOff } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (username === "admin" && password === "admin") {
      // 设置 Admin 登录 cookie（HttpOnly 更安全，但此处简化处理）
      document.cookie = `admin_session=admin-${Date.now()}; path=/; max-age=${7 * 24 * 60 * 60}`
      router.push("/admin")
      router.refresh()
    } else {
      setError("用户名或密码错误")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-xl bg-slate-900 text-white">
              <Shield size={28} />
            </div>
          </div>
          <CardTitle className="text-xl">管理员登录</CardTitle>
          <CardDescription>请输入管理员账号密码</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="管理员账号"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2 relative">
              <Input
                type={showPw ? "text" : "password"}
                placeholder="密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "验证中..." : "登录"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <a href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              ← 返回网站
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
