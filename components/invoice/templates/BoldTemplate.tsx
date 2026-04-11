import { formatCurrency, formatDate, LANGS } from '@/lib/utils'
import type { InvoiceData } from '@/components/invoice/InvoiceCreator'

export default function BoldTemplate({ data }: { data: InvoiceData }) {
  const t = LANGS['en']
  const c = data.brandColor

  return (
    <div className="invoice-preview min-h-[1123px]" style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#0f0f1a', color: '#f1f5f9' }}>
      {/* Dark header */}
      <div className="px-10 pt-10 pb-10" style={{ backgroundColor: '#161625' }}>
        <div className="flex justify-between items-start">
          <div>
            {data.senderLogo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.senderLogo} alt="Logo" className="h-12 object-contain mb-4" />
              </>
            ) : (
              <div className="text-2xl font-black mb-1" style={{ color: c }}>{data.senderName}</div>
            )}
            <div className="text-sm text-gray-400">{data.senderEmail}</div>
            {data.senderPhone && <div className="text-sm text-gray-400">{data.senderPhone}</div>}
            {data.senderAddress && <div className="text-sm text-gray-400 mt-1 whitespace-pre-line">{data.senderAddress}</div>}
          </div>
          <div className="text-right">
            <div className="text-6xl font-black tracking-tighter" style={{ color: c }}>{t.invoice}</div>
            <div className="text-gray-400 text-sm mt-1">{data.invoiceNumber}</div>
          </div>
        </div>
      </div>

      {/* Accent line */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${c}, transparent)` }} />

      {/* Meta strip */}
      <div className="grid grid-cols-4 px-10 py-6" style={{ backgroundColor: '#1e1e30' }}>
        <div>
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">{t.date}</div>
          <div className="font-bold text-white">{formatDate(data.invoiceDate)}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">{t.dueDate}</div>
          <div className="font-bold text-white">{formatDate(data.dueDate)}</div>
        </div>
        <div className="col-span-2">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">{t.to}</div>
          <div className="font-black text-white">{data.clientName}</div>
          {data.clientCompany && <div className="text-sm text-gray-400">{data.clientCompany}</div>}
          <div className="text-sm text-gray-400">{data.clientEmail}</div>
        </div>
      </div>

      {/* Items */}
      <div className="px-10 py-8">
        <div className="grid grid-cols-12 gap-2 mb-4 pb-3 border-b text-xs font-bold uppercase tracking-widest" style={{ borderColor: '#252540', color: '#6b7280' }}>
          <div className="col-span-5">{t.description}</div>
          <div className="col-span-2 text-center">{t.qty}</div>
          <div className="col-span-2 text-right">{t.unitPrice}</div>
          <div className="col-span-1 text-center">{t.tax}</div>
          <div className="col-span-2 text-right">{t.amount}</div>
        </div>

        <div className="space-y-2">
          {data.items.map((item, i) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 py-4 px-4 rounded-xl text-sm" style={{ backgroundColor: i % 2 === 0 ? '#1e1e30' : '#161625' }}>
              <div className="col-span-5">
                <div className="font-semibold text-white">{item.name || '—'}</div>
                {item.description && <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>}
              </div>
              <div className="col-span-2 text-center text-gray-400 self-center">{item.quantity}</div>
              <div className="col-span-2 text-right text-gray-400 self-center">{formatCurrency(item.unitPrice, data.currency)}</div>
              <div className="col-span-1 text-center text-gray-400 self-center">{item.taxRate}%</div>
              <div className="col-span-2 text-right font-black self-center" style={{ color: c }}>{formatCurrency(item.total, data.currency)}</div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-8 flex justify-end">
          <div className="w-72 space-y-2">
            {[
              { label: t.subtotal, val: formatCurrency(data.subtotal, data.currency) },
              { label: t.taxTotal, val: formatCurrency(data.taxAmount, data.currency) },
              ...(data.discount > 0 ? [{ label: t.discount, val: `- ${formatCurrency(data.discount, data.currency)}` }] : []),
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between text-sm" style={{ color: '#94a3b8' }}>
                <span>{label}</span><span>{val}</span>
              </div>
            ))}
            <div className="flex justify-between items-center text-xl font-black pt-4 border-t mt-2" style={{ borderColor: c, color: c }}>
              <span>{t.total}</span><span>{formatCurrency(data.total, data.currency)}</span>
            </div>
          </div>
        </div>

        {data.notes && (
          <div className="mt-8 p-5 rounded-xl text-sm" style={{ backgroundColor: '#1e1e30' }}>
            <div className="font-bold text-white mb-2">{t.notes}</div>
            <div className="text-gray-400 whitespace-pre-line">{data.notes}</div>
          </div>
        )}

        <div className="mt-10 pt-6 text-center text-sm text-gray-600 border-t" style={{ borderColor: '#252540' }}>
          {data.footerNote}
        </div>
      </div>
    </div>
  )
}
