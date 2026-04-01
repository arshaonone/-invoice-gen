import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import Invoice from '@/models/Invoice'

// GET /api/invoices/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const invoice = await Invoice.findOne({ _id: params.id, userId: session.user.id }).lean()
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    return NextResponse.json(invoice)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/invoices/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const body    = await req.json()
    const invoice = await Invoice.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    return NextResponse.json(invoice)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/invoices/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const invoice = await Invoice.findOneAndDelete({ _id: params.id, userId: session.user.id })
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    return NextResponse.json({ message: 'Invoice deleted' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
