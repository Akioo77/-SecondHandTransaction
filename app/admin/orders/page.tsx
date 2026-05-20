"use client"

import React, { useEffect, useState } from "react"
import { adminApi, orderApi } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  10: { label: "已下单", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  20: { label: "已发货", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  40: { label: "已完成", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  50: { label: "已取消", className: "bg-slate-100 text-slate-600 hover:bg-slate-100" },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState("")
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    adminApi.getOrders().then(r => { if (r.data) setOrders(r.data) }).finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter(o =>
    !keyword ||
    o.orderNo?.includes(keyword) ||
    o.buyerName?.includes(keyword) ||
    o.sellerName?.includes(keyword) ||
    o.productTitle?.includes(keyword)
  )

  const closeOrder = async (orderId: number) => {
    if (!confirm("确定要关闭此订单吗？关闭后订单标记为已取消。")) return
    setActionLoading(orderId)
    try {
      await orderApi.updateStatus(orderId, 50)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 50 } : o))
    } catch {
      alert("操作失败，请重试")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">订单管理</h2>
          <p className="text-slate-500 text-sm mt-1">查看所有订单记录</p>
        </div>
        <input
          placeholder="搜索订单..."
          className="border rounded px-3 py-1.5 text-sm w-64"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500 border-b">
                <th className="px-4 py-3 font-medium">订单号</th>
                <th className="px-4 py-3 font-medium">商品</th>
                <th className="px-4 py-3 font-medium">买家</th>
                <th className="px-4 py-3 font-medium">卖家</th>
                <th className="px-4 py-3 font-medium text-right">数量</th>
                <th className="px-4 py-3 font-medium text-right">金额</th>
                <th className="px-4 py-3 font-medium text-center">状态</th>
                <th className="px-4 py-3 font-medium">下单时间</th>
                <th className="px-4 py-3 font-medium text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const status = STATUS_MAP[o.status] ?? { label: `状态${o.status}`, className: "bg-slate-100" }
                return (
                  <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{o.orderNo}</td>
                    <td className="px-4 py-3 text-slate-800 max-w-32">
                      <span className="truncate block">{o.productTitle ?? "-"}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{o.buyerName ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{o.sellerName ?? "-"}</td>
                    <td className="px-4 py-3 text-right text-slate-600">x{o.quantity}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">¥{o.totalPrice}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={status.className}>{status.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString("zh-CN") : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {o.status === 10 && (
                        <button
                          className="text-xs px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                          onClick={() => closeOrder(o.id)}
                          disabled={actionLoading === o.id}
                        >
                          {actionLoading === o.id ? "处理中..." : "关闭订单"}
                        </button>
                      )}
                      {o.status === 50 && (
                        <span className="text-xs text-slate-400">已关闭</span>
                      )}
                      {o.status === 40 && (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {loading && <div className="p-8 text-center text-slate-400">加载中...</div>}
          {!loading && filtered.length === 0 && <div className="p-8 text-center text-slate-400">暂无订单</div>}
        </CardContent>
      </Card>
    </div>
  )
}
