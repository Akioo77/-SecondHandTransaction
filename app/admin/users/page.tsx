"use client"

import React, { useEffect, useState } from "react"
import { adminApi } from "@/lib/api"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pwDialog, setPwDialog] = useState<{ id: number; username: string } | null>(null)
  const [pwInput, setPwInput] = useState("")
  const [pwSaving, setPwSaving] = useState(false)

  const load = () => adminApi.getUsers().then(r => { if (r.data) setUsers(r.data) }).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const toggleStatus = async (id: number, enabled: boolean) => {
    await adminApi.updateUserStatus(id, enabled)
    load()
  }

  const changePassword = async () => {
    if (!pwDialog || pwInput.length < 4) return
    setPwSaving(true)
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
      const res = await fetch(`${apiBase}/api/admin/users/${pwDialog.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: pwInput }),
      })
      const data = await res.json()
      if (data.code === 0) {
        setPwDialog(null)
        setPwInput("")
      } else {
        alert(data.message || "修改失败")
      }
    } catch {
      alert("网络错误，请重试")
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">用户管理</h2>
        <p className="text-slate-500 text-sm mt-1">管理平台所有用户账号</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500 border-b">
                <th className="px-6 py-3 font-medium">用户名</th>
                <th className="px-6 py-3 font-medium">注册时间</th>
                <th className="px-6 py-3 font-medium">登录地区</th>
                <th className="px-6 py-3 font-medium text-right">发布商品</th>
                <th className="px-6 py-3 font-medium text-right">交易次数</th>
                <th className="px-6 py-3 font-medium text-center">状态</th>
                <th className="px-6 py-3 font-medium text-center">操作</th>
                <th className="px-6 py-3 font-medium text-center">详情</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-6 py-3.5 font-medium text-slate-800">
                    {u.username}
                    <span className="ml-2 text-xs text-slate-400">#ID{u.id}</span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("zh-CN") : "-"}
                  </td>
                  <td className="px-6 py-3.5 text-slate-700 text-sm">
                    {u.lastLoginProvince
                      ? <span>{u.lastLoginProvince}{u.lastLoginCity ? `/${u.lastLoginCity}` : ""}</span>
                      : <span className="text-slate-400">未记录</span>}
                  </td>
                  <td className="px-6 py-3.5 text-right text-slate-600">{u.productCount}</td>
                  <td className="px-6 py-3.5 text-right text-slate-600">{u.orderCount}</td>
                  <td className="px-6 py-3.5 text-center">
                    <Badge variant={u.enabled ? "default" : "destructive"} className={u.enabled ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                      {u.enabled ? "正常" : "禁用"}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => { setPwDialog({ id: u.id, username: u.username }); setPwInput("") }}
                      >
                        修改密码
                      </Button>
                      <span className="text-xs text-slate-400">{u.enabled ? "禁用" : "启用"}</span>
                      <Switch
                        checked={u.enabled}
                        onCheckedChange={v => toggleStatus(u.id, v)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="text-xs px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      查看画像 →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-8 text-center text-slate-400">加载中...</div>}
          {!loading && users.length === 0 && <div className="p-8 text-center text-slate-400">暂无用户</div>}
        </CardContent>
      </Card>

      {/* 修改密码弹窗 */}
      <Dialog open={!!pwDialog} onOpenChange={open => !open && setPwDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">用户名：<span className="font-medium">{pwDialog?.username}</span></p>
            <Input
              type="password"
              placeholder="输入新密码（至少4位）"
              value={pwInput}
              onChange={e => setPwInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && changePassword()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwDialog(null)}>取消</Button>
            <Button onClick={changePassword} disabled={pwInput.length < 4 || pwSaving}>
              {pwSaving ? "保存中..." : "确认修改"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
