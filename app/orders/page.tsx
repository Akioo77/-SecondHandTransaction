"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { orderApi, productApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Store,
  BarChart3,
  MapPin,
  Phone,
  UserIcon,
  Truck,
} from "lucide-react"

interface Order {
  id: number
  orderNo: string
  productId: number
  buyerId: number
  sellerId: number
  quantity: number
  totalPrice: number
  status: number
  createdAt: string
  receiverName?: string
  receiverPhone?: string
  receiverAddress?: string
  productInfo?: {
    title: string
    price: number
    images?: string
    categoryId?: number
  }
}

interface SalesSummary {
  sellerId: number
  totalQuantity: number
  totalAmount: number
}

const ORDER_STATUS = {
  PLACED: 10,
  SHIPPED: 20,
  COMPLETED: 40,
  CANCELED: 50,
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([])
  const [sellerOrders, setSellerOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [roleTab, setRoleTab] = useState<"buyer" | "seller">("buyer")
  const [statusTab, setStatusTab] = useState("all")
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadOrders()
      loadSalesSummary()
    }
  }, [user])

  const loadOrders = async () => {
    if (!user) { router.push("/login"); return }
    setLoading(true)
    try {
      const [buyerRes, sellerRes] = await Promise.all([
        orderApi.getList({ buyerId: user.id }),
        orderApi.getSellerShipping(user.id),
      ])
      const buyerOrders: Order[] = (buyerRes.data || []) as Order[]
      const sellerOrders: Order[] = (sellerRes.data || []) as Order[]

      // 收集所有涉及的商品 ID
      const allProductIds = [...new Set([...buyerOrders, ...sellerOrders].map((o) => o.productId))]

      // 批量获取商品详情
      const productMap: Record<number, { title: string; price: number; images?: string; categoryId?: number }> = {}
      if (allProductIds.length > 0) {
        const productRes = await productApi.getList()
        if (productRes.data) {
          for (const p of productRes.data as any[]) {
            if (allProductIds.includes(p.id)) {
              productMap[p.id] = { title: p.title, price: p.price, images: p.images, categoryId: p.categoryId }
            }
          }
        }
      }

      // 给订单附上商品信息
      const enrich = (orders: Order[]) =>
        orders.map((o) => ({ ...o, productInfo: productMap[o.productId] }))

      setBuyerOrders(enrich(buyerOrders))
      setSellerOrders(enrich(sellerOrders))
    } catch (error) {
      console.error("Failed to load orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSalesSummary = async () => {
    if (!user) { router.push("/login"); return }
    try {
      const response = await orderApi.getSalesSummary(user.id)
      if (response.data) {
        setSalesSummary(response.data)
      }
    } catch (error) {
      console.error("Failed to load sales summary:", error)
    }
  }

  const handleUpdateStatus = async (orderId: number, status: number) => {
    if (!user) { router.push("/login"); return }
    try {
      const response = await orderApi.updateStatus(orderId, status, user.id)
      if (response.error) {
        alert(`更新订单状态失败: ${response.error}`)
        return
      }
      setBuyerOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)))
      setSellerOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)))
      // 刷新统计数据
      if (status === ORDER_STATUS.COMPLETED) {
        loadSalesSummary()
      }
    } catch (error) {
      alert("更新订单状态失败")
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case ORDER_STATUS.SHIPPED:
        return (
          <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Truck className="h-3 w-3" />
            已发货
          </Badge>
        )
      case ORDER_STATUS.PLACED:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            待完成
          </Badge>
        )
      case ORDER_STATUS.COMPLETED:
        return (
          <Badge className="gap-1 bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="h-3 w-3" />
            已完成
          </Badge>
        )
      case ORDER_STATUS.CANCELED:
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            已取消
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const filterOrdersByStatus = (orders: Order[], tab: string) => {
    if (tab === "all") return orders
    if (tab === "placed") return orders.filter((order) => order.status === ORDER_STATUS.PLACED)
    if (tab === "shipped") return orders.filter((order) => order.status === ORDER_STATUS.SHIPPED)
    if (tab === "completed") return orders.filter((order) => order.status === ORDER_STATUS.COMPLETED)
    if (tab === "cancelled") return orders.filter((order) => order.status === ORDER_STATUS.CANCELED)
    return orders
  }

  const currentOrders = roleTab === "buyer" ? buyerOrders : sellerOrders
  const filteredOrders = filterOrdersByStatus(currentOrders, statusTab)

  if (authLoading || !user) {
    return <div className="container mx-auto px-4 py-8">加载中...</div>
  }

  const OrderCard = ({ order, role }: { order: Order; role: "buyer" | "seller" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            {/* 商品图片 */}
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
              {order.productInfo?.images ? (
                <img src={order.productInfo.images.split(",")[0]} alt={order.productInfo.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Package className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex-1">
              {/* 商品名称 */}
              <h3 className="mb-1 font-semibold line-clamp-1">
                {order.productInfo?.title ?? `商品 #${order.productId}`}
              </h3>
              <p className="mb-2 text-sm text-muted-foreground">
                单价: ¥{order.productInfo?.price?.toFixed(2) ?? "—"} | 数量: {order.quantity} | 总价: ¥{order.totalPrice.toFixed(2)}
              </p>
              <div className="mb-2 text-xs text-muted-foreground">
                订单号: {order.orderNo}
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(order.status)}
                <span className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                </span>
              </div>
              {role === "seller" && order.receiverName && (
                <div className="mt-3 rounded-lg border bg-muted/50 p-3 text-sm">
                  <div className="mb-1 font-medium text-foreground">收货信息</div>
                  <div className="space-y-1 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-3 w-3" />
                      <span>{order.receiverName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{order.receiverPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span>{order.receiverAddress}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {order.status === ORDER_STATUS.PLACED && role === "buyer" && (
              <>
                <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.CANCELED)}>
                  取消订单
                </Button>
              </>
            )}
            {order.status === ORDER_STATUS.PLACED && role === "seller" && (
              <span className="text-sm text-muted-foreground">等待买家付款</span>
            )}
            {order.status === ORDER_STATUS.SHIPPED && role === "buyer" && (
              <Button size="sm" onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.COMPLETED)}>
                确认收货
              </Button>
            )}
            {order.status === ORDER_STATUS.SHIPPED && role === "seller" && (
              <span className="text-sm text-muted-foreground">等待买家确认收货</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">我的订单</h1>
          <p className="mt-2 text-muted-foreground">查看和管理您的订单</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/sales-summary">
            <BarChart3 className="mr-2 h-4 w-4" />
            销售统计
          </Link>
        </Button>
      </div>

      <Tabs value={roleTab} onValueChange={(v) => setRoleTab(v as "buyer" | "seller")} className="mb-6">
        <TabsList>
          <TabsTrigger value="buyer" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            我买到的 ({buyerOrders.length})
          </TabsTrigger>
          <TabsTrigger value="seller" className="gap-2">
            <Store className="h-4 w-4" />
            我卖出的 ({sellerOrders.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {roleTab === "seller" && salesSummary && (
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">已售数量</div>
                <div className="text-2xl font-bold">{salesSummary.totalQuantity}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <span className="text-xl font-bold text-green-600">¥</span>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">销售总额</div>
                <div className="text-2xl font-bold">¥{salesSummary.totalAmount.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={statusTab} onValueChange={setStatusTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="placed">待完成</TabsTrigger>
          <TabsTrigger value="shipped">已发货</TabsTrigger>
          <TabsTrigger value="completed">已完成</TabsTrigger>
          <TabsTrigger value="cancelled">已取消</TabsTrigger>
        </TabsList>

        <TabsContent value={statusTab}>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-20 animate-pulse rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} role={roleTab} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <Package className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">暂无订单</h3>
              <p className="text-muted-foreground">
                {roleTab === "buyer" ? "快去挑选心仪的商品吧" : "还没有人购买您的商品"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
