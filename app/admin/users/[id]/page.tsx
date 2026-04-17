"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { adminApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, ShoppingCart, TrendingUp, Eye, Package, Star, User } from "lucide-react"

const POWER_COLOR: Record<string, string> = {
  "高": "bg-red-100 text-red-700",
  "中": "bg-amber-100 text-amber-700",
  "低": "bg-slate-100 text-slate-600",
}
const PREF_COLOR: Record<string, string> = {
  "高": "bg-red-50 text-red-600 border border-red-200",
  "中": "bg-amber-50 text-amber-600 border border-amber-200",
  "低": "bg-slate-50 text-slate-400",
}

export default function UserDetailPage() {
  const params = useParams()
  const userId = Number(params.id)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    adminApi.getUserProfile(userId)
      .then(r => { if (r.data) setProfile(r.data) })
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><span className="text-slate-400">加载中...</span></div>
  }

  if (!profile) {
    return <div className="text-center text-slate-400 py-20">用户不存在</div>
  }

  const power = profile.purchasePower
  const prefs = profile.categoryPreferences ?? []
  const stats = profile.behaviorStats

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm">
          <ArrowLeft size={16} /> 返回用户列表
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
          <User size={24} className="text-slate-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{profile.username}</h2>
          <p className="text-slate-400 text-sm">ID #{profile.userId}</p>
        </div>
      </div>

      {/* Info cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <MapPin size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">登录地区</p>
              <p className="font-bold text-slate-800">{profile.region}</p>
              <p className="text-xs text-slate-400">IP: {profile.lastLoginIp}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <ShoppingCart size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">累计消费</p>
              <p className="font-bold text-slate-800">¥{Number(power?.totalSpend ?? 0).toLocaleString()}</p>
              <p className="text-xs text-slate-400">客单价 ¥{Number(power?.avgOrderAmount ?? 0).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <TrendingUp size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">购买力</p>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${POWER_COLOR[power?.level ?? '低']}`}>
                  {power?.level ?? "低"}
                </span>
              </div>
              <p className="text-xs text-slate-400">完成 {power?.completedOrders ?? 0} 笔订单</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50">
              <Package size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">注册时间</p>
              <p className="font-bold text-slate-800 text-sm">
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("zh-CN") : "—"}
              </p>
              <p className="text-xs text-slate-400">活跃 {stats?.activeDays ?? 0} 天</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            🛍️ 品类偏好
            <span className="text-xs font-normal text-slate-400 ml-2">
              基于浏览和购买记录分析
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prefs.length > 0 ? (
            <div className="space-y-3">
              {prefs.map((pref: any) => (
                <div key={pref.categoryId} className={`p-4 rounded-lg ${PREF_COLOR[pref.preferenceLevel ?? '低']}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-800">{pref.categoryName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PREF_COLOR[pref.preferenceLevel ?? '低']}`}>
                        {pref.preferenceLevel === "高" ? "🔥 高偏好" : pref.preferenceLevel === "中" ? "📈 中偏好" : "📉 低偏好"}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      ¥{Number(pref.spend ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-6 text-xs text-slate-500">
                    <span>👁️ 浏览 {pref.viewCount} 次</span>
                    <span>🛒 购买 {pref.buyCount} 次</span>
                  </div>
                  {/* 浏览进度条 */}
                  <div className="mt-2 bg-white/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all"
                      style={{ width: `${Math.min(100, pref.viewCount * 8)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-6">暂无浏览和购买数据</p>
          )}
        </CardContent>
      </Card>

      {/* Behavior stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📊 行为统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <Eye size={20} className="mx-auto text-slate-400 mb-1" />
              <p className="text-xl font-bold text-slate-700">{stats?.totalViews ?? 0}</p>
              <p className="text-xs text-slate-400">浏览商品</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <ShoppingCart size={20} className="mx-auto text-slate-400 mb-1" />
              <p className="text-xl font-bold text-slate-700">{stats?.buyCount ?? 0}</p>
              <p className="text-xs text-slate-400">购买次数</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <Package size={20} className="mx-auto text-slate-400 mb-1" />
              <p className="text-xl font-bold text-slate-700">{stats?.publishCount ?? 0}</p>
              <p className="text-xs text-slate-400">发布商品</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <TrendingUp size={20} className="mx-auto text-slate-400 mb-1" />
              <p className="text-xl font-bold text-slate-700">{stats?.sellCount ?? 0}</p>
              <p className="text-xs text-slate-400">卖出次数</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <Star size={20} className="mx-auto text-slate-400 mb-1" />
              <p className="text-xl font-bold text-slate-700">{stats?.activeDays ?? 0}</p>
              <p className="text-xs text-slate-400">活跃天数</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
