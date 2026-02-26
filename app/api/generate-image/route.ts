import { generateText } from "ai"

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const { prompt, width, height, variations } = await req.json()

    console.log("[v0] Generate image request:", { prompt: prompt?.slice(0, 80), width, height, variations })

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 })
    }

    const numVariations = Math.min(Math.max(variations || 1, 1), 4)
    const aspectInfo =
      width && height ? ` The image dimensions should be ${width}x${height} pixels.` : ""

    const images: { base64: string; mediaType: string }[] = []

    for (let i = 0; i < numVariations; i++) {
      const variationSuffix =
        numVariations > 1 ? ` (variation ${i + 1}, unique creative interpretation)` : ""
      const fullPrompt = `Generate an image: ${prompt}${aspectInfo}${variationSuffix}`

      console.log(`[v0] Generating variation ${i + 1}...`)

      try {
        const result = await generateText({
          model: "google/gemini-3-pro-image-preview",
          prompt: fullPrompt,
        })

        console.log(`[v0] Variation ${i + 1} result - files:`, result.files?.length ?? 0, "text:", result.text?.slice(0, 100))

        if (result.files) {
          for (const file of result.files) {
            if (file.mediaType?.startsWith("image/")) {
              images.push({
                base64: file.base64,
                mediaType: file.mediaType,
              })
            }
          }
        }
      } catch (err) {
        console.error(`[v0] Variation ${i + 1} failed:`, err instanceof Error ? err.message : err)
      }
    }

    console.log(`[v0] Total images generated: ${images.length}`)

    if (images.length === 0) {
      return Response.json(
        { error: "Failed to generate any images. Please try again." },
        { status: 500 }
      )
    }

    return Response.json({ images })
  } catch (err) {
    console.error("[v0] Image generation top-level error:", err instanceof Error ? err.message : err)
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to generate image. Please try again." },
      { status: 500 }
    )
  }
}
