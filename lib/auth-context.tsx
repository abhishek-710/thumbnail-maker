"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateCredits: (newAmount: number) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedToken = typeof window !== "undefined" ? localStorage.getItem("thumbcraft_token") : null
    const savedUser = typeof window !== "undefined" ? localStorage.getItem("thumbcraft_user") : null
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem("thumbcraft_token")
        localStorage.removeItem("thumbcraft_user")
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Login failed")
    }

    const data = await response.json()
    const userObj: User = {
      id: data.user.id,
      name: email.split("@")[0],
      email: data.user.email,
      credits: data.user.credits,
      createdAt: new Date().toISOString(),
    }
    const fakeToken = data.user.id

    setUser(userObj)
    setToken(fakeToken)
    localStorage.setItem("thumbcraft_token", fakeToken)
    localStorage.setItem("thumbcraft_user", JSON.stringify(userObj))
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Signup failed")
    }

    const data = await response.json()
    const userObj: User = {
      id: data.user.id,
      name: data.user.email.split("@")[0],
      email: data.user.email,
      credits: data.user.credits,
      createdAt: new Date().toISOString(),
    }
    const fakeToken = data.user.id

    setUser(userObj)
    setToken(fakeToken)
    localStorage.setItem("thumbcraft_token", fakeToken)
    localStorage.setItem("thumbcraft_user", JSON.stringify(userObj))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("thumbcraft_token")
    localStorage.removeItem("thumbcraft_user")
  }, [])

  const updateCredits = useCallback((newAmount: number) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, credits: newAmount }
      localStorage.setItem("thumbcraft_user", JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        signup,
        logout,
        updateCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
