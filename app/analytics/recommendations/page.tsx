"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { analyticsApi, productApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft, Sparkles, Eye } from "lucide-react"
import Image from "next/image"

type RecProduct = {
  productId: number; title: string; price: number;
  salesCount: number; viewCount: number; reason: string;
}

type ProductDetail = {
  id: number; title: string; price: number; images?: string; status: number;
}

export default function RecommendationsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [recs, setRecs] = useState<RecProduct[]>([])
  const [productMap, setProductMap] = useState<Record<number, ProductDetail>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push("/login")
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    // 有个性化数据用个性化推荐，否则用热门推荐
    analyticsApi.getPersonalized(user.id, 20)
      .then(async r => {
        if (!r.data || r.data.length === 0) {
          // fallback 到热门推荐
          return analyticsApi.getRecommendations(20)
        }
        return r
      })
      .then(async r => {
        if (!r?.data) return
        setRecs(r.data)
        // 加载商品详情（图）
        const ids = r.data.map((p: RecProduct) => p.productId)
        const productRes = await productApi.getList()
        if (productRes.data) {
          const map: Record<number, ProductDetail> = {}
          for (const p of productRes.data as ProductDetail[]) {
            if (ids.includes(p.id)) map[p.id] = p
          }
          setProductMap(map)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  function getImage(product: ProductDetail): string {
    try {
      const imgs = product.images ? JSON.parse(product.images) : []
      return imgs[0] || "/placeholder.png"
    } catch { return "/placeholder.png" }
  }

  if (authLoading || !user) return <div className="container mx-auto px-4 py-8">加载中...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/analytics"><ArrowLeft className="mr-2 h-4 w-4" />返回概览</Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">个性推荐</h1>
        <p className="mt-1 text-muted-foreground">根据您的浏览和购买记录，智能推荐商品</p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}><CardContent className="p-0"><div className="h-48 animate-pulse bg-muted" /><div className="p-4 h-24 animate-pulse bg-muted mt-1" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">为您推荐 {recs.length} 件商品</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recs.map((rec) => {
              const product = productMap[rec.productId]
              return (
                <Card key={rec.productId} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/products/${rec.productId}`)}>
                  <div className="relative h-48 bg-gray-100">
                    {product?.images ? (
                      <img src={getImage(product)} alt={rec.title}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">暂无图片</div>
                    )}
                    <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                      {rec.reason}
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="truncate font-medium text-sm">{rec.title}</p>
                    <p className="mt-1 text-lg font-bold text-green-600">¥{Number(rec.price).toFixed(2)}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {rec.viewCount}
                      </div>
                      <span>已售 {rec.salesCount}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {recs.length === 0 && (
            <Card><CardContent className="flex flex-col items-center justify-center py-20">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">暂无推荐</h3>
              <p className="text-muted-foreground mt-1">多浏览商品后，我们会为您个性化推荐</p>
              <Button className="mt-4" onClick={() => router.push("/products")}>去逛逛</Button>
            </CardContent></Card>
          )}
        </>
      )}
    </div>
  )
}
