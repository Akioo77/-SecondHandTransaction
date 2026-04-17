"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analyticsApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { Users, ShoppingBag, TrendingUp, Eye, ArrowUpRight, AlertTriangle, Award, RefreshCw } from "lucide-react"

const COLORS = ["#16a34a", "#2563eb", "#a855f7", "#f97316", "#06b6d4", "#ec4899"]

export default function AnalyticsDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [ranking, setRanking] = useState<any[]>([])
  const [trend, setTrend] = useState<any[]>([])
  const [portrait, setPortrait] = useState<any>(null)
  const [supplyDemand, setSupplyDemand] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push("/login")
  }, [user, authLoading, router])

  // 页面可见性变化时刷新（用户从其他页回来时更新数据）
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") loadData()
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [user])

  // 每10秒自动刷新
  useEffect(() => {
    if (!user) return
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [user])

  const loadData = () => {
    if (!user) return
    setPageLoading(true)
    Promise.all([
      analyticsApi.getSalesRanking(5),
      analyticsApi.getDailyTrend(14),
      analyticsApi.getUserPortrait(),
      analyticsApi.getSupplyDemand(),
    ]).then(([rankingRes, trendRes, portraitRes, sdRes]) => {
      console.log("[Analytics] rankingRes:", rankingRes)
      if (rankingRes?.data) setRanking(rankingRes.data)
      if (trendRes?.data) setTrend(trendRes.data)
      if (portraitRes?.data) setPortrait(portraitRes.data)
      if (sdRes?.data) setSupplyDemand(sdRes.data)
    }).catch(console.error)
    .finally(() => setPageLoading(false))
  }

  if (authLoading || !user) {
    return <div className="container mx-auto px-4 py-8">加载中...</div>
  }

  if (pageLoading) {
    return <div className="container mx-auto px-4 py-8">加载中...</div>
  }

  // 安全计算，防止 undefined
  const safeTrend = Array.isArray(trend) ? trend : []
  const safeRanking = Array.isArray(ranking) ? ranking : []
  const safeSupplyDemand = Array.isArray(supplyDemand) ? supplyDemand : []

  const totalSales = safeTrend.reduce((s, d) => s + (d.salesAmount || 0), 0)
  const totalOrders = safeTrend.reduce((s, d) => s + (d.orderCount || 0), 0)
  const totalViews = safeTrend.reduce((s, d) => s + (d.viewCount || 0), 0)

  // 月销冠军
  const topSeller = safeRanking.length > 0 ? safeRanking.reduce((best, p) =>
    (p.salesAmount || 0) > (best.salesAmount || 0) ? p : best, safeRanking[0]) : null
  const topSellerName = topSeller ? (topSeller.productTitle?.length > 8 ? topSeller.productTitle.slice(0, 8) + "…" : topSeller.productTitle) : "暂无"
  const topSellerAmount = topSeller ? `¥${Number(topSeller.salesAmount || 0).toFixed(2)}` : ""

  const purchasePowerData = portrait
    ? Object.entries(portrait.purchasePowerDistribution || {}).map(([name, value]) => ({ name, value }))
    : []
  const categoryPrefData = portrait
    ? Object.entries(portrait.categoryPreference || {}).map(([name, value]) => ({ name, value })).filter(e => e.value > 0)
    : []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">数据概览</h1>
          <p className="mt-1 text-muted-foreground">实时掌握平台运营情况</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm hover:bg-gray-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            刷新数据
          </button>
          <Link href="/analytics/sales-trend"><button className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100">销售趋势</button></Link>
          <Link href="/analytics/product-ranking"><button className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100">排行榜</button></Link>
          <Link href="/analytics/recommendations"><button className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100">推荐</button></Link>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        {[
          { title: "累计销售额", value: `¥${totalSales.toFixed(2)}`, sub: "近14天", icon: <TrendingUp className="h-5 w-5" />, color: "text-green-600", bg: "bg-green-50" },
          { title: "累计订单", value: String(totalOrders), sub: "近14天", icon: <ShoppingBag className="h-5 w-5" />, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "累计浏览", value: String(totalViews), sub: "近14天", icon: <Eye className="h-5 w-5" />, color: "text-purple-600", bg: "bg-purple-50" },
          { title: "月销冠军", value: topSellerName, sub: topSellerAmount, icon: <Award className="h-5 w-5" />, color: "text-orange-600", bg: "bg-orange-50" },
        ].map(c => (
          <Card key={c.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{c.title}</p>
                  <p className="mt-1 text-2xl font-bold">{c.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
                </div>
                <div className={`rounded-full p-3 ${c.bg}`}>{c.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 销售趋势图 */}
      <Card className="mb-8">
        <CardHeader><CardTitle>销售趋势（近14天）</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={safeTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} tickFormatter={v => v.slice(5)} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v, name) => [
                name === "salesAmount" ? `¥${Number(v).toFixed(2)}` : v,
                name === "salesAmount" ? "销售额" : name === "orderCount" ? "订单数" : "浏览量"
              ]} />
              <Legend />
              <Line type="monotone" dataKey="salesAmount" stroke="#16a34a" strokeWidth={2} dot={false} name="销售额" />
              <Line type="monotone" dataKey="orderCount" stroke="#2563eb" strokeWidth={2} dot={false} name="订单数" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* 热销榜 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>热销商品 TOP5</CardTitle>
            <Link href="/analytics/product-ranking" className="text-sm text-blue-600 flex items-center gap-1 hover:underline">
              查看更多 <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeRanking.map((item, i) => (
                <div key={item.productId} className="flex items-center gap-4">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 text-gray-700" : "bg-orange-50 text-orange-600"}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{item.productTitle}</p>
                    <p className="text-xs text-muted-foreground">{item.categoryName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">¥{Number(item.salesAmount).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{item.salesCount}件</p>
                  </div>
                </div>
              ))}
              {safeRanking.length === 0 && <p className="text-center py-8 text-muted-foreground">暂无数据</p>}
            </div>
          </CardContent>
        </Card>

        {/* 供需监控 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              品类供需监控
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {safeSupplyDemand.map((item, i) => (
                <div key={item.categoryId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm">{item.categoryName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">供给 <b>{item.supply}</b></span>
                    <span className="text-muted-foreground">需求 <b>{item.demand}</b></span>
                    <span className={`font-medium ${item.status.includes("过剩") ? "text-orange-600" : item.status.includes("旺盛") ? "text-red-500" : "text-green-600"}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
              {safeSupplyDemand.length === 0 && <p className="text-center py-8 text-muted-foreground">暂无数据</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 用户画像 */}
      {portrait && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* 购买力分布 */}
          <Card>
            <CardHeader><CardTitle>用户购买力分布</CardTitle></CardHeader>
            <CardContent>
              {purchasePowerData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={purchasePowerData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {purchasePowerData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-center py-16 text-muted-foreground">暂无交易数据</p>}
            </CardContent>
          </Card>

          {/* 品类偏好 */}
          <Card>
            <CardHeader><CardTitle>用户品类偏好 TOP</CardTitle></CardHeader>
            <CardContent>
              {categoryPrefData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryPrefData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis dataKey="name" type="category" fontSize={12} width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#16a34a" radius={[0, 4, 4, 0]} name="购买量" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center py-16 text-muted-foreground">暂无交易数据</p>}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
