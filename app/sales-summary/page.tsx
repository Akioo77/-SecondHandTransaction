"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { orderApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft, Package, TrendingUp, ShoppingCart } from "lucide-react"

interface SalesSummary {
  sellerId: number
  totalQuantity: number
  totalAmount: number
}

export default function SalesSummaryPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [summary, setSummary] = useState<SalesSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadSummary()
    }
  }, [user])

  const loadSummary = async () => {
    if (!user) return
    setLoading(true)
    try {
      const response = await orderApi.getSalesSummary(user.id)
      if (response.data) {
        setSummary(response.data)
      }
    } catch (error) {
      console.error("Failed to load sales summary:", error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user) {
    return <div className="container mx-auto px-4 py-8">加载中...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回订单
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">销售统计</h1>
        <p className="mt-2 text-muted-foreground">查看您的销售数据概览（仅统计已完成订单）</p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-24 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : summary ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">已售商品数量</CardTitle>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{summary.totalQuantity}</div>
              <p className="mt-1 text-sm text-muted-foreground">件商品已成功售出</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">销售总额</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">¥{summary.totalAmount.toFixed(2)}</div>
              <p className="mt-1 text-sm text-muted-foreground">累计销售金额</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">平均单价</CardTitle>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                ¥{summary.totalQuantity > 0 ? (summary.totalAmount / summary.totalQuantity).toFixed(2) : "0.00"}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">每件商品平均售价</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Package className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">暂无销售数据</h3>
            <p className="mb-4 text-muted-foreground">您还没有已完成的订单</p>
            <Button asChild>
              <Link href="/publish">发布商品</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
