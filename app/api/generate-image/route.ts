import { connectDB } from '@/lib/mongodb'
import { User, Generation } from '@/lib/models'

export const maxDuration = 120

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  console.log('[v0] Fetching image from URL:', imageUrl)
  const response = await fetch(imageUrl)
  if (!response.ok) {
    console.log('[v0] Failed to fetch image, status:', response.status, response.statusText)
    throw new Error(`Failed to fetch image: ${response.statusText}`)
  }
  const buffer = await response.arrayBuffer()
  console.log('[v0] Image buffer size:', buffer.byteLength)
  const base64 = Buffer.from(buffer).toString('base64')
  console.log('[v0] Base64 length:', base64.length)
  return base64
}

export async function POST(req: Request) {
  try {
    const { prompt, width, height, variations, userId, options, creditsCost } = await req.json()

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (!process.env.INFIP_API_KEY) {
      return Response.json(
        { error: 'Image generation is not configured. Please set INFIP_API_KEY.' },
        { status: 500 }
      )
    }

    const numVariations = Math.min(Math.max(variations || 1, 1), 4)
    const size = width && height ? `${width}x${height}` : '1024x1024'

    // Call Infip API
    const infipResponse = await fetch('https://api.infip.pro/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.INFIP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'z-image-turbo',
        prompt: prompt,
        n: numVariations,
        size: size,
        response_format: 'url',
      }),
    })

    if (!infipResponse.ok) {
      const errorData = await infipResponse.json().catch(() => ({}))
      const errorMsg = errorData.error?.message || errorData.detail || `HTTP ${infipResponse.status}`
      return Response.json({ error: `Image generation failed: ${errorMsg}` }, { status: infipResponse.status })
    }

    const infipData = await infipResponse.json()

    // Check if data exists (immediate response) - stop if we have images
    if (!infipData.data || !Array.isArray(infipData.data) || infipData.data.length === 0) {
      throw new Error('No images in response')
    }

    console.log('[v0] Infip response data:', JSON.stringify(infipData.data, null, 2))

    // Convert URLs to base64 to bypass CORS
    const imageUrls = infipData.data.map((item: { url: string }) => item.url)
    console.log('[v0] Extracted image URLs:', imageUrls)
    
    const base64Images = await Promise.all(
      imageUrls.map(async (url) => ({
        base64: await fetchImageAsBase64(url),
        mediaType: 'image/png',
      }))
    )
    
    console.log('[v0] Successfully converted', base64Images.length, 'images to base64')

    // Save to MongoDB if userId provided
    if (userId) {
      await connectDB()
      const generation = new Generation({
        userId,
        prompt,
        imageUrls: base64Images.map((img) => `data:${img.mediaType};base64,${img.base64}`),
        options,
        creditsCost,
        status: 'completed',
      })
      await generation.save()

      // Update user credits
      await User.findByIdAndUpdate(userId, {
        $inc: { credits: -creditsCost },
      })
    }

    return Response.json({ images: base64Images })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[v0] Image generation error:', errMsg)
    return Response.json({ error: `Image generation error: ${errMsg}` }, { status: 500 })
  }
}
