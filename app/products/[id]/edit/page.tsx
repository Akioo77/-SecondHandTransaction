"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X } from "lucide-react"
import { productApi, categoryApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { getImageSrc } from "@/lib/utils"

interface Category {
  id: number
  name: string
}

interface Product {
  id: number
  sellerId: number
  categoryId: number
  title: string
  price: number
  quantity: number
  images?: string
  isDeleted: number
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageData, setImageData] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, id])

  const loadData = async () => {
    try {
      const [productRes, categoryRes] = await Promise.all([productApi.getDetail(Number(id)), categoryApi.getList()])

      if (productRes.data) {
        const product = productRes.data as Product
        if (product.sellerId !== user!.id) {
          alert("您没有权限编辑此商品")
          router.push("/my-products")
          return
        }
        setTitle(product.title)
        setPrice(String(product.price))
        setQuantity(String(product.quantity))
        setCategoryId(product.categoryId)
        if (product.images) {
          setImagePreview(getImageSrc(product.images))
          setImageData(product.images)
        }
      }

      if (categoryRes.data) {
        setCategories(categoryRes.data as Category[])
      }
    } catch (error) {
      console.error("加载数据失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("图片大小不能超过5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUri = event.target?.result as string
      setImagePreview(dataUri)
      setImageData(dataUri)
      setError("")
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageData(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim() || !price || !quantity || !categoryId) {
      setError("请填写所有必填项")
      return
    }

    setSubmitting(true)

    try {
      const response = await productApi.updateBySeller(Number(id), user!.id, {
        categoryId,
        title: title.trim(),
        price: Number.parseFloat(price),
        quantity: Number.parseInt(quantity),
        images: imageData || undefined,
      })

      if (response.error) {
        setError(response.error)
      } else {
        router.push("/my-products")
      }
    } catch (error) {
      setError("更新失败，请稍后重试")
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return <div className="container mx-auto px-4 py-8">加载中...</div>
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/my-products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回我的商品
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>编辑商品</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="title">商品标题 *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="请输入商品标题" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">商品分类 *</Label>
              <Select
                value={categoryId ? String(categoryId) : ""}
                onValueChange={(value) => setCategoryId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">价格 (元) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">库存数量 *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>商品图片</Label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="预览"
                    className="h-32 w-32 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50">
                  <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">上传图片</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
              <p className="text-xs text-muted-foreground">支持 JPG、PNG 格式，最大 5MB</p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? "保存中..." : "保存修改"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
