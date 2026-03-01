import { connectDB } from '@/lib/mongodb'
import { Generation } from '@/lib/models'

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.slice(7)

    await connectDB()
    const generations = await Generation.find({ userId })
      .sort({ createdAt: -1 })
      .lean()

    return Response.json({
      generations: generations.map((g: any) => ({
        id: g._id.toString(),
        userId: g.userId,
        prompt: g.prompt,
        imageUrls: g.imageUrls,
        options: g.options,
        creditsCost: g.creditsCost,
        status: g.status,
        createdAt: g.createdAt,
      })),
    })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[v0] Get generations error:', errMsg)
    return Response.json({ error: 'Failed to get generations' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.slice(7)
    const { searchParams } = new URL(req.url)
    const generationId = searchParams.get('id')

    if (!generationId) {
      return Response.json({ error: 'Generation ID is required' }, { status: 400 })
    }

    await connectDB()
    const result = await Generation.findOneAndDelete({ _id: generationId, userId })

    if (!result) {
      return Response.json({ error: 'Generation not found' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[v0] Delete generation error:', errMsg)
    return Response.json({ error: 'Failed to delete generation' }, { status: 500 })
  }
}
