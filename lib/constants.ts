// Art styles for thumbnail generation
export const ART_STYLES = [
  { value: "realistic", label: "Realistic", promptModifier: "ultra realistic, photographic, highly detailed, sharp focus", icon: "Camera" },
  { value: "cartoon", label: "Cartoon", promptModifier: "cartoon style, vibrant colors, animated, fun", icon: "Palette" },
  { value: "3d-render", label: "3D Render", promptModifier: "3D rendered, octane render, volumetric lighting, high quality", icon: "Box" },
  { value: "anime", label: "Anime", promptModifier: "anime style, manga inspired, Japanese animation, detailed", icon: "Sparkles" },
  { value: "flat-design", label: "Flat Design", promptModifier: "flat design, minimalist, clean vectors, modern", icon: "LayoutGrid" },
  { value: "watercolor", label: "Watercolor", promptModifier: "watercolor painting, artistic, soft brushstrokes, elegant", icon: "Droplets" },
  { value: "cinematic", label: "Cinematic", promptModifier: "cinematic, dramatic lighting, film still, epic composition", icon: "Film" },
  { value: "neon-glow", label: "Neon Glow", promptModifier: "neon glow, cyberpunk, bright neon colors, dark background, electric", icon: "Zap" },
] as const

// Size presets by platform (Infip supports: 1024x1024, 1792x1024, 1024x1792)
export const SIZE_PRESETS = [
  { value: "square", label: "Square (1024x1024)", width: 1024, height: 1024, platform: "Universal" },
  { value: "landscape", label: "Landscape (1792x1024)", width: 1792, height: 1024, platform: "Landscape" },
  { value: "portrait", label: "Portrait (1024x1792)", width: 1024, height: 1792, platform: "Portrait" },
] as const

// Color schemes
export const COLOR_SCHEMES = [
  { value: "vibrant", label: "Vibrant", promptModifier: "vibrant saturated colors, colorful", color: "#ef4444" },
  { value: "dark", label: "Dark", promptModifier: "dark moody atmosphere, deep shadows, dramatic", color: "#1a1a2e" },
  { value: "pastel", label: "Pastel", promptModifier: "soft pastel color palette, gentle, dreamy", color: "#f9a8d4" },
  { value: "monochrome", label: "Mono", promptModifier: "black and white, monochromatic, grayscale", color: "#6b7280" },
  { value: "warm", label: "Warm", promptModifier: "warm golden tones, amber lighting, sunset feel", color: "#f59e0b" },
  { value: "cool", label: "Cool", promptModifier: "cool blue tones, icy atmosphere, serene", color: "#3b82f6" },
  { value: "neon", label: "Neon", promptModifier: "neon bright colors, electric, glowing, vivid", color: "#a855f7" },
] as const

// Pricing plans
export const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 100,
    price: 4.99,
    priceInCents: 499,
    perCredit: "0.05",
    popular: false,
    features: ["100 credits", "~20 thumbnails", "All styles & sizes", "Download in HD"],
  },
  {
    id: "creator",
    name: "Creator Pack",
    credits: 300,
    price: 9.99,
    priceInCents: 999,
    perCredit: "0.03",
    popular: true,
    features: ["300 credits", "~60 thumbnails", "All styles & sizes", "Download in HD", "Best value"],
  },
  {
    id: "pro",
    name: "Pro Pack",
    credits: 800,
    price: 19.99,
    priceInCents: 1999,
    perCredit: "0.025",
    popular: false,
    features: ["800 credits", "~160 thumbnails", "All styles & sizes", "Download in HD", "Priority generation"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    credits: 2000,
    price: 39.99,
    priceInCents: 3999,
    perCredit: "0.02",
    popular: false,
    features: ["2000 credits", "~400 thumbnails", "All styles & sizes", "Download in HD", "Priority generation", "Lowest per-credit cost"],
  },
] as const

// Credit costs
export const CREDITS_PER_IMAGE = 5
export const INITIAL_FREE_CREDITS = 50
