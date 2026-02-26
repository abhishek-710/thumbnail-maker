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

// In-memory user store for demo (simulates MongoDB)
interface StoredUser {
  id: string
  name: string
  email: string
  password: string
  credits: number
  createdAt: string
}

let usersDb: StoredUser[] = []

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedToken = typeof window !== "undefined" ? sessionStorage.getItem("thumbcraft_token") : null
    const savedUser = typeof window !== "undefined" ? sessionStorage.getItem("thumbcraft_user") : null
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        sessionStorage.removeItem("thumbcraft_token")
        sessionStorage.removeItem("thumbcraft_user")
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const found = usersDb.find((u) => u.email === email.toLowerCase())
    if (!found || found.password !== password) {
      throw new Error("Invalid email or password")
    }
    const userObj: User = {
      id: found.id,
      name: found.name,
      email: found.email,
      credits: found.credits,
      createdAt: found.createdAt,
    }
    const fakeToken = "jwt_" + generateId()
    setUser(userObj)
    setToken(fakeToken)
    sessionStorage.setItem("thumbcraft_token", fakeToken)
    sessionStorage.setItem("thumbcraft_user", JSON.stringify(userObj))
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const exists = usersDb.find((u) => u.email === email.toLowerCase())
    if (exists) {
      throw new Error("An account with this email already exists")
    }
    const newUser: StoredUser = {
      id: generateId(),
      name,
      email: email.toLowerCase(),
      password,
      credits: 50,
      createdAt: new Date().toISOString(),
    }
    usersDb.push(newUser)
    const userObj: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      credits: newUser.credits,
      createdAt: newUser.createdAt,
    }
    const fakeToken = "jwt_" + generateId()
    setUser(userObj)
    setToken(fakeToken)
    sessionStorage.setItem("thumbcraft_token", fakeToken)
    sessionStorage.setItem("thumbcraft_user", JSON.stringify(userObj))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    sessionStorage.removeItem("thumbcraft_token")
    sessionStorage.removeItem("thumbcraft_user")
  }, [])

  const updateCredits = useCallback((newAmount: number) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, credits: newAmount }
      sessionStorage.setItem("thumbcraft_user", JSON.stringify(updated))
      // Update in-memory DB too
      const dbUser = usersDb.find((u) => u.id === prev.id)
      if (dbUser) dbUser.credits = newAmount
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
