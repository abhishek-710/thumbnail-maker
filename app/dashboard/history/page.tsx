"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, ImageIcon, Download, Trash2, X, Wand2, Coins, Filter } from "lucide-react"
import { toast } from "sonner"
import { useGenerations } from "@/lib/generation-context"
import { ART_STYLES, SIZE_PRESETS } from "@/lib/constants"
import type { Generation } from "@/lib/types"

function HistoryCard({
  generation,
  onClick,
  onDelete,
}: {
  generation: Generation
  onClick: () => void
  onDelete: () => void
}) {
  const style = ART_STYLES.find((s) => s.value === generation.options.style)
  const sizePreset = SIZE_PRESETS.find((s) => s.value === generation.options.size)
  const date = new Date(generation.createdAt)
  const timeAgo = getTimeAgo(date)

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30">
      <div className="relative aspect-video cursor-pointer overflow-hidden" onClick={onClick}>
        <img
          src={generation.imageUrls[0]}
          alt={`Thumbnail: ${generation.prompt}`}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          crossOrigin="anonymous"
        />
        {generation.imageUrls.length > 1 && (
          <div className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
            {generation.imageUrls.length} images
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="mb-2 line-clamp-2 text-sm text-foreground">{generation.prompt}</p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {style && (
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              {style.label}
            </span>
          )}
          {sizePreset && (
            <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
              {sizePreset.label}
            </span>
          )}
          <span className="flex items-center gap-1 rounded-md bg-surface-hover px-2 py-0.5 text-[10px] text-muted-foreground">
            <Coins className="h-3 w-3" />
            {generation.creditsCost}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete generation"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function HistoryModal({
  generation,
  onClose,
  onRegenerate,
}: {
  generation: Generation
  onClose: () => void
  onRegenerate: () => void
}) {
  const style = ART_STYLES.find((s) => s.value === generation.options.style)

  async function handleDownload(url: string, index: number) {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = `thumbcraft-${Date.now()}-${index + 1}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
      toast.success("Downloaded!")
    } catch {
      toast.error("Download failed")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-border bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Generation Details</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          {/* Images */}
          <div className={`mb-6 grid gap-4 ${generation.imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
            {generation.imageUrls.map((url, i) => (
              <div key={i} className="group relative overflow-hidden rounded-lg border border-border">
                <img src={url} alt={`Variation ${i + 1}`} className="w-full object-cover" crossOrigin="anonymous" />
                <div className="absolute bottom-0 left-0 right-0 flex justify-end bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleDownload(url, i)}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  >
                    <Download className="h-3 w-3" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="mb-2 text-sm font-medium text-foreground">Prompt</h3>
            <p className="mb-4 text-sm text-muted-foreground">{generation.prompt}</p>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <span className="text-xs text-muted-foreground">Style</span>
                <p className="font-medium text-foreground">{style?.label || generation.options.style}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Platform</span>
                <p className="font-medium text-foreground">{generation.options.platform}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Size</span>
                <p className="font-medium text-foreground">{generation.options.width}x{generation.options.height}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Credits Used</span>
                <p className="font-medium text-foreground">{generation.creditsCost}</p>
              </div>
            </div>
            {generation.options.textOverlay && (
              <div className="mt-3">
                <span className="text-xs text-muted-foreground">Text Overlay</span>
                <p className="font-medium text-foreground">{generation.options.textOverlay}</p>
              </div>
            )}
          </div>

          {/* Regenerate button */}
          <button
            onClick={onRegenerate}
            className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#7c3aed]"
          >
            <Wand2 className="h-4 w-4" />
            Regenerate with same settings
          </button>
        </div>
      </div>
    </div>
  )
}

function getTimeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function HistoryPage() {
  const { generations, removeGeneration } = useGenerations()
  const router = useRouter()
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null)
  const [filterStyle, setFilterStyle] = useState<string>("")
  const [filterPlatform, setFilterPlatform] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")

  let filtered = [...generations]
  if (filterStyle) filtered = filtered.filter((g) => g.options.style === filterStyle)
  if (filterPlatform) filtered = filtered.filter((g) => g.options.platform === filterPlatform)
  if (sortOrder === "oldest") filtered.reverse()

  const uniquePlatforms = [...new Set(generations.map((g) => g.options.platform))]
  const uniqueStyles = [...new Set(generations.map((g) => g.options.style))]

  function handleDelete(id: string) {
    removeGeneration(id)
    toast.success("Generation deleted")
  }

  function handleRegenerate(gen: Generation) {
    // Navigate to generate page with pre-filled params via URL
    const params = new URLSearchParams({
      prompt: gen.prompt,
      style: gen.options.style,
      size: gen.options.size,
    })
    router.push(`/dashboard/generate?${params.toString()}`)
  }

  if (generations.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="rounded-2xl border border-border bg-card p-6">
          <Clock className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-foreground">No generations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Your generated thumbnails will appear here</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/generate")}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-[#7c3aed]"
        >
          <Wand2 className="h-4 w-4" />
          Create Your First Thumbnail
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Filters bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{filtered.length} generation{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filterStyle}
            onChange={(e) => setFilterStyle(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">All Styles</option>
            {uniqueStyles.map((s) => (
              <option key={s} value={s}>{ART_STYLES.find((a) => a.value === s)?.label || s}</option>
            ))}
          </select>
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">All Platforms</option>
            {uniquePlatforms.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Gallery grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((gen) => (
          <HistoryCard
            key={gen.id}
            generation={gen}
            onClick={() => setSelectedGeneration(gen)}
            onDelete={() => handleDelete(gen.id)}
          />
        ))}
      </div>

      {/* Detail modal */}
      {selectedGeneration && (
        <HistoryModal
          generation={selectedGeneration}
          onClose={() => setSelectedGeneration(null)}
          onRegenerate={() => {
            handleRegenerate(selectedGeneration)
            setSelectedGeneration(null)
          }}
        />
      )}
    </div>
  )
}
