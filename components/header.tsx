"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, ShoppingBag, Heart, User, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [searchKeyword, setSearchKeyword] = useState("")

  const handleLogout = () => {
    logout()
    router.push("/")
    router.refresh()
  }

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      router.push(`/products?keyword=${encodeURIComponent(searchKeyword.trim())}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">二手市场</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              首页
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              商品
            </Link>
            <Link
              href="/analytics"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              数据分析
            </Link>
            <Link
              href="/admin"
              className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-700 flex items-center gap-1"
              title="管理后台"
            >
              <Shield size={14} />
              管理
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="hidden w-full max-w-md md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索商品..."
                className="w-full pl-10"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/favorites">
                <Heart className="h-5 w-5" />
                <span className="sr-only">收藏</span>
              </Link>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">用户菜单</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium">{user.username}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/my-products">我的商品</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">我的订单</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/analytics">数据分析</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>退出登录</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/login">登录</Link>
                </Button>
                <Button asChild className="hidden sm:inline-flex">
                  <Link href="/register">注册</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
