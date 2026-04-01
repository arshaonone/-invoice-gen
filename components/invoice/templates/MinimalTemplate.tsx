import { formatCurrency, formatDate, LANGS } from '@/lib/utils'
import type { InvoiceData } from '@/components/invoice/InvoiceCreator'

export default function MinimalTemplate({ data }: { data: InvoiceData }) {
  const t   = LANGS['en']
  const sym = data.brandColor

  return (
    <div className="invoice-preview p-10 min-h-[1123px] font-sans bg-white text-gray-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          {data.senderLogo ? (
            <img src={data.senderLogo} alt="Logo" className="h-14 object-contain mb-3" />
          ) : (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold mb-3" style={{ backgroundColor: sym }}>
              {data.senderName?.[0]?.toUpperCase() ?? 'A'}
            </div>
          )}
          <div className="font-bold text-gray-900 text-lg">{data.senderName}</div>
          <div className="text-sm text-gray-500">{data.senderEmail}</div>
          {data.senderPhone && <div className="text-sm text-gray-500">{data.senderPhone}</div>}
          {data.senderAddress && <div className="text-sm text-gray-500 mt-0.5 whitespace-pre-line">{data.senderAddress}</div>}
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold uppercase tracking-wider" style={{ color: sym }}>{t.invoice}</div>
          <div className="text-sm text-gray-400 mt-1">{data.invoiceNumber}</div>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-end gap-3">
              <span className="text-gray-400 w-20 text-right">{t.date}:</span>
              <span className="font-medium text-right min-w-[100px]">{formatDate(data.invoiceDate)}</span>
            </div>
            <div className="flex justify-end gap-3">
              <span className="text-gray-400 w-20 text-right">{t.dueDate}:</span>
              <span className="font-medium text-right min-w-[100px]">{formatDate(data.dueDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-10 p-5 bg-gray-50 rounded-xl">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.to}</div>
        <div className="font-bold text-gray-900">{data.clientName}</div>
        {data.clientCompany && <div className="text-sm text-gray-600">{data.clientCompany}</div>}
        <div className="text-sm text-gray-500">{data.clientEmail}</div>
        {data.clientPhone && <div className="text-sm text-gray-500">{data.clientPhone}</div>}
        {data.clientAddress && <div className="text-sm text-gray-500 whitespace-pre-line">{data.clientAddress}</div>}
      </div>

      {/* Items table */}
      <div className="mb-8">
        <div className="grid grid-cols-12 gap-2 pb-3 border-b-2 text-xs font-bold text-gray-400 uppercase tracking-widest" style={{ borderColor: sym }}>
          <div className="col-span-5">{t.description}</div>
          <div className="col-span-2 text-center">{t.qty}</div>
          <div className="col-span-2 text-right">{t.unitPrice}</div>
          <div className="col-span-1 text-center">{t.tax}</div>
          <div className="col-span-2 text-right">{t.amount}</div>
        </div>
        {data.items.map((item, i) => (
          <div key={item.id} className={`grid grid-cols-12 gap-2 py-4 text-sm border-b border-gray-100 ${i % 2 === 1 ? '' : ''}`}>
            <div className="col-span-5">
              <div className="font-medium text-gray-900">{item.name || '—'}</div>
              {item.description && <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>}
            </div>
            <div className="col-span-2 text-center text-gray-600">{item.quantity}</div>
            <div className="col-span-2 text-right text-gray-600">{formatCurrency(item.unitPrice, data.currency)}</div>
            <div className="col-span-1 text-center text-gray-600">{item.taxRate}%</div>
            <div className="col-span-2 text-right font-semibold text-gray-900">{formatCurrency(item.total, data.currency)}</div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-72 space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>{t.subtotal}</span><span>{formatCurrency(data.subtotal, data.currency)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>{t.taxTotal}</span><span>{formatCurrency(data.taxAmount, data.currency)}</span>
          </div>
          {data.discount > 0 && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>{t.discount}</span><span>- {formatCurrency(data.discount, data.currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-3 border-t-2 text-gray-900" style={{ borderColor: sym }}>
            <span>{t.total}</span>
            <span style={{ color: sym }}>{formatCurrency(data.total, data.currency)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t.notes}</div>
          <div className="text-sm text-gray-600 whitespace-pre-line">{data.notes}</div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
        {data.footerNote}
      </div>
    </div>
  )
}
