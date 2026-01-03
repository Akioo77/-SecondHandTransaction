"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { productApi, orderApi, favoriteApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { getImageSrc } from "@/lib/utils"

interface Product {
  id: number
  title: string
  price: number
  quantity: number
  images?: string
  categoryId: number
  sellerId: number
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isFavorited, setIsFavorited] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  const [showShippingDialog, setShowShippingDialog] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
  })
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null)

  useEffect(() => {
    if (params.id) {
      loadProductDetail()
    }
  }, [params.id])

  useEffect(() => {
    if (user && product) {
      checkFavoriteStatus()
    }
  }, [user, product])

  const loadProductDetail = async () => {
    try {
      const response = await productApi.getDetail(Number(params.id))
      if (response.data) {
        setProduct(response.data as Product)
      }
    } catch (error) {
      console.log("[v0] Failed to load product:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkFavoriteStatus = async () => {
    if (!user || !product) return
    try {
      const response = await favoriteApi.isFavorite(user.id, product.id)
      if (response.data !== undefined) {
        setIsFavorited(response.data)
      }
    } catch (error) {
      console.log("[v0] Failed to check favorite status:", error)
    }
  }

  const handlePurchase = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!product || quantity > product.quantity) {
      alert("库存不足")
      return
    }

    setPurchasing(true)
    try {
      const response = await orderApi.create(product.id, user.id, quantity)
      if (response.error) {
        alert(response.error)
      } else if (response.data) {
        // 订单创建成功，打开收货信息弹窗
        const orderId = (response.data as { id: number }).id
        setPendingOrderId(orderId)
        setShowShippingDialog(true)
      }
    } catch (error) {
      alert("下单失败，请稍后重试")
    } finally {
      setPurchasing(false)
    }
  }

  const handleSubmitShipping = async () => {
    if (!pendingOrderId || !user) return

    if (!shippingInfo.receiverName || !shippingInfo.receiverPhone || !shippingInfo.receiverAddress) {
      alert("请填写完整的收货信息")
      return
    }

    try {
      const response = await orderApi.updateShipping(pendingOrderId, {
        buyerId: user.id,
        ...shippingInfo,
      })
      if (response.error) {
        alert(response.error)
      } else {
        alert("下单成功！")
        setShowShippingDialog(false)
        setShippingInfo({ receiverName: "", receiverPhone: "", receiverAddress: "" })
        setPendingOrderId(null)
        router.push("/orders")
      }
    } catch (error) {
      alert("提交收货信息失败")
    }
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    try {
      if (isFavorited) {
        await favoriteApi.remove(user.id, product!.id)
        setIsFavorited(false)
      } else {
        await favoriteApi.add(user.id, product!.id)
        setIsFavorited(true)
      }
    } catch (error) {
      console.log("[v0] Failed to toggle favorite:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-lg bg-muted" />
          <div className="space-y-4">
            <div className="h-8 animate-pulse rounded bg-muted" />
            <div className="h-4 animate-pulse rounded bg-muted" />
            <div className="h-4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="mb-4 text-2xl font-bold">商品不存在</h2>
        <Button asChild>
          <Link href="/products">返回商品列表</Link>
        </Button>
      </div>
    )
  }

  const imageSrc = getImageSrc(product.images)

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回列表
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg">
          {imageSrc ? (
            <img src={imageSrc || "/placeholder.svg"} alt={product.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center bg-muted text-muted-foreground">
              暂无图片
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="mb-2 text-3xl font-bold leading-tight">{product.title}</h1>
            <div className="flex items-center gap-4">
              {product.quantity === 0 && <Badge variant="secondary">已售罄</Badge>}
            </div>
          </div>

          <Separator />

          <div>
            <div className="mb-2 text-sm text-muted-foreground">价格</div>
            <div className="text-4xl font-bold text-primary">¥{product.price.toFixed(2)}</div>
          </div>

          <div>
            <div className="mb-2 text-sm text-muted-foreground">库存数量</div>
            <div className="text-lg font-semibold">{product.quantity} 件</div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">购买数量</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={product.quantity}
                value={quantity}
                onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                className="mt-2 w-32"
              />
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={handlePurchase}
                disabled={product.quantity === 0 || purchasing}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {purchasing ? "下单中..." : "立即购买"}
              </Button>
              <Button size="lg" variant={isFavorited ? "default" : "outline"} onClick={handleToggleFavorite}>
                <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
                <span className="sr-only">{isFavorited ? "取消收藏" : "收藏"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showShippingDialog} onOpenChange={setShowShippingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>填写收货信息</DialogTitle>
            <DialogDescription>请填写您的收货信息以完成订单</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="receiverName">收货人姓名</Label>
              <Input
                id="receiverName"
                value={shippingInfo.receiverName}
                onChange={(e) => setShippingInfo((prev) => ({ ...prev, receiverName: e.target.value }))}
                placeholder="请输入收货人姓名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverPhone">联系电话</Label>
              <Input
                id="receiverPhone"
                value={shippingInfo.receiverPhone}
                onChange={(e) => setShippingInfo((prev) => ({ ...prev, receiverPhone: e.target.value }))}
                placeholder="请输入联系电话"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverAddress">收货地址</Label>
              <Input
                id="receiverAddress"
                value={shippingInfo.receiverAddress}
                onChange={(e) => setShippingInfo((prev) => ({ ...prev, receiverAddress: e.target.value }))}
                placeholder="请输入详细收货地址"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShippingDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitShipping}>提交订单</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
