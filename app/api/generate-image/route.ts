export const maxDuration = 120

async function pollForCompletion(taskId: string, pollUrl: string, maxAttempts: number = 60): Promise<string[]> {
  const apiKey = process.env.INFIP_API_KEY
  if (!apiKey) throw new Error("INFIP_API_KEY not set")

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pollResponse = await fetch(pollUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!pollResponse.ok) {
      const errorData = await pollResponse.json().catch(() => ({}))
      throw new Error(`Poll failed: ${errorData.message || pollResponse.statusText}`)
    }

    const pollData = await pollResponse.json()

    if (pollData.status === "completed") {
      if (!pollData.data || !Array.isArray(pollData.data)) {
        throw new Error("No images in completed response")
      }
      return pollData.data.map((item: { url: string }) => item.url)
    }

    if (pollData.status === "failed" || pollData.status === "error") {
      throw new Error(`Task failed: ${pollData.error?.message || "Unknown error"}`)
    }

    // Wait before next poll (exponential backoff)
    const delayMs = Math.min(1000 + attempt * 500, 5000)
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  throw new Error("Image generation timed out after 2 minutes")
}

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

    // Step 1: Submit generation request
    const submissionResponse = await fetch("https://api.infip.pro/v1/images/generations", {
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

    // Accept 200-202 for successful submission (202 is async acceptance)
    if (submissionResponse.status < 200 || submissionResponse.status > 202) {
      const errorData = await submissionResponse.json().catch(() => ({}))
      const errorMsg =
        errorData.error?.message ||
        errorData.message ||
        `HTTP ${submissionResponse.status}`
      return Response.json(
        { error: `Submission failed: ${errorMsg}` },
        { status: submissionResponse.status }
      )
    }

    const submissionData = await submissionResponse.json()

    // Infip returns either immediate results or a task_id for async processing
    if (submissionData.data && Array.isArray(submissionData.data)) {
      // Immediate result (shouldn't happen with z-image-turbo but handle it)
      const images = submissionData.data.map((item: { url: string }) => ({
        url: item.url,
      }))
      return Response.json({ images })
    }

    // Step 2: Handle async processing with task_id
    if (submissionData.task_id && submissionData.poll_url) {
      const imageUrls = await pollForCompletion(
        submissionData.task_id,
        submissionData.poll_url
      )

      const images = imageUrls.map((url: string) => ({
        url: url,
      }))

      return Response.json({ images })
    }

    return Response.json(
      { error: "Unexpected response format from API" },
      { status: 500 }
    )
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error("[v0] Image generation error:", errMsg)
    return Response.json(
      { error: `Image generation error: ${errMsg}` },
      { status: 500 }
    )
  }
}
