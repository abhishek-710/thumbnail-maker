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

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return Response.json({ error: 'User already exists' }, { status: 409 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create user with 50 free credits
    const user = new User({
      email,
      passwordHash,
      credits: 50,
    })

    await user.save()

    return Response.json({
      user: { id: user._id, email: user.email, credits: user.credits },
    })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[v0] Signup error:', errMsg)
    return Response.json({ error: `Signup failed: ${errMsg}` }, { status: 500 })
  }
}
