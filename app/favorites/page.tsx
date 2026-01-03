"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { favoriteApi, productApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { ProductCard } from "@/components/product-card"
import { Heart } from "lucide-react"

interface Product {
  id: number
  title: string
  price: number
  quantity: number
  images?: string
}

export default function FavoritesPage() {
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
      loadFavorites()
    }
  }, [user])

  const loadFavorites = async () => {
    if (!user) return
    try {
      setLoading(true)
      const response = await favoriteApi.getList(user.id)
      console.log("[v0] Favorites response:", response)

      let productIds: number[] = []

      if (response?.data?.itemId && Array.isArray(response.data.itemId)) {
        productIds = response.data.itemId
      } else if (response?.itemId && Array.isArray(response.itemId)) {
        productIds = response.itemId
      } else if (Array.isArray(response)) {
        productIds = response
      }

      console.log("[v0] Product IDs to fetch:", productIds)

      if (productIds.length > 0) {
        const loadedProducts: Product[] = []

        for (const id of productIds) {
          try {
            const productData = await productApi.getDetail(id)
            console.log("[v0] Product data for id", id, ":", productData)

            const product = productData.data || productData
            if (product && product.id) {
              loadedProducts.push(product as Product)
            }
          } catch (err) {
            console.log("[v0] Failed to fetch product", id, err)
          }
        }

        console.log("[v0] Loaded products:", loadedProducts)
        setProducts(loadedProducts)
      } else {
        setProducts([])
      }
    } catch (error) {
      console.log("[v0] Failed to load favorites:", error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user) {
    return <div className="container mx-auto px-4 py-8">加载中...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">我的收藏</h1>
        <p className="mt-2 text-muted-foreground">您收藏的所有商品</p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              quantity={product.quantity}
              images={product.images}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">还没有收藏商品</h3>
          <p className="mb-6 text-muted-foreground">快去收藏心仪的商品吧</p>
          <Button asChild>
            <Link href="/products">浏览商品</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
