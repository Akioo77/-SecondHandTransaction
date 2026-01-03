const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://api.secondhand.e3nq.com:81"

interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

    return { data: data as T }
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

  getDetail: (id: number) => fetchApi(`/api/products/${id}`, { method: "GET" }),

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

  updateStatus: (id: number, status: number) =>
    fetchApi(`/api/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
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
      body: JSON.stringify({ id: userId, itemId }),
    }),

  remove: (userId: number, itemId: number) =>
    fetchApi("/api/users/favorites/remove", {
      method: "POST",
      body: JSON.stringify({ id: userId, itemId }),
    }),

  isFavorite: (userId: number, itemId: number) =>
    fetchApi<boolean>("/api/users/favorites/isFavorite", {
      method: "POST",
      body: JSON.stringify({ id: userId, itemId }),
    }),

  getList: (userId: number) =>
    fetchApi("/api/users/favorites/", {
      method: "POST",
      body: JSON.stringify({ id: userId }),
    }),
}
