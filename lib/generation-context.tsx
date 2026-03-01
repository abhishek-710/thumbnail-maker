"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { useAuth } from "./auth-context"
import type { Generation } from "@/lib/types"

interface GenerationContextType {
  generations: Generation[]
  addGeneration: (gen: Generation) => void
  removeGeneration: (id: string) => void
  getGenerations: () => Generation[]
  fetchGenerations: () => Promise<void>
  loading: boolean
}

const GenerationContext = createContext<GenerationContextType | null>(null)

export function GenerationProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(false)

  const fetchGenerations = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await fetch("/api/generations", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setGenerations(data.generations)
      }
    } catch (err) {
      console.error("[v0] Failed to fetch generations:", err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchGenerations()
  }, [token, fetchGenerations])

  const addGeneration = useCallback((gen: Generation) => {
    setGenerations((prev) => [gen, ...prev])
  }, [])

  const removeGeneration = useCallback(async (id: string) => {
    if (!token) return
    try {
      await fetch(`/api/generations?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      setGenerations((prev) => prev.filter((g) => g.id !== id))
    } catch (err) {
      console.error("[v0] Failed to delete generation:", err)
    }
  }, [token])

  const getGenerations = useCallback(() => {
    return generations
  }, [generations])

  return (
    <GenerationContext.Provider value={{ generations, addGeneration, removeGeneration, getGenerations, fetchGenerations, loading }}>
      {children}
    </GenerationContext.Provider>
  )
}

export function useGenerations() {
  const context = useContext(GenerationContext)
  if (!context) {
    throw new Error("useGenerations must be used within a GenerationProvider")
  }
  return context
}
