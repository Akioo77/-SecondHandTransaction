import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Package, Shield, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-20 text-center md:py-32">
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl">
            让闲置物品
            <br />
            找到新主人
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            安全、便捷的二手商品交易平台
            <br />
            买卖闲置，让资源循环利用
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/products">
                浏览商品 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/publish">发布商品</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-20">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-2">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">安全保障</h3>
                <p className="text-muted-foreground">实名认证，交易担保，保护买卖双方权益</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">快速便捷</h3>
                <p className="text-muted-foreground">一键发布，快速匹配，高效完成交易</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">品类丰富</h3>
                <p className="text-muted-foreground">涵盖数码、家居、图书等多个品类</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
