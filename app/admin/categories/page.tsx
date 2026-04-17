"use client"

import React, { useEffect, useState } from "react"
import { adminApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [saving, setSaving] = useState(false)

  const load = () => adminApi.getCategories().then(r => { if (r.data) setCategories(r.data) }).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const addCategory = async () => {
    if (!newName.trim()) return
    setSaving(true)
    await adminApi.addCategory(newName.trim())
    setNewName("")
    load()
    setSaving(false)
  }

  const deleteCategory = async (id: number, name: string, count: number) => {
    if (count > 0) {
      alert(`"${name}" 下还有 ${count} 件商品，请先删除或转移商品后再操作`)
      return
    }
    if (!confirm(`确定删除类别 "${name}" 吗？`)) return
    await adminApi.deleteCategory(id)
    load()
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">类别管理</h2>
        <p className="text-slate-500 text-sm mt-1">添加、删除商品类别</p>
      </div>

      {/* Add category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">新增类别</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Input
            placeholder="输入类别名称，如：数码产品"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCategory()}
            className="max-w-sm"
          />
          <Button onClick={addCategory} disabled={saving || !newName.trim()}>
            {saving ? "添加中..." : "添加"}
          </Button>
        </CardContent>
      </Card>

      {/* Category list */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500 border-b">
                <th className="px-6 py-3 font-medium">类别名称</th>
                <th className="px-6 py-3 font-medium text-right">商品数量</th>
                <th className="px-6 py-3 font-medium text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-6 py-3.5 font-medium text-slate-800">{c.name}</td>
                  <td className="px-6 py-3.5 text-right">
                    <Badge variant="outline" className="ml-auto">{c.productCount} 件</Badge>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs"
                      onClick={() => deleteCategory(c.id, c.name, c.productCount)}
                    >
                      删除
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-8 text-center text-slate-400">加载中...</div>}
          {!loading && categories.length === 0 && <div className="p-8 text-center text-slate-400">暂无类别</div>}
        </CardContent>
      </Card>
    </div>
  )
}
