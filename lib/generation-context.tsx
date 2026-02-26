"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type { Generation } from "@/lib/types"

interface GenerationContextType {
  generations: Generation[]
  addGeneration: (gen: Generation) => void
  removeGeneration: (id: string) => void
  getGenerations: () => Generation[]
}

const GenerationContext = createContext<GenerationContextType | null>(null)

export function GenerationProvider({ children }: { children: React.ReactNode }) {
  const [generations, setGenerations] = useState<Generation[]>([])

  const addGeneration = useCallback((gen: Generation) => {
    setGenerations((prev) => [gen, ...prev])
  }, [])

  const removeGeneration = useCallback((id: string) => {
    setGenerations((prev) => prev.filter((g) => g.id !== id))
  }, [])

  const getGenerations = useCallback(() => {
    return generations
  }, [generations])

  return (
    <GenerationContext.Provider value={{ generations, addGeneration, removeGeneration, getGenerations }}>
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
