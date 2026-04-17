"use client"

import React, { useEffect, useState } from "react"
import { adminApi, analyticsApi } from "@/lib/api"
import { Users, Package, ShoppingCart, Currency, TrendingUp, AlertCircle, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [trend, setTrend] = useState<any>(null)
  const [anomaly, setAnomaly] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.getStats(),
      adminApi.getSalesTrend(),
      analyticsApi.getAnomalySummary(),
    ]).then(([s, t, a]) => {
      if (s.data) setStats(s.data)
      if (t.data) setTrend(t.data)
      if (a.data) setAnomaly(a.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><span className="text-slate-400">加载中...</span></div>
  }

  const cards = [
    { label: "总用户数", value: stats?.totalUsers ?? 0, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "商品总数", value: stats?.totalProducts ?? 0, icon: Package, color: "bg-green-50 text-green-600" },
    { label: "总订单数", value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: "bg-purple-50 text-purple-600" },
    { label: "总收入", value: `¥${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: Currency, color: "bg-amber-50 text-amber-600" },
  ]

  const anomalyLevel = anomaly?.level ?? "OK"
  const anomalyCount = anomaly?.totalAnomalies ?? 0
  const dangerCount = anomaly?.dangerCount ?? 0
  const warningCount = anomaly?.warningCount ?? 0
  const anomalies = anomaly?.anomalies ?? []

  const topProducts = stats?.topProducts ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">数据概览</h2>
          <p className="text-slate-500 text-sm mt-1">实时监控平台运营状况</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <AlertCircle size={14} className="text-amber-500" />
          待处理订单: {stats?.pendingOrders ?? 0}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="text-2xl font-bold mt-1 text-slate-900">{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Anomaly monitoring card */}
      <Card className={
        anomalyLevel === "DANGER" ? "border-red-300 bg-red-50"
        : anomalyLevel === "WARNING" ? "border-amber-300 bg-amber-50"
        : "border-green-300 bg-green-50"
      }>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {anomalyLevel === "DANGER" ? <ShieldAlert size={20} className="text-red-600" />
               : anomalyLevel === "WARNING" ? <AlertTriangle size={20} className="text-amber-600" />
               : <ShieldCheck size={20} className="text-green-600" />}
              销售异常监控
            </span>
            <span className={
              "text-xs px-3 py-1 rounded-full font-bold " +
              (anomalyLevel === "DANGER" ? "bg-red-100 text-red-700"
               : anomalyLevel === "WARNING" ? "bg-amber-100 text-amber-700"
               : "bg-green-100 text-green-700")
            }>
              {anomalyLevel === "DANGER" ? "⚠️ 危险" : anomalyLevel === "WARNING" ? "🟡 警告" : "✅ 正常"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">危险异常</span>
              <span className="font-bold text-red-600">{dangerCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">警告异常</span>
              <span className="font-bold text-amber-600">{warningCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">共计异常事件</span>
              <span className="font-bold text-slate-700">{anomalyCount}</span>
            </div>
          </div>

          {anomalies.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {anomalies.map((a: any, i: number) => (
                <div key={i} className={
                  "flex items-start gap-3 p-3 rounded-lg text-sm " +
                  (a.level === "DANGER" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800")
                }>
                  <span className="mt-0.5 text-xs font-bold shrink-0">
                    {a.type === "ORDER_SPIKE" ? "📈"
                     : a.type === "BRUSH_ORDER" ? "🤖"
                     : "💰"}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{a.description}</p>
                    <p className="text-xs opacity-70 mt-0.5">{a.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-3">暂无异常，系统运行正常 🎉</p>
          )}
        </CardContent>
      </Card>

      {/* Sales trend chart */}
      {trend && trend.daily && trend.daily.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} /> 近30天销售趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trend.daily.slice(-14).map((day: any) => (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-20 shrink-0">{day.date}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${Math.min(100, (day.revenue / (Math.max(...trend.daily.map((d: any) => d.revenue), 1))) * 100)}%` }}
                    >
                      {day.revenue > 0 && <span className="text-xs text-white font-medium">¥{Math.round(day.revenue)}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 w-12 text-right">{day.orderCount} 单</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top products */}
      <Card>
        <CardHeader>
          <CardTitle>🏆 热销商品 TOP 10</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="pb-2 font-medium">商品</th>
                <th className="pb-2 font-medium text-right">价格</th>
                <th className="pb-2 font-medium text-right">销量</th>
                <th className="pb-2 font-medium text-right">销售额</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p: any) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="py-2.5 font-medium text-slate-800">{p.title}</td>
                  <td className="py-2.5 text-right text-slate-500">¥{p.price}</td>
                  <td className="py-2.5 text-right font-medium text-blue-600">{p.sold}</td>
                  <td className="py-2.5 text-right font-medium text-green-600">¥{p.revenue?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {topProducts.length === 0 && (
            <p className="text-center text-slate-400 py-8">暂无数据</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
