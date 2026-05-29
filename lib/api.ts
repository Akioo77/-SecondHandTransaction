const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://124.220.49.156"

interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    console.log(`[API] ${options?.method || "GET"} ${url}`)
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      credentials: "include",
    })

    const contentType = response.headers.get("content-type")
    const isJson = contentType?.includes("application/json")

    const data = isJson ? await response.json() : await response.text()

    if (!response.ok) {
      return {
        error: typeof data === "object" ? data.message || data.reason || "Request failed" : data,
      }
    }

    // 自动拆掉 Result 包装（{code, message, data} → 直接返回 data）
    // analytics 接口的 data 本身又是一个 {data:[...]} 结构，再拆一层
    const raw = data as any
    let unwrapped = (raw && typeof raw === "object" && "code" in raw && "data" in raw) ? raw.data : raw
    if (unwrapped && typeof unwrapped === "object" && "data" in unwrapped && Array.isArray((unwrapped as any).data)) {
      unwrapped = (unwrapped as any).data
    }

    return { data: unwrapped as T }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
    }
  }
}

// Auth API
export const authApi = {
  register: (username: string, password: string) =>
    fetchApi("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  login: (username: string, password: string) =>
    fetchApi("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  getProfile: () => fetchApi("/api/users/profile", { method: "GET" }),

  updatePassword: (id: number, newPassword: string) =>
    fetchApi(`/api/users/updatePassword?id=${id}`, {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    }),

  changePassword: (oldPassword: string, newPassword: string) =>
    fetchApi("/api/users/changePassword", {
      method: "PUT",
      body: JSON.stringify({ oldPassword, newPassword }),
    }),

  deleteAccount: () =>
    fetchApi("/api/users/deleteAccount", {
      method: "DELETE",
    }),
}

// Product API
export const productApi = {
  getList: (params?: { categoryId?: number; sellerId?: number; keyword?: string }) => {
    const query = new URLSearchParams()
    if (params?.categoryId) query.append("categoryId", String(params.categoryId))
    if (params?.sellerId) query.append("sellerId", String(params.sellerId))
    if (params?.keyword) query.append("keyword", params.keyword)
    const queryStr = query.toString()
    return fetchApi(`/api/products${queryStr ? `?${queryStr}` : ""}`, { method: "GET" })
  },

  getDetail: (id: number, viewerId?: number) =>
    fetchApi(`/api/products/${id}${viewerId ? `?viewerId=${viewerId}` : ""}`, { method: "GET" }),

  publish: (data: {
    sellerId: number
    categoryId: number
    title: string
    price: number
    quantity: number
    images?: string
  }) =>
    fetchApi("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: number,
    data: {
      categoryId?: number
      title?: string
      price?: number
      quantity?: number
      images?: string
      isDeleted?: number
    },
  ) =>
    fetchApi(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  updateBySeller: (
    id: number,
    sellerId: number,
    data: {
      categoryId?: number
      title?: string
      price?: number
      quantity?: number
      images?: string
      isDeleted?: number
    },
  ) =>
    fetchApi(`/api/products/${id}/seller?sellerId=${sellerId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) => fetchApi(`/api/products/${id}`, { method: "DELETE" }),
}

// Category API
export const categoryApi = {
  getList: () => fetchApi("/api/categories", { method: "GET" }),

  getDetail: (id: number) => fetchApi(`/api/categories/${id}`, { method: "GET" }),

  create: (name: string) =>
    fetchApi("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  update: (id: number, name: string) =>
    fetchApi(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),

  delete: (id: number) => fetchApi(`/api/categories/${id}`, { method: "DELETE" }),
}

// Order API - status values: 10(placed), 40(completed), 50(canceled)
export const orderApi = {
  create: (productId: number, buyerId: number, quantity: number) =>
    fetchApi("/api/orders", {
      method: "POST",
      body: JSON.stringify({ productId, buyerId, quantity }),
    }),

  getDetail: (id: number) => fetchApi(`/api/orders/${id}`, { method: "GET" }),

  getList: (params?: { buyerId?: number; sellerId?: number; status?: number }) => {
    const query = new URLSearchParams()
    if (params?.buyerId) query.append("buyerId", String(params.buyerId))
    if (params?.sellerId) query.append("sellerId", String(params.sellerId))
    if (params?.status !== undefined) query.append("status", String(params.status))
    const queryStr = query.toString()
    return fetchApi(`/api/orders${queryStr ? `?${queryStr}` : ""}`, { method: "GET" })
  },

  updateStatus: (id: number, status: number, userId: number) =>
    fetchApi(`/api/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, userId }),
    }),

  updateShipping: (
    id: number,
    data: {
      buyerId: number
      receiverName: string
      receiverPhone: string
      receiverAddress: string
    },
  ) =>
    fetchApi(`/api/orders/${id}/shipping`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getSalesSummary: (sellerId: number) =>
    fetchApi<{ sellerId: number; totalQuantity: number; totalAmount: number }>(
      `/api/orders/sales-summary?sellerId=${sellerId}`,
      { method: "GET" },
    ),

  getSellerShipping: (sellerId: number, status?: number) => {
    const query = new URLSearchParams()
    query.append("sellerId", String(sellerId))
    if (status !== undefined) query.append("status", String(status))
    return fetchApi(`/api/orders/seller/${sellerId}/shipping?${query.toString()}`, { method: "GET" })
  },
}

// Favorite API
export const favoriteApi = {
  add: (userId: number, itemId: number) =>
    fetchApi("/api/users/favorites/add", {
      method: "POST",
      body: JSON.stringify({ userId, productId }),
    }),

  remove: (userId: number, itemId: number) =>
    fetchApi("/api/users/favorites/remove", {
      method: "POST",
      body: JSON.stringify({ userId, productId }),
    }),

  isFavorite: (userId: number, itemId: number) =>
    fetchApi<boolean>("/api/users/favorites/isFavorite", {
      method: "POST",
      body: JSON.stringify({ userId, productId }),
    }),

  getList: (userId: number) =>
    fetchApi("/api/users/favorites/", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),
}

// Analytics API
export const analyticsApi = {
  // 用户画像（地域 + 购买力 + 品类偏好）
  getUserPortrait: () =>
    fetchApi<{
      totalUsers: number; activeUsers: number;
      regionDistribution: Record<string, number>;
      purchasePowerDistribution: Record<string, number>;
      categoryPreference: Record<string, number>;
    }>("/api/analytics/user-portrait", { method: "GET" }),

  // 销售排行榜
  getSalesRanking: (limit = 10) =>
    fetchApi<{
      productId: number; productTitle: string; categoryId: number;
      categoryName: string; price: number; salesCount: number;
      salesAmount: number; viewCount: number; favoriteCount: number;
    }[]>(`/api/analytics/sales-ranking?limit=${limit}`, { method: "GET" }),

  // 销售趋势（日）
  getDailyTrend: (days = 30) =>
    fetchApi<{
      date: string; orderCount: number; soldQuantity: number;
      salesAmount: number; viewCount: number;
    }[]>(`/api/analytics/sales-trend/daily?days=${days}`, { method: "GET" }),

  // 销售趋势（月）
  getMonthlyTrend: (months = 6) =>
    fetchApi<{
      month: string; orderCount: number; soldQuantity: number; salesAmount: number;
    }[]>(`/api/analytics/sales-trend/monthly?months=${months}`, { method: "GET" }),

  // 趋势研判（环比涨跌 + 运营建议）
  getTrendAnalysis: (days = 7) =>
    fetchApi<{
      currentSales: number; previousSales: number; salesChangePct: number;
      currentSoldQty: number; previousSoldQty: number; qtyChangePct: number;
      trend: string; advice: string;
    }>(`/api/analytics/trend-analysis?days=${days}`, { method: "GET" }),

  // 品类分析
  getCategoryAnalysis: () =>
    fetchApi<{
      categoryId: number; categoryName: string; productCount: number;
      soldQuantity: number; totalSalesAmount: number; avgPrice: number;
    }[]>("/api/analytics/category-analysis", { method: "GET" }),

  // 供需监控
  getSupplyDemand: () =>
    fetchApi<{
      categoryId: number; categoryName: string;
      supply: number; demand: number; status: string;
    }[]>("/api/analytics/supply-demand", { method: "GET" }),

  // 商品浏览趋势（单品分析）
  getProductTrend: (productId: number, days = 14) =>
    fetchApi<{
      dailyViews: Record<string, number>;
      totalViews: number; uniqueUsers: number; peakDay: string;
    }>(`/api/analytics/product-trend?productId=${productId}&days=${days}`, { method: "GET" }),

  // 看了又买（协同过滤推荐）
  getAlsoBought: (productId: number, limit = 6) =>
    fetchApi<{
      productId: number; title: string; price: number;
      salesCount: number; viewCount: number; reason: string;
    }[]>(`/api/analytics/also-bought?productId=${productId}&limit=${limit}`, { method: "GET" }),

  // 热销推荐（首页）
  getRecommendations: (limit = 10) =>
    fetchApi<{
      productId: number; title: string; price: number;
      salesCount: number; viewCount: number; reason: string;
    }[]>(`/api/analytics/recommendations?limit=${limit}`, { method: "GET" }),

  // 个性化首页推荐（基于用户品类偏好）
  getPersonalized: (userId: number, limit = 10) =>
    fetchApi<{
      productId: number; title: string; price: number;
      salesCount: number; viewCount: number; reason: string;
    }[]>(`/api/analytics/personalized?userId=${userId}&limit=${limit}`, { method: "GET" }),

  // 销售异常摘要（仪表盘用）
  getAnomalySummary: () =>
    fetchApi<{
      totalAnomalies: number; dangerCount: number; warningCount: number;
      level: string; anomalies: AnomalyItem[];
    }>(`/api/analytics/anomaly-summary`, { method: "GET" }),

  // 销售趋势预测
  getForecast: (historyDays = 30, forecastDays = 7) =>
    fetchApi<ForecastData>(`/api/analytics/forecast?historyDays=${historyDays}&forecastDays=${forecastDays}`, { method: "GET" }),
}

type ForecastData = {
  trend: string; slope: number; rSquared: number; confidence: string;
  forecast: { date: string; predictedOrders: number; predictedRevenue: number; lowerBound: number; upperBound: number }[];
  summary: Record<string, any>;
}

type AnomalyItem = {
  type: string; level: string; description: string; detail: string; detectedAt: string;
}

// Admin API
export const adminApi = {
  getStats: () => fetchApi<{
    totalUsers: number; totalProducts: number; totalOrders: number;
    totalRevenue: number; pendingOrders: number; topProducts: any[];
  }>("/api/admin/stats", { method: "GET" }),

  getUsers: () => fetchApi<any[]>("/api/admin/users", { method: "GET" }),

  updateUserStatus: (id: number, enabled: boolean) =>
    fetchApi(`/api/admin/users/${id}/status?enabled=${enabled}`, { method: "PUT" }),

  updateUserPassword: (id: number, password: string) =>
    fetchApi(`/api/admin/users/${id}/password`, {
      method: "PUT",
      body: JSON.stringify({ password }),
    }),

  deleteUser: (id: number) =>
    fetchApi(`/api/admin/users/${id}`, { method: "DELETE" }),

  getProducts: () => fetchApi<any[]>("/api/admin/products", { method: "GET" }),

  updateProduct: (id: number, updates: { price?: number; quantity?: number; categoryId?: number }) =>
    fetchApi(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  getCategories: () => fetchApi<any[]>("/api/admin/categories", { method: "GET" }),

  addCategory: (name: string) =>
    fetchApi("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  deleteCategory: (id: number) =>
    fetchApi(`/api/admin/categories/${id}`, { method: "DELETE" }),

  getOrders: () => fetchApi<any[]>("/api/admin/orders", { method: "GET" }),

  cancelOrder: (id: number) =>
    fetchApi(`/api/admin/orders/${id}/cancel`, { method: "POST" }),
  getSalesTrend: () => fetchApi<{ daily: any[] }>("/api/admin/sales-trend", { method: "GET" }),

  getOperationLogs: (action?: string, targetType?: string) => {
    let url = "/api/admin/operation-logs"
    const params = []
    if (action) params.push(`action=${action}`)
    if (targetType) params.push(`targetType=${targetType}`)
    if (params.length > 0) url += "?" + params.join("&")
    return fetchApi<OperationLogEntry[]>(url, { method: "GET" })
  },

  getUserProfile: (userId: number) =>
    fetchApi<UserProfileData>(`/api/admin/users/${userId}/profile`, { method: "GET" }),
}

type UserProfileData = {
  userId: number; username: string; region: string; lastLoginIp: string; createdAt: string;
  purchasePower: { totalSpend: number; orderCount: number; completedOrders: number; avgOrderAmount: number; level: string };
  categoryPreferences: { categoryName: string; categoryId: number; viewCount: number; buyCount: number; spend: number; preferenceLevel: string }[];
  behaviorStats: { totalViews: number; totalFavorites: number; publishCount: number; buyCount: number; sellCount: number; activeDays: number };
}

type OperationLogEntry = {
  id: number; operatorAccount: string; operatorRole: string; action: string;
  description: string; targetType: string; targetId: number;
  beforeState: string; afterState: string; ipAddress: string; createdAt: string;
}
