import { connectDB } from '@/lib/mongodb'
import { User, Generation } from '@/lib/models'

export const maxDuration = 120 // 2 minutes

// Fetch image and convert to base64
async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl)
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
  const buffer = await response.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}

// Poll for async task completion
async function pollForCompletion(taskId: string, pollUrl: string): Promise<string[]> {
  const apiKey = process.env.INFIP_API_KEY
  if (!apiKey) throw new Error("INFIP_API_KEY not set")

  const startTime = Date.now()
  const maxDurationMs = 120 * 1000 // 2 minutes in ms
  let attempt = 0

  while (true) {
    attempt++
    console.log(`[Poll] Attempt ${attempt} for task ${taskId}`)

    const pollResponse = await fetch(pollUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (!pollResponse.ok) {
      const errorData = await pollResponse.json().catch(() => ({}))
      throw new Error(`Poll failed: ${errorData.message || pollResponse.statusText}`)
    }

    const pollData: any = await pollResponse.json()
    console.log('[Poll] Response:', JSON.stringify(pollData, null, 2))

    if (pollData.data && Array.isArray(pollData.data) && pollData.data.length > 0) {
      return pollData.data.map((item: { url: string }) => item.url)
    }

    if (pollData.status === 'failed' || pollData.status === 'error') {
      throw new Error(`Task failed: ${pollData.error?.message || 'Unknown error'}`)
    }

    if (Date.now() - startTime > maxDurationMs) {
      throw new Error('Image generation timed out after 2 minutes')
    }

    const delayMs = Math.min(1000 + attempt * 500, 5000)
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, width, height, variations, userId, options, creditsCost } = await req.json()

    if (!prompt) return Response.json({ error: 'Prompt is required' }, { status: 400 })
    if (!process.env.INFIP_API_KEY) return Response.json({ error: 'INFIP_API_KEY not set' }, { status: 500 })

    const numVariations = Math.min(Math.max(variations || 1, 1), 4)
    const size = width && height ? `${width}x${height}` : '1024x1024'

    console.log('[POST] Submitting generation request', { prompt, size, numVariations })

    const infipResponse = await fetch('https://api.infip.pro/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.INFIP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'z-image-turbo',
        prompt,
        n: numVariations,
        size,
        response_format: 'url',
      }),
    })

    if (!infipResponse.ok) {
      const errData = await infipResponse.json().catch(() => ({}))
      const errMsg = errData.error?.message || errData.detail || `HTTP ${infipResponse.status}`
      return Response.json({ error: `Image generation failed: ${errMsg}` }, { status: infipResponse.status })
    }

    const infipData: any = await infipResponse.json()
    console.log('[POST] Infip response:', JSON.stringify(infipData, null, 2))

    let imageUrls: string[] = []

    if (infipData.data && Array.isArray(infipData.data) && infipData.data.length > 0) {
      imageUrls = infipData.data.map((item: { url: string }) => item.url)
    } else if (infipData.task_id && infipData.poll_url) {
      console.log('[POST] Polling for async task', infipData.task_id)
      imageUrls = await pollForCompletion(infipData.task_id, infipData.poll_url)
    } else {
      throw new Error('Unexpected response format from Infip API')
    }

    // Convert to base64 data URIs
    const base64Images = await Promise.all(
      imageUrls.map(async (url) => {
        const base64 = await fetchImageAsBase64(url)
        return { dataUrl: `data:image/png;base64,${base64}` }
      })
    )

    // Save to MongoDB if userId provided
    if (userId) {
      await connectDB()
      const generation = new Generation({
        userId,
        prompt,
        imageUrls: base64Images.map((img) => img.dataUrl),
        options,
        creditsCost,
        status: 'completed',
      })
      await generation.save()
      await User.findByIdAndUpdate(userId, { $inc: { credits: -creditsCost } })
    }

    return Response.json({ images: base64Images })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[POST] Image generation error:', errMsg)
    return Response.json({ error: `Image generation error: ${errMsg}` }, { status: 500 })
  }
}
