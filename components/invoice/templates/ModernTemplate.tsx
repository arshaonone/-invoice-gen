import { formatCurrency, formatDate, LANGS } from '@/lib/utils'
import type { InvoiceData } from '@/components/invoice/InvoiceCreator'

export default function ModernTemplate({ data }: { data: InvoiceData }) {
  const t = LANGS[data.language]
  const c = data.brandColor

  return (
    <div className="invoice-preview bg-white min-h-[1123px]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Gradient header */}
      <div className="px-10 pt-10 pb-12 text-white" style={{ background: `linear-gradient(135deg, ${c} 0%, ${c}cc 100%)` }}>
        <div className="flex justify-between items-start">
          <div>
            {data.senderLogo ? (
              <img src={data.senderLogo} alt="Logo" className="h-12 object-contain mb-4 brightness-0 invert" />
            ) : (
              <div className="text-2xl font-bold mb-1">{data.senderName}</div>
            )}
            <div className="opacity-80 text-sm">{data.senderEmail}</div>
            {data.senderPhone && <div className="opacity-80 text-sm">{data.senderPhone}</div>}
            {data.senderAddress && <div className="opacity-80 text-sm mt-1 whitespace-pre-line">{data.senderAddress}</div>}
          </div>
          <div className="text-right">
            <div className="text-5xl font-black tracking-tight opacity-30 uppercase">{t.invoice}</div>
            <div className="text-xl font-bold mt-1">{data.invoiceNumber}</div>
          </div>
        </div>

        <div className="flex gap-8 mt-8 pt-6 border-t border-white/20">
          <div>
            <div className="text-xs uppercase tracking-widest opacity-60 mb-1">{t.date}</div>
            <div className="font-semibold">{formatDate(data.invoiceDate)}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest opacity-60 mb-1">{t.dueDate}</div>
            <div className="font-semibold">{formatDate(data.dueDate)}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs uppercase tracking-widest opacity-60 mb-1">{t.to}</div>
            <div className="font-bold">{data.clientName}</div>
            {data.clientCompany && <div className="text-sm opacity-80">{data.clientCompany}</div>}
            <div className="text-sm opacity-80">{data.clientEmail}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-10">
        {/* Items */}
        <div className="mb-8">
          <div className="grid grid-cols-12 gap-2 mb-3">
            {[t.description, t.qty, t.unitPrice, t.tax, t.amount].map((h, i) => (
              <div key={h} className={`text-xs font-bold uppercase tracking-widest text-gray-400 ${i === 0 ? 'col-span-5' : i === 4 ? 'col-span-2 text-right' : 'col-span-1 text-center'}`}>{h}</div>
            ))}
            <div className="col-span-1" />
          </div>

          <div className="space-y-3">
            {data.items.map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-2 p-4 rounded-xl bg-gray-50 text-sm">
                <div className="col-span-5">
                  <div className="font-semibold text-gray-900">{item.name || '—'}</div>
                  {item.description && <div className="text-xs text-gray-400">{item.description}</div>}
                </div>
                <div className="col-span-1 text-center text-gray-600 self-center">{item.quantity}</div>
                <div className="col-span-2 text-center text-gray-600 self-center">{formatCurrency(item.unitPrice, data.currency)}</div>
                <div className="col-span-1 text-center text-gray-600 self-center">{item.taxRate}%</div>
                <div className="col-span-2 text-right font-bold self-center" style={{ color: c }}>{formatCurrency(item.total, data.currency)}</div>
                <div className="col-span-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-72 space-y-2 p-5 rounded-2xl" style={{ background: `${c}10`, border: `1px solid ${c}30` }}>
            {[
              { label: t.subtotal, val: formatCurrency(data.subtotal, data.currency) },
              { label: t.taxTotal, val: formatCurrency(data.taxAmount, data.currency) },
              ...(data.discount > 0 ? [{ label: t.discount, val: `- ${formatCurrency(data.discount, data.currency)}` }] : []),
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between text-sm text-gray-500">
                <span>{label}</span><span>{val}</span>
              </div>
            ))}
            <div className="flex justify-between text-lg font-black pt-3 border-t" style={{ borderColor: `${c}40`, color: c }}>
              <span>{t.total}</span><span>{formatCurrency(data.total, data.currency)}</span>
            </div>
          </div>
        </div>

        {data.notes && (
          <div className="p-4 rounded-xl border border-gray-100 text-sm text-gray-600">
            <div className="font-semibold text-gray-900 mb-1">{t.notes}</div>
            <div className="whitespace-pre-line">{data.notes}</div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-400">{data.footerNote}</div>
      </div>
    </div>
  )
}
