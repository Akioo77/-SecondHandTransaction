"use client"

import React, { useEffect, useState } from "react"
import { adminApi, categoryApi } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getImageSrc } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editPrice, setEditPrice] = useState("")
  const [editQty, setEditQty] = useState("")
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null)
  const [keyword, setKeyword] = useState("")

  const load = () => adminApi.getProducts().then(r => { if (r.data) setProducts(r.data) }).finally(() => setLoading(false))
  const loadCategories = () => categoryApi.getList().then(r => { if (r.data) setCategories(r.data) })

  useEffect(() => { load(); loadCategories() }, [])

  const startEdit = (p: any) => {
    setEditingId(p.id)
    setEditPrice(String(p.price))
    setEditQty(String(p.quantity))
    setEditCategoryId(p.categoryId ?? null)
  }
  const cancelEdit = () => { setEditingId(null) }

  const saveEdit = async (id: number) => {
    await adminApi.updateProduct(id, {
      price: isNaN(parseFloat(editPrice)) ? undefined : parseFloat(editPrice),
      quantity: isNaN(parseInt(editQty)) ? undefined : parseInt(editQty),
      categoryId: editCategoryId ?? undefined,
    })
    setEditingId(null)
    load()
  }

  const getCategoryName = (catId: number | undefined) => {
    if (!catId) return "-"
    const cat = categories.find((c: any) => c.id === catId)
    return cat?.name ?? "-"
  }

  const filtered = products.filter(p =>
    !keyword || p.title?.includes(keyword) || p.categoryName?.includes(keyword) || p.sellerName?.includes(keyword)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">商品管理</h2>
          <p className="text-slate-500 text-sm mt-1">管理平台所有商品信息</p>
        </div>
        <Input
          placeholder="搜索商品..."
          className="w-64"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500 border-b">
                <th className="px-4 py-3 font-medium w-16">图片</th>
                <th className="px-4 py-3 font-medium">商品</th>
                <th className="px-4 py-3 font-medium">类别</th>
                <th className="px-4 py-3 font-medium">卖家</th>
                <th className="px-4 py-3 font-medium text-right">价格</th>
                <th className="px-4 py-3 font-medium text-right">库存</th>
                <th className="px-4 py-3 font-medium text-center">状态</th>
                <th className="px-4 py-3 font-medium text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {p.images && <img src={getImageSrc(p.images)} className="w-12 h-12 object-cover rounded" />}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-48">
                    <span className="truncate block">{p.title}</span>
                    <span className="text-xs text-slate-400">#ID{p.id}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {editingId === p.id ? (
                      <Select value={String(editCategoryId ?? "")} onValueChange={v => setEditCategoryId(Number(v))}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="选择类别" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c: any) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-slate-600">{p.categoryName ?? "-"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.sellerName ?? "-"}</td>
                  <td className="px-4 py-3 text-right">
                    {editingId === p.id ? (
                      <Input
                        className="w-24 inline-block text-right"
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        type="number"
                      />
                    ) : (
                      <span className="font-medium text-slate-800">¥{p.price}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingId === p.id ? (
                      <Input
                        className="w-20 inline-block text-right"
                        value={editQty}
                        onChange={e => setEditQty(e.target.value)}
                        type="number"
                      />
                    ) : (
                      <span className="text-slate-600">{p.quantity}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={p.isDeleted ? "destructive" : "default"} className={!p.isDeleted ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                      {p.isDeleted ? "已下架" : "在售"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingId === p.id ? (
                      <div className="flex gap-1 justify-center">
                        <Button size="sm" onClick={() => saveEdit(p.id)} className="h-7 text-xs">保存</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit} className="h-7 text-xs">取消</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => startEdit(p)} className="h-7 text-xs">编辑</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-8 text-center text-slate-400">加载中...</div>}
          {!loading && filtered.length === 0 && <div className="p-8 text-center text-slate-400">暂无商品</div>}
        </CardContent>
      </Card>
    </div>
  )
}
