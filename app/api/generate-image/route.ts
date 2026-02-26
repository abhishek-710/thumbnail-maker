import { generateText } from "ai"

export const maxDuration = 120

export async function POST(req: Request) {
  let lastError = ""

  try {
    const { prompt, width, height, variations } = await req.json()

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

      console.log(`[v0] Generating variation ${i + 1} of ${numVariations}...`)

      try {
        const result = await generateText({
          model: "google/gemini-3-pro-image-preview",
          prompt: fullPrompt,
        })

        console.log(`[v0] Result keys:`, Object.keys(result))
        console.log(`[v0] files count:`, result.files?.length ?? "no files property")
        console.log(`[v0] text:`, result.text?.slice(0, 200) ?? "no text")

        if (result.files && result.files.length > 0) {
          for (const file of result.files) {
            console.log(`[v0] File:`, { mediaType: file.mediaType, base64Length: file.base64?.length ?? 0 })
            if (file.mediaType?.startsWith("image/")) {
              images.push({
                base64: file.base64,
                mediaType: file.mediaType,
              })
            }
          }
        } else {
          console.log(`[v0] No files in result. Full result text:`, result.text)
          lastError = `Model returned text but no image files. Response: ${result.text?.slice(0, 200) ?? "empty"}`
        }
      } catch (err) {
        const errMsg = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
        console.error(`[v0] Variation ${i + 1} error:`, errMsg)
        lastError = errMsg
      }
    }

    console.log(`[v0] Total images generated: ${images.length}`)

    if (images.length === 0) {
      return Response.json(
        { error: `Image generation failed: ${lastError}` },
        { status: 500 }
      )
    }

    return Response.json({ images })
  } catch (err) {
    const errMsg = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    console.error("[v0] Top-level error:", errMsg)
    return Response.json(
      { error: `Server error: ${errMsg}` },
      { status: 500 }
    )
  }
}
