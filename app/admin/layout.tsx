"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Users, Package, Tags, ShoppingCart, LineChart,
  ChevronLeft, Menu, X, ScrollText
} from "lucide-react"

const navItems = [
  { href: "/admin", label: "数据概览", icon: LayoutDashboard },
  { href: "/admin/users", label: "用户管理", icon: Users },
  { href: "/admin/products", label: "商品管理", icon: Package },
  { href: "/admin/categories", label: "类别管理", icon: Tags },
  { href: "/admin/orders", label: "订单管理", icon: ShoppingCart },
  { href: "/admin/analytics", label: "分析预测", icon: LineChart },
  { href: "/admin/operation-logs", label: "操作日志", icon: ScrollText },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white rounded shadow"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-56 bg-slate-900 text-white flex flex-col
        transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <span className="text-xl">🔧</span> 管理后台
          </h1>
          <p className="text-xs text-slate-400 mt-1">二手市场 · 管理员</p>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-6 py-3 text-sm transition-colors
                  ${active
                    ? "bg-slate-800 text-white border-l-4 border-blue-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"}
                `}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← 返回网站
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
