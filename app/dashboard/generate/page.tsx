"use client"

import { useState, useCallback } from "react"
import {
  Wand2, Loader2, Download, ImageIcon, AlertCircle, Coins, X,
  Camera, Palette, Box, Sparkles, LayoutGrid, Droplets, Film, Zap
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { useGenerations } from "@/lib/generation-context"
import { ART_STYLES, SIZE_PRESETS, COLOR_SCHEMES, CREDITS_PER_IMAGE } from "@/lib/constants"
import { buildEnhancedPrompt } from "@/lib/prompt-builder"

const ICON_MAP: Record<string, React.ElementType> = {
  Camera, Palette, Box, Sparkles, LayoutGrid, Droplets, Film, Zap,
}

function StyleSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">Art Style</label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ART_STYLES.map((style) => {
          const Icon = ICON_MAP[style.icon] || Sparkles
          const isActive = value === style.value
          return (
            <button
              key={style.value}
              type="button"
              onClick={() => onChange(style.value)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-all ${
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-surface-hover"
              }`}
            >
              <Icon className="h-5 w-5" />
              {style.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SizeSelector({
  value, onChange, customWidth, customHeight, onCustomWidthChange, onCustomHeightChange,
}: {
  value: string; onChange: (v: string) => void
  customWidth: number; customHeight: number
  onCustomWidthChange: (v: number) => void; onCustomHeightChange: (v: number) => void
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">Size / Platform</label>
      <div className="grid grid-cols-3 gap-2">
        {SIZE_PRESETS.map((preset) => {
          const isActive = value === preset.value
          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(preset.value)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-surface-hover"
              }`}
            >
              <div>{preset.label}</div>
              <div className="mt-0.5 text-[10px] opacity-60">{preset.width}x{preset.height}</div>
            </button>
          )
        })}
      </div>
      {value === "custom" && (
        <div className="mt-3 flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted-foreground">Width</label>
            <input
              type="number" min={256} max={2048} value={customWidth}
              onChange={(e) => onCustomWidthChange(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted-foreground">Height</label>
            <input
              type="number" min={256} max={2048} value={customHeight}
              onChange={(e) => onCustomHeightChange(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function ColorSchemeSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">Color Scheme</label>
      <div className="flex flex-wrap gap-2">
        {COLOR_SCHEMES.map((scheme) => {
          const isActive = value === scheme.value
          return (
            <button
              key={scheme.value}
              type="button"
              onClick={() => onChange(scheme.value)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: scheme.color }} />
              {scheme.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function VariationsSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Variations</label>
        <span className="text-sm text-muted-foreground">{value} {value === 1 ? "image" : "images"}</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all ${
              value === n
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

function GenerateResult({
  images, loading, prompt,
}: {
  images: string[]; loading: boolean; prompt: string
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [errorImages, setErrorImages] = useState<Set<number>>(new Set())

  async function handleDownload(url: string, index: number) {
    try {
      // If it's already a blob URL we can use it directly,
      // otherwise fetch it first.
      let blobUrl = url
      if (!url.startsWith("blob:")) {
        const response = await fetch(url)
        const blob = await response.blob()
        blobUrl = URL.createObjectURL(blob)
      }
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = `thumbcraft-${Date.now()}-${index + 1}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      // Only revoke if we created the blob URL ourselves
      if (!url.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrl)
      }
      toast.success("Image downloaded!")
    } catch {
      toast.error("Failed to download image")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-8">
        <div className="animate-pulse-glow rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Generating your thumbnails...</p>
          <p className="mt-1 text-xs text-muted-foreground">AI is creating your images. This can take 15-60 seconds.</p>
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/50 p-8">
        <div className="rounded-2xl border border-border bg-surface-hover p-6">
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Your thumbnails will appear here</p>
          <p className="mt-1 text-xs text-muted-foreground">Configure your options and click Generate</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className={`grid gap-4 ${images.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
        {images.map((url, i) => (
          <div key={i} className="group relative overflow-hidden rounded-xl border border-border bg-card">
            {errorImages.has(i) ? (
              <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-card p-8">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-xs text-muted-foreground">Failed to load image</p>
              </div>
            ) : (
              <img
                src={url}
                alt={`Generated thumbnail ${i + 1}: ${prompt}`}
                className="w-full cursor-pointer object-cover transition-transform hover:scale-[1.02]"
                crossOrigin="anonymous"
                onClick={() => setSelectedImage(url)}
                onError={() =>
                  setErrorImages((prev) => new Set(prev).add(i))
                }
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="text-xs text-white">Variation {i + 1}</span>
              <button
                onClick={() => handleDownload(url, i)}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-[#7c3aed]"
              >
                <Download className="h-3 w-3" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Full-size preview modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute right-4 top-4 rounded-full bg-card p-2 text-foreground" onClick={() => setSelectedImage(null)} aria-label="Close preview">
            <X className="h-5 w-5" />
          </button>
          <img src={selectedImage} alt="Full size thumbnail preview" className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" crossOrigin="anonymous" />
        </div>
      )}
    </div>
  )
}

export default function GeneratePage() {
  const { user, updateCredits } = useAuth()
  const { addGeneration } = useGenerations()

  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("cinematic")
  const [size, setSize] = useState("youtube")
  const [customWidth, setCustomWidth] = useState(1024)
  const [customHeight, setCustomHeight] = useState(1024)
  const [colorScheme, setColorScheme] = useState("vibrant")
  const [textOverlay, setTextOverlay] = useState("")
  const [variations, setVariations] = useState(1)
  const [loading, setLoading] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])

  const creditCost = variations * CREDITS_PER_IMAGE
  const hasEnoughCredits = (user?.credits ?? 0) >= creditCost

  const selectedSize = SIZE_PRESETS.find((p) => p.value === size)
  const width = size === "custom" ? customWidth : (selectedSize?.width ?? 1024)
  const height = size === "custom" ? customHeight : (selectedSize?.height ?? 1024)
  const platform = selectedSize?.platform ?? "Custom"

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }
    if (!hasEnoughCredits) {
      toast.error("Not enough credits")
      return
    }

    setLoading(true)
    setGeneratedImages([])

    try {
      const enhancedPrompt = buildEnhancedPrompt({
        prompt: prompt.trim(),
        style,
        colorScheme,
        textOverlay,
        platform,
      })

      // Call our server-side API route which uses the Infip API
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          width,
          height,
          variations,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error (${response.status})`)
      }

      const data = await response.json()

      if (!data.images || data.images.length === 0) {
        throw new Error("No images returned")
      }

      // Infip returns direct URLs, use them directly
      const imageUrls = data.images.map((img: { url: string }) => img.url)

      // Deduct credits
      const newCredits = (user?.credits ?? 0) - creditCost
      updateCredits(newCredits)

      // Save to history
      addGeneration({
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        userId: user?.id ?? "",
        prompt: prompt.trim(),
        imageUrls: imageUrls,
        options: {
          style,
          size,
          width,
          height,
          platform,
          colorScheme,
          textOverlay,
          variations,
          model: "infip",
        },
        creditsCost: creditCost,
        status: "completed",
        createdAt: new Date().toISOString(),
      })

      setGeneratedImages(imageUrls)
      toast.success(
        `Generated ${imageUrls.length} thumbnail${imageUrls.length > 1 ? "s" : ""}!`
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate thumbnails"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [prompt, style, size, width, height, colorScheme, textOverlay, variations, platform, creditCost, hasEnoughCredits, user, updateCredits, addGeneration])

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left panel - Form */}
      <div className="flex w-full flex-col gap-5 lg:w-[420px] lg:shrink-0">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">Create Thumbnail</h2>

          {/* Prompt */}
          <div className="mb-5">
            <label htmlFor="prompt" className="mb-1.5 block text-sm font-medium text-foreground">
              Describe your thumbnail
            </label>
            <textarea
              id="prompt"
              rows={3}
              placeholder="A gaming channel thumbnail with explosions and a character holding a sword..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-5">
            <StyleSelector value={style} onChange={setStyle} />
            <SizeSelector
              value={size} onChange={setSize}
              customWidth={customWidth} customHeight={customHeight}
              onCustomWidthChange={setCustomWidth} onCustomHeightChange={setCustomHeight}
            />
            <ColorSchemeSelector value={colorScheme} onChange={setColorScheme} />

            {/* Text Overlay */}
            <div>
              <label htmlFor="textOverlay" className="mb-1.5 block text-sm font-medium text-foreground">
                Text Overlay <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="textOverlay"
                type="text"
                placeholder="EPIC BATTLE"
                value={textOverlay}
                onChange={(e) => setTextOverlay(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <VariationsSlider value={variations} onChange={setVariations} />
          </div>
        </div>

        {/* Credit cost + Generate button */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-foreground">Cost: <strong>{creditCost} credits</strong></span>
            </div>
            <span className={`text-xs ${hasEnoughCredits ? "text-muted-foreground" : "text-destructive"}`}>
              Balance: {user?.credits ?? 0}
            </span>
          </div>

          {!hasEnoughCredits && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Not enough credits. Purchase more from the Credits page.
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim() || !hasEnoughCredits}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate Thumbnail
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right panel - Results */}
      <div className="flex min-h-[400px] flex-1">
        <GenerateResult images={generatedImages} loading={loading} prompt={prompt} />
      </div>
    </div>
  )
}
