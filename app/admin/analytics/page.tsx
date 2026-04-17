"use client"

import React, { useEffect, useState } from "react"
import { analyticsApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react"

export default function AdminAnalyticsPage() {
  const [forecast, setForecast] = useState<any>(null)
  const [trend, setTrend] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsApi.getForecast(30, 7),
      analyticsApi.getTrendAnalysis(7),
    ]).then(([f, t]) => {
      if (f.data) setForecast(f.data)
      if (t.data) setTrend(t.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><span className="text-slate-400">加载中...</span></div>
  }

  const TrendIcon = forecast?.trend === "上涨" ? TrendingUp
    : forecast?.trend === "下跌" ? TrendingDown : Minus

  const trendColor = forecast?.trend === "上涨" ? "text-green-600 bg-green-50"
    : forecast?.trend === "下跌" ? "text-red-600 bg-red-50"
    : "text-slate-600 bg-slate-50"

  const maxForecast = forecast?.forecast
    ? Math.max(...forecast.forecast.map((f: any) => f.upperBound))
    : 1

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">销售趋势预测</h2>
        <p className="text-slate-500 text-sm mt-1">基于近30天历史数据的线性回归预测</p>
      </div>

      {/* Trend summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500 mb-1">趋势判断</p>
            <div className="flex items-center gap-2">
              <TrendIcon size={20} className={forecast?.trend === "上涨" ? "text-green-600" : forecast?.trend === "下跌" ? "text-red-600" : "text-slate-600"} />
              <span className="text-xl font-bold">{forecast?.trend ?? "—"}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500 mb-1">日均订单</p>
            <p className="text-xl font-bold">{forecast?.summary?.avgDailyOrders ?? 0} <span className="text-sm font-normal text-slate-400">单/天</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500 mb-1">预测置信度</p>
            <p className="text-xl font-bold">{forecast?.confidence ?? "—"}</p>
            <p className="text-xs text-slate-400">R² = {forecast?.rSquared?.toFixed(2) ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500 mb-1">预测日增量</p>
            <p className="text-xl font-bold">{forecast?.slope >= 0 ? "+" : ""}{forecast?.slope?.toFixed(2) ?? 0}</p>
            <p className="text-xs text-slate-400">单/天</p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 未来7天销售预测
            <span className="text-xs font-normal text-slate-400 ml-2">
              ({forecast?.forecast?.[0]?.date} ~ {forecast?.forecast?.[forecast?.forecast?.length - 1]?.date})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {forecast?.forecast?.length > 0 ? (
            <div className="space-y-3">
              {forecast.forecast.map((day: any, i: number) => (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-24 shrink-0">{day.date}</span>
                  <div className="flex-1 relative">
                    {/* 置信区间背景 */}
                    <div className="absolute inset-0 bg-blue-50 rounded-full h-8 overflow-hidden">
                      <div
                        className="absolute left-0 h-full bg-blue-100 rounded-full opacity-60"
                        style={{
                          width: `${Math.min(100, (day.upperBound / maxForecast) * 100)}%`
                        }}
                      />
                    </div>
                    {/* 预测柱 */}
                    <div
                      className="relative bg-gradient-to-r from-blue-400 to-blue-600 rounded-full h-8 flex items-center justify-end pr-3"
                      style={{ width: `${Math.min(100, (day.predictedOrders / maxForecast) * 100)}%` }}
                    >
                      <span className="text-xs text-white font-medium whitespace-nowrap">
                        预测 {day.predictedOrders} 单
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 w-36 shrink-0 text-right">
                    区间 [{day.lowerBound}, {day.upperBound}]
                  </div>
                  <ArrowRight size={14} className="text-slate-300 shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">暂无预测数据</p>
          )}

          <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
            <span>📈 柱状图高度 = 预测订单数</span>
            <span>🔵 背景色 = 95%置信区间</span>
            <span>R² = {forecast?.rSquared?.toFixed(3) ?? "—"}（越高越准）</span>
          </div>
        </CardContent>
      </Card>

      {/* Trend analysis card */}
      {trend && (
        <Card className={
          trend.trend === "上涨" ? "border-green-200 bg-green-50"
          : trend.trend === "下跌" ? "border-red-200 bg-red-50"
          : "border-slate-200"
        }>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {trend.trend === "上涨" ? <TrendingUp size={18} className="text-green-600" />
               : trend.trend === "下跌" ? <TrendingDown size={18} className="text-red-600" />
               : <Minus size={18} className="text-slate-600" />}
              趋势研判（近7天 vs 上一个7天）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-slate-500">本期销售额</p>
                <p className="text-lg font-bold">¥{(trend.currentSales ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">上期销售额</p>
                <p className="text-lg font-bold">¥{(trend.previousSales ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">销售额变化</p>
                <p className={`text-lg font-bold ${(trend.salesChangePct ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {(trend.salesChangePct ?? 0) >= 0 ? "+" : ""}{(trend.salesChangePct ?? 0).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">运营建议</p>
                <p className="text-sm text-slate-700">{trend.advice ?? "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
