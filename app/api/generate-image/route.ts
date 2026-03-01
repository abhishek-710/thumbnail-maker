export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const { prompt, width, height, variations } = await req.json()

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!process.env.INFIP_API_KEY) {
      return Response.json(
        { error: "Image generation is not configured. Please set INFIP_API_KEY in environment variables." },
        { status: 500 }
      )
    }

    const numVariations = Math.min(Math.max(variations || 1, 1), 4)
    const size = width && height ? `${width}x${height}` : "1024x1024"

    // Request images from Infip API
    const response = await fetch("https://api.infip.pro/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.INFIP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "z-image-turbo",
        prompt: prompt,
        n: numVariations,
        size: size,
        response_format: "url",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg =
        errorData.error?.message ||
        errorData.message ||
        `HTTP ${response.status}`
      return Response.json(
        { error: `Image generation failed: ${errorMsg}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      return Response.json(
        { error: "No images generated. Please try again." },
        { status: 500 }
      )
    }

    // Convert Infip response format to our format
    const images = data.data.map((item: { url: string }) => ({
      url: item.url,
    }))

    return Response.json({ images })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error("[v0] Image generation error:", errMsg)
    return Response.json(
      { error: `Image generation error: ${errMsg}` },
      { status: 500 }
    )
  }
}
