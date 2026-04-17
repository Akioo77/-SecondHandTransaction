"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analyticsApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react"

export default function SalesTrendPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [dailyData, setDailyData] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [trendAnalysis, setTrendAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    if (!authLoading && !user) router.push("/login")
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    Promise.all([
      analyticsApi.getDailyTrend(days),
      analyticsApi.getMonthlyTrend(6),
      analyticsApi.getTrendAnalysis(days),
    ]).then(([dailyRes, monthlyRes, trendRes]) => {
      if (dailyRes.data) setDailyData(dailyRes.data)
      if (monthlyRes.data) setMonthlyData(monthlyRes.data)
      if (trendRes.data) setTrendAnalysis(trendRes.data)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [user, days])

  if (authLoading || !user) return <div className="container mx-auto px-4 py-8">加载中...</div>

  const trendIcon = trendAnalysis?.trend === "上涨" ? <TrendingUp className="h-5 w-5" />
    : trendAnalysis?.trend === "下跌" ? <TrendingDown className="h-5 w-5" />
    : <Minus className="h-5 w-5" />

  const trendColor = trendAnalysis?.trend === "上涨" ? "text-green-600"
    : trendAnalysis?.trend === "下跌" ? "text-red-500" : "text-gray-500"

  const totalSales = trendAnalysis?.currentSales ?? 0
  const changePct = trendAnalysis?.salesChangePct ?? 0

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/analytics"><ArrowLeft className="mr-2 h-4 w-4" />返回概览</Link>
      </Button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">销售趋势分析</h1>
          <p className="mt-1 text-muted-foreground">日/月销量对比、环比涨跌、运营研判建议</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`rounded border px-3 py-1.5 text-sm transition-colors ${days === d ? "bg-black text-white" : "hover:bg-gray-100"}`}>
              {d}天
            </button>
          ))}
        </div>
      </div>

      {/* 趋势研判卡片 */}
      {!loading && trendAnalysis && (
        <Card className="mb-8 border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className={`flex items-center gap-2 ${trendColor} text-2xl font-bold`}>
                {trendIcon}
                <span>{trendAnalysis.trend}</span>
                <span className="text-base font-normal ml-2">
                  环比 {changePct >= 0 ? "+" : ""}{Number(changePct).toFixed(1)}%
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-yellow-600 mb-2">
                  <Lightbulb className="h-4 w-4" />
                  <span className="text-sm font-medium">运营建议</span>
                </div>
                <p className="text-sm text-muted-foreground">{trendAnalysis.advice}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">本期销售额</p>
                <p className="text-2xl font-bold text-green-600">¥{Number(totalSales).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  上期 ¥{Number(trendAnalysis.previousSales).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 日趋势 */}
      <Card className="mb-8">
        <CardHeader><CardTitle>每日销售额 & 订单数</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} tickFormatter={v => v.slice(5)} />
              <YAxis yAxisId="left" fontSize={12} tickFormatter={v => `¥${(v/1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" fontSize={12} />
              <Tooltip formatter={(v, name) => [`${Number(v).toFixed(2)}`,
                name === "salesAmount" ? "销售额" : name === "orderCount" ? "订单数" : "已售件数"]} />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="salesAmount" stroke="#16a34a" fill="#bbf7d0" strokeWidth={2} name="销售额" />
              <Line yAxisId="right" type="monotone" dataKey="orderCount" stroke="#2563eb" strokeWidth={2} dot={false} name="订单数" />
              <Line yAxisId="right" type="monotone" dataKey="soldQuantity" stroke="#f97316" strokeWidth={2} dot={false} name="已售件数" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 月趋势 */}
      <Card className="mb-8">
        <CardHeader><CardTitle>月度销售趋势</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={v => `¥${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v, name) => [
                name === "salesAmount" ? `¥${Number(v).toFixed(2)}` : v,
                name === "salesAmount" ? "销售额" : name === "orderCount" ? "订单数" : "已售件数"
              ]} />
              <Legend />
              <Bar dataKey="salesAmount" fill="#16a34a" radius={[4, 4, 0, 0]} name="销售额" />
              <Bar dataKey="orderCount" fill="#2563eb" radius={[4, 4, 0, 0]} name="订单数" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 浏览量趋势 */}
      <Card>
        <CardHeader><CardTitle>每日浏览量</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} tickFormatter={v => v.slice(5)} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v) => [v, "浏览量"]} />
              <Bar dataKey="viewCount" fill="#a78bfa" radius={[4, 4, 0, 0]} name="浏览量" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
