import { generateText } from "ai"

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const { prompt, width, height, variations } = await req.json()

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 })
    }

    const numVariations = Math.min(Math.max(variations || 1, 1), 4)
    const aspectInfo =
      width && height ? ` The image should have a ${width}x${height} aspect ratio.` : ""

    const images: { base64: string; mediaType: string }[] = []

    // Generate each variation sequentially (Gemini handles one image per call)
    for (let i = 0; i < numVariations; i++) {
      const variationPrompt =
        numVariations > 1
          ? `${prompt}${aspectInfo} (variation ${i + 1}, unique creative interpretation)`
          : `${prompt}${aspectInfo}`

      try {
        const result = await generateText({
          model: "google/gemini-2.5-flash-image",
          prompt: variationPrompt,
          providerOptions: {
            google: {
              responseModalities: ["TEXT", "IMAGE"],
            },
          },
        })

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
        console.error(`[v0] Variation ${i + 1} failed:`, err)
        // Continue generating other variations even if one fails
      }
    }

    if (images.length === 0) {
      return Response.json(
        { error: "Failed to generate any images. Please try again." },
        { status: 500 }
      )
    }

    return Response.json({ images })
  } catch (err) {
    console.error("[v0] Image generation error:", err)
    return Response.json(
      { error: "Failed to generate image. Please try again." },
      { status: 500 }
    )
  }
}
