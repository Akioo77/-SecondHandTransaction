"use client"

import { useEffect, useState } from "react"
import { authApi } from "@/lib/api"

interface User {
  id: number
  username: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await authApi.getProfile()
      if (response.data) {
        setUser(response.data as User)
      }
    } catch (error) {
      console.log("[v0] Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    document.cookie = "ID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    setUser(null)
  }

  return { user, loading, logout, refetch: checkAuth }
}
