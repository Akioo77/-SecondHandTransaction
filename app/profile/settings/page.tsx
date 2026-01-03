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

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [nickname, setNickname] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      setNickname(user.nickname)
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    alert("个人信息更新功能待实现")
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
            <CardTitle>个人信息</CardTitle>
            <CardDescription>更新您的账号信息</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input id="username" type="text" value={user.username} disabled />
                <p className="text-xs text-muted-foreground">用户名不可修改</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">昵称</Label>
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="请输入昵称"
                />
              </div>

              <Button type="submit">保存更改</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>修改密码</CardTitle>
            <CardDescription>定期更新密码以保护账号安全</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">当前密码</Label>
                <Input id="current-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">新密码</Label>
                <Input id="new-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">确认新密码</Label>
                <Input id="confirm-password" type="password" />
              </div>

              <Button type="submit">更新密码</Button>
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
              <Button variant="destructive" onClick={() => alert("删除账号功能待实现")}>
                删除账号
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
