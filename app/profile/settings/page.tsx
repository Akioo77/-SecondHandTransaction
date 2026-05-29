"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { authApi } from "@/lib/api"

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [pwSaving, setPwSaving] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [delMsg, setDelMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMsg(null)
    if (newPassword.length < 4) {
      setPwMsg({ type: "error", text: "新密码至少4位" })
      return
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "error", text: "两次输入的新密码不一致" })
      return
    }
    setPwSaving(true)
    try {
      const res = await authApi.changePassword(oldPassword, newPassword)
      if (!res.error) {
        setPwMsg({ type: "success", text: "密码修改成功！" })
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setPwMsg({ type: "error", text: res.error || "旧密码错误，修改失败" })
      }
    } catch {
      setPwMsg({ type: "error", text: "网络错误，请重试" })
    } finally {
      setPwSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("确定要删除账号吗？此操作不可逆！")) return
    setDeleting(true)
    setDelMsg(null)
    try {
      const res = await authApi.deleteAccount()
      if (!res.error) {
        setDelMsg({ type: "success", text: "账号已删除，正在跳转..." })
        setTimeout(() => {
          logout()
          router.push("/")
        }, 1500)
      } else {
        setDelMsg({ type: "error", text: res.error || "删除失败，请重试" })
      }
    } catch {
      setDelMsg({ type: "error", text: "网络错误，请重试" })
    } finally {
      setDeleting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (authLoading || !user) {
    return <div className="container mx-auto px-4 py-8">加载中...</div>
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/profile">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回个人中心
        </Link>
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>账号信息</CardTitle>
            <CardDescription>您的账号基本信息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>用户名</Label>
              <Input value={user.username} disabled />
              <p className="text-xs text-muted-foreground">用户名不可修改</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>修改密码</CardTitle>
            <CardDescription>定期更新密码以保护账号安全</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">当前密码</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  placeholder="请输入当前密码"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">新密码</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="请输入新密码（至少4位）"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">确认新密码</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                />
              </div>

              {pwMsg && (
                <p className={`text-sm ${pwMsg.type === "success" ? "text-green-600" : "text-red-500"}`}>
                  {pwMsg.text}
                </p>
              )}

              <Button type="submit" disabled={pwSaving}>
                {pwSaving ? "验证中..." : "更新密码"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">危险操作</CardTitle>
            <CardDescription>这些操作不可逆，请谨慎操作</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">退出登录</h4>
                <p className="text-sm text-muted-foreground">退出当前账号</p>
              </div>
              <Button variant="destructive" onClick={handleLogout}>
                退出登录
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">删除账号</h4>
                <p className="text-sm text-muted-foreground">永久删除账号和所有数据</p>
              </div>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? "删除中..." : "删除账号"}
              </Button>
            </div>
            {delMsg && (
              <p className={`text-sm ${delMsg.type === "success" ? "text-green-600" : "text-red-500"}`}>
                {delMsg.text}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}