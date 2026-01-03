"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { productApi, categoryApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

interface Category {
  id: number
  name: string
}

export default function PublishPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [imagePreview, setImagePreview] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    quantity: "",
    images: "",
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    loadCategories()
  }, [])

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件")
      return
    }

    // 检查文件大小（限制5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError("图片大小不能超过5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64String = event.target?.result as string
      // base64String 格式为 data:image/png;base64,...
      setFormData({ ...formData, images: base64String })
      setImagePreview(base64String)
      setError("")
    }
    reader.onerror = () => {
      setError("图片读取失败")
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setFormData({ ...formData, images: "" })
    setImagePreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const price = Number.parseFloat(formData.price)
    const quantity = Number.parseInt(formData.quantity)
    const categoryId = Number.parseInt(selectedCategoryId)

    if (isNaN(price) || price <= 0) {
      setError("请输入有效的价格")
      return
    }

    if (isNaN(quantity) || quantity <= 0) {
      setError("请输入有效的库存数量")
      return
    }

    if (!categoryId) {
      setError("请选择商品分类")
      return
    }

    if (!user?.id) {
      setError("请先登录")
      return
    }

    setLoading(true)

    try {
      const response = await productApi.publish({
        sellerId: user.id,
        categoryId,
        title: formData.title,
        price,
        quantity,
        images: formData.images || undefined,
      })

      if (response.error) {
        setError(response.error)
      } else {
        alert("发布成功！")
        router.push("/my-products")
      }
    } catch (err) {
      setError("发布失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return <div className="container mx-auto px-4 py-8">加载中...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">发布商品</CardTitle>
          <CardDescription>填写商品信息，开始出售您的闲置物品</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">商品标题 *</Label>
              <Input
                id="title"
                type="text"
                placeholder="请输入商品标题"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">价格 (元) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">库存数量 *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">商品分类 *</Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="选择分类" />
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

            <div className="space-y-2">
              <Label>商品图片</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />

              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="商品预览"
                    className="h-48 w-full rounded-lg border object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={clearImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="image-upload"
                  className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted"
                >
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">点击上传图片</span>
                  <span className="mt-1 text-xs text-muted-foreground">支持 JPG、PNG 格式，最大 5MB</span>
                </label>
              )}
            </div>

            {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "发布中..." : "发布商品"}
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
