import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, businessName } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    await dbConnect()

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      businessName,
      plan: 'free',
    })

    return NextResponse.json({
      id:    user._id.toString(),
      name:  user.name,
      email: user.email,
      plan:  user.plan,
    }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[REGISTER ERROR]', message)
    return NextResponse.json({ error: 'Internal server error', detail: message }, { status: 500 })
  }
}
