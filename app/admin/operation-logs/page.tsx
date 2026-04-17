"use client"

import React, { useEffect, useState } from "react"
import { adminApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const ACTION_LABELS: Record<string, string> = {
  USER_ENABLE: "启用用户",
  USER_DISABLE: "禁用用户",
  USER_PASSWORD_RESET: "重置密码",
  PRODUCT_UPDATE: "修改商品",
  CATEGORY_ADD: "新增分类",
  CATEGORY_DELETE: "删除分类",
}

const ACTION_COLORS: Record<string, string> = {
  USER_ENABLE: "bg-green-100 text-green-700",
  USER_DISABLE: "bg-red-100 text-red-700",
  USER_PASSWORD_RESET: "bg-orange-100 text-orange-700",
  PRODUCT_UPDATE: "bg-blue-100 text-blue-700",
  CATEGORY_ADD: "bg-emerald-100 text-emerald-700",
  CATEGORY_DELETE: "bg-rose-100 text-rose-700",
}

const TARGET_TYPES = ["全部", "USER", "PRODUCT", "CATEGORY"]
const ACTIONS = ["全部", "USER_ENABLE", "USER_DISABLE", "USER_PASSWORD_RESET", "PRODUCT_UPDATE", "CATEGORY_ADD", "CATEGORY_DELETE"]

export default function OperationLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState("")
  const [filterAction, setFilterAction] = useState("")

  const load = () => {
    setLoading(true)
    adminApi.getOperationLogs(
      filterAction && filterAction !== "全部" ? filterAction : undefined,
      filterType && filterType !== "全部" ? filterType : undefined,
    ).then(r => { if (r.data) setLogs(r.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filterType, filterAction])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">操作日志</h2>
          <p className="text-slate-500 text-sm mt-1">记录所有管理员操作，可追溯历史行为</p>
        </div>
        <div className="flex items-center gap-3">
          {/* 目标类型筛选 */}
          <select
            className="text-sm border rounded-lg px-3 py-2 bg-white"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            {TARGET_TYPES.map(t => <option key={t} value={t === "全部" ? "" : t}>{t}</option>)}
          </select>
          {/* 操作类型筛选 */}
          <select
            className="text-sm border rounded-lg px-3 py-2 bg-white"
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
          >
            {ACTIONS.map(a => <option key={a} value={a === "全部" ? "" : a}>{ACTION_LABELS[a] ?? a}</option>)}
          </select>
          <button
            onClick={load}
            className="text-sm px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700"
          >
            刷新
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500 border-b">
                <th className="px-5 py-3 font-medium">时间</th>
                <th className="px-5 py-3 font-medium">操作人</th>
                <th className="px-5 py-3 font-medium">操作类型</th>
                <th className="px-5 py-3 font-medium">描述</th>
                <th className="px-5 py-3 font-medium">操作IP</th>
                <th className="px-5 py-3 font-medium">变更详情</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString("zh-CN") : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-medium text-slate-700">{log.operatorAccount}</span>
                    <Badge variant="outline" className="ml-1 text-xs">{log.operatorRole}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${ACTION_COLORS[log.action] ?? "bg-slate-100 text-slate-600"}`}>
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 max-w-xs truncate" title={log.description}>
                    {log.description}
                  </td>
                  <td className="px-5 py-3 text-slate-400 font-mono text-xs">{log.ipAddress}</td>
                  <td className="px-5 py-3 text-xs text-slate-500 max-w-xs">
                    {log.beforeState && log.beforeState !== "—" && (
                      <div className="text-red-400">- {log.beforeState}</div>
                    )}
                    {log.afterState && log.afterState !== "—" && (
                      <div className="text-green-600">+ {log.afterState}</div>
                    )}
                    {(!log.beforeState || log.beforeState === "—") && (!log.afterState || log.afterState === "—") && (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-8 text-center text-slate-400">加载中...</div>}
          {!loading && logs.length === 0 && (
            <div className="p-12 text-center text-slate-400">暂无操作记录</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
