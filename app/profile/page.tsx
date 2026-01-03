"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { User, Package, ShoppingCart, Heart, Settings } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return <div className="container mx-auto px-4 py-8">加载中...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">个人中心</h1>
        <p className="mt-2 text-muted-foreground">管理您的账号和交易</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <User className="h-10 w-10 text-primary" />
            </div>
            <CardTitle>{user.nickname}</CardTitle>
            <CardDescription>@{user.username}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/profile/settings">
                <Settings className="mr-2 h-4 w-4" />
                账号设置
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="group cursor-pointer transition-shadow hover:shadow-lg" asChild>
              <Link href="/my-products">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">我的商品</h3>
                    <p className="text-sm text-muted-foreground">管理发布的商品</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="group cursor-pointer transition-shadow hover:shadow-lg" asChild>
              <Link href="/orders">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">我的订单</h3>
                    <p className="text-sm text-muted-foreground">查看订单记录</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="group cursor-pointer transition-shadow hover:shadow-lg" asChild>
              <Link href="/favorites">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">我的收藏</h3>
                    <p className="text-sm text-muted-foreground">浏览收藏的商品</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="group cursor-pointer transition-shadow hover:shadow-lg" asChild>
              <Link href="/publish">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                    <Package className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">发布商品</h3>
                    <p className="text-sm text-muted-foreground">出售闲置物品</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>我的统计</CardTitle>
              <CardDescription>查看您的交易数据</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">发布商品</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">购买订单</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">收藏商品</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
