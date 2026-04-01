import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import Invoice from '@/models/Invoice'
import User from '@/models/User'
import { generateInvoiceNumber } from '@/lib/utils'

// GET /api/invoices — list all invoices for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const { searchParams } = new URL(req.url)
    const status  = searchParams.get('status')
    const page    = parseInt(searchParams.get('page') ?? '1')
    const limit   = parseInt(searchParams.get('limit') ?? '20')
    const skip    = (page - 1) * limit

    const query: Record<string, unknown> = { userId: session.user.id }
    if (status && status !== 'all') query.status = status

    const [invoices, total] = await Promise.all([
      Invoice.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Invoice.countDocuments(query),
    ])

    return NextResponse.json({ invoices, total, page, pages: Math.ceil(total / limit) })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/invoices — create new invoice
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()

    const user = await User.findById(session.user.id)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Free plan limit
    if (user.plan === 'free') {
      const thisMonth = new Date()
      thisMonth.setDate(1); thisMonth.setHours(0,0,0,0)
      const monthCount = await Invoice.countDocuments({ userId: user._id, createdAt: { $gte: thisMonth } })
      if (monthCount >= 5) {
        return NextResponse.json({ error: 'Free plan limit reached. Upgrade to Pro for unlimited invoices.' }, { status: 403 })
      }
    }

    const body = await req.json()
    const invoice = await Invoice.create({
      ...body,
      userId: session.user.id,
      invoiceNumber: body.invoiceNumber || generateInvoiceNumber(),
    })

    await User.findByIdAndUpdate(session.user.id, { $inc: { invoiceCount: 1 } })

    return NextResponse.json(invoice, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
