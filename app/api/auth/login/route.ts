import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email })
    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
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
    console.error('[v0] Login error:', errMsg)
    return Response.json({ error: 'Login failed' }, { status: 500 })
  }
}
