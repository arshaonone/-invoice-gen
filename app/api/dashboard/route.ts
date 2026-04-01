import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import Invoice from '@/models/Invoice'

// GET /api/dashboard — stats for dashboard overview
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const userId = session.user.id

    const [all, recent, statusCounts] = await Promise.all([
      Invoice.find({ userId }).select('total status createdAt').lean(),
      Invoice.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
      Invoice.aggregate([
        { $match: { userId: new (await import('mongoose')).default.Types.ObjectId(userId) } },
        { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      ]),
    ])

    const totalRevenue  = all.filter(i => i.status === 'paid').reduce((acc, i) => acc + (i.total ?? 0), 0)
    const totalInvoices = all.length
    const pending       = all.filter(i => ['sent', 'draft'].includes(i.status)).length
    const paid          = all.filter(i => i.status === 'paid').length
    const overdue       = all.filter(i => i.status === 'overdue').length

    // Monthly revenue for chart — last 6 months
    const monthly: Record<string, number> = {}
    all.forEach(inv => {
      if (inv.status !== 'paid') return
      const key = new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      monthly[key] = (monthly[key] ?? 0) + (inv.total ?? 0)
    })

    return NextResponse.json({
      totalRevenue,
      totalInvoices,
      pending,
      paid,
      overdue,
      recent,
      monthly,
      statusCounts,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
