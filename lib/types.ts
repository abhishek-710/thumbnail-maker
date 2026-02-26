export interface User {
  id: string
  name: string
  email: string
  credits: number
  createdAt: string
}

export interface GenerationOptions {
  style: string
  size: string
  width: number
  height: number
  platform: string
  colorScheme: string
  textOverlay: string
  variations: number
  model: string
}

export interface Generation {
  id: string
  userId: string
  prompt: string
  imageUrls: string[]
  options: GenerationOptions
  creditsCost: number
  status: "pending" | "completed" | "failed"
  createdAt: string
}

export interface Transaction {
  id: string
  userId: string
  planId: string
  planName: string
  creditsAdded: number
  amountPaid: number
  currency: string
  status: "pending" | "completed" | "failed"
  createdAt: string
}

export interface PricingPlan {
  id: string
  name: string
  credits: number
  price: number
  priceInCents: number
  perCredit: string
  popular: boolean
  features: string[]
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

export interface GenerateRequest {
  prompt: string
  style: string
  size: string
  width: number
  height: number
  platform: string
  colorScheme: string
  textOverlay: string
  variations: number
  model: string
}
