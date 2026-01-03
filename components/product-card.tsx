import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getImageSrc } from "@/lib/utils"

interface ProductCardProps {
  id: number
  title: string
  price: number
  quantity: number
  images?: string
}

export function ProductCard({ id, title, price, quantity, images }: ProductCardProps) {
  const imageSrc = getImageSrc(images)

  return (
    <Link href={`/products/${id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageSrc ? (
            <img
              src={imageSrc || "/placeholder.svg"}
              alt={title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              暂无图片
            </div>
          )}
          {quantity === 0 && (
            <Badge className="absolute right-2 top-2" variant="secondary">
              已售罄
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2 font-semibold leading-snug">{title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">¥{price.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground">库存 {quantity}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
