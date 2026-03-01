import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models'

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.slice(7)

    await connectDB()
    const user = await User.findById(userId).select('-password')

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        credits: user.credits,
      },
    })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[v0] Get user error:', errMsg)
    return Response.json({ error: 'Failed to get user' }, { status: 500 })
  }
}
