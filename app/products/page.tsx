"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { productApi, categoryApi } from "@/lib/api"

interface Product {
  id: number
  title: string
  price: number
  quantity: number
  images?: string
  categoryId: number
}

interface Category {
  id: number
  name: string
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get("keyword") || "")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [searchParams])

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getList()
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data as Category[])
      }
    } catch (error) {
      console.log("[v0] Failed to load categories:", error)
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      const keyword = searchParams.get("keyword") || ""
      setSearchKeyword(keyword)

      const params: { categoryId?: number; keyword?: string } = {}
      if (keyword) {
        params.keyword = keyword
      }

      const response = await productApi.getList(params)
      if (response.data) {
        setProducts(response.data as Product[])
      }
    } catch (error) {
      console.log("[v0] Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const params: { categoryId?: number; keyword?: string } = {}
      if (selectedCategory !== "all") {
        params.categoryId = Number.parseInt(selectedCategory)
      }
      if (searchKeyword) {
        params.keyword = searchKeyword
      }

      const response = await productApi.getList(params)
      if (response.data) {
        setProducts(response.data as Product[])
      }
    } catch (error) {
      console.log("[v0] Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">商品市场</h1>
          <p className="mt-2 text-muted-foreground">浏览全部二手商品</p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索商品标题..."
              className="pl-10"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch()
                }
              }}
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleSearch} className="w-full md:w-auto">
            搜索
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 animate-pulse bg-muted" />
              <CardContent className="p-4">
                <div className="mb-2 h-4 animate-pulse rounded bg-muted" />
                <div className="h-3 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {product.images ? (
                    <img
                      src={product.images || "/placeholder.svg"}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                      暂无图片
                    </div>
                  )}
                  {product.quantity === 0 && (
                    <Badge className="absolute right-2 top-2" variant="secondary">
                      已售罄
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="mb-2 line-clamp-2 font-semibold leading-snug">{product.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">¥{product.price.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">库存 {product.quantity}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 text-6xl">📦</div>
          <h3 className="mb-2 text-xl font-semibold">暂无商品</h3>
          <p className="text-muted-foreground">试试其他搜索条件吧</p>
        </div>
      )}
    </div>
  )
}
