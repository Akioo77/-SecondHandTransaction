"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analyticsApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, Eye, ShoppingCart, Heart } from "lucide-react"

type RankingItem = {
  productId: number; productTitle: string; categoryId: number;
  categoryName: string; price: number; salesCount: number;
  salesAmount: number; viewCount: number; favoriteCount: number;
}

export default function ProductRankingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"salesCount" | "salesAmount" | "viewCount">("salesCount")

  useEffect(() => {
    if (!authLoading && !user) router.push("/login")
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    analyticsApi.getSalesRanking(20)
      .then(r => r.data && setRanking(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const sorted = [...ranking].sort((a, b) =>
    sortBy === "salesAmount" ? b.salesAmount - a.salesAmount
      : sortBy === "viewCount" ? b.viewCount - a.viewCount
      : b.salesCount - a.salesCount
  )

  const medal = ["🏆", "🥈", "🥉"]

  if (authLoading || !user) return <div className="container mx-auto px-4 py-8">加载中...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/analytics"><ArrowLeft className="mr-2 h-4 w-4" />返回概览</Link>
      </Button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">商品排行榜</h1>
          <p className="mt-1 text-muted-foreground">查看最热销、最高浏览量的商品</p>
        </div>
        <div className="flex gap-2">
          {(["salesCount", "salesAmount", "viewCount"] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`rounded border px-3 py-1.5 text-sm transition-colors ${sortBy === s ? "bg-black text-white" : "hover:bg-gray-100"}`}>
              {s === "salesCount" ? "销量" : s === "salesAmount" ? "销售额" : "浏览量"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(10)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded bg-muted" />)}</div>
      ) : (
        <div className="space-y-3">
          {sorted.map((item, i) => (
            <Card key={item.productId}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* 排名 */}
                  <div className="w-10 text-center">
                    {i < 3 ? (
                      <span className="text-2xl">{medal[i]}</span>
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">{i + 1}</span>
                    )}
                  </div>

                  {/* 商品信息 */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold">{item.productTitle}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{item.categoryName}</span>
                      <span>¥{Number(item.price).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* 指标 */}
                  <div className="flex gap-6 text-right">
                    <div>
                      <div className="flex items-center gap-1 justify-end text-orange-600">
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span className="text-sm font-bold">{item.salesCount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">已售</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 justify-end text-green-600">
                        <span className="text-sm font-bold">¥{Number(item.salesAmount).toFixed(0)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">销售额</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 justify-end text-purple-600">
                        <Eye className="h-3.5 w-3.5" />
                        <span className="text-sm font-bold">{item.viewCount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">浏览</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 justify-end text-red-500">
                        <Heart className="h-3.5 w-3.5" />
                        <span className="text-sm font-bold">{item.favoriteCount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">收藏</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {ranking.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">暂无排行数据</div>
          )}
        </div>
      )}
    </div>
  )
}
