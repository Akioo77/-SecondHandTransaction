"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { productApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

interface Product {
  id: number
  title: string
  price: number
  quantity: number
  images?: string
  isDeleted: number
}

export default function MyProductsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadProducts()
    }
  }, [user])

  const loadProducts = async () => {
    try {
      const response = await productApi.getList({ sellerId: user!.id })
      if (response.data) {
        setProducts(response.data as Product[])
      }
    } catch (error) {
      console.log("[v0] Failed to load products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个商品吗？")) {
      return
    }

    try {
      await productApi.delete(id)
      setProducts(products.filter((p) => p.id !== id))
    } catch (error) {
      alert("删除失败，请稍后重试")
    }
  }

  if (authLoading || !user) {
    return <div className="container mx-auto px-4 py-8">加载中...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">我的商品</h1>
          <p className="mt-2 text-muted-foreground">管理您发布的所有商品</p>
        </div>
        <Button asChild>
          <Link href="/publish">
            <Plus className="mr-2 h-4 w-4" />
            发布商品
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <div className="h-48 animate-pulse bg-muted" />
              <CardContent className="p-4">
                <div className="h-4 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <div className="relative aspect-square overflow-hidden bg-muted">
                {product.images ? (
                  <img
                    src={product.images || "/placeholder.svg"}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">暂无图片</div>
                )}
                <Badge className="absolute right-2 top-2" variant={product.quantity === 0 ? "secondary" : "default"}>
                  {product.quantity === 0 ? "已售罄" : "在售"}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="mb-2 line-clamp-2 font-semibold">{product.title}</h3>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">¥{product.price.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">库存 {product.quantity}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                    <Link href={`/products/${product.id}/edit`}>
                      <Pencil className="mr-1 h-3 w-3" />
                      编辑
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 text-6xl">📦</div>
          <h3 className="mb-2 text-xl font-semibold">还没有发布商品</h3>
          <p className="mb-6 text-muted-foreground">开始发布您的第一件商品吧</p>
          <Button asChild>
            <Link href="/publish">
              <Plus className="mr-2 h-4 w-4" />
              发布商品
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
