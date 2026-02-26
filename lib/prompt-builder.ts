import { ART_STYLES, COLOR_SCHEMES } from "@/lib/constants"

export function buildEnhancedPrompt(params: {
  prompt: string
  style: string
  colorScheme: string
  textOverlay: string
  platform: string
}): string {
  const parts: string[] = []

  // Base prompt
  parts.push(params.prompt.trim())

  // Style modifier
  const styleObj = ART_STYLES.find((s) => s.value === params.style)
  if (styleObj) {
    parts.push(styleObj.promptModifier)
  }

  // Color scheme modifier
  const colorObj = COLOR_SCHEMES.find((c) => c.value === params.colorScheme)
  if (colorObj) {
    parts.push(colorObj.promptModifier)
  }

  // Text overlay
  if (params.textOverlay.trim()) {
    parts.push(`with bold text saying "${params.textOverlay.trim()}"`)
  }

  // Platform context
  if (params.platform && params.platform !== "Custom") {
    parts.push(`thumbnail for ${params.platform}`)
  }

  // Quality boosters
  parts.push("high quality, professional, eye-catching")

  return parts.join(", ")
}

export function generatePollinationsUrl(
  prompt: string,
  width: number,
  height: number,
  seed: number,
  model: string = "flux"
): string {
  const encodedPrompt = encodeURIComponent(prompt)
  const params = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    seed: seed.toString(),
    model,
    nologo: "true",
  })
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`
}
