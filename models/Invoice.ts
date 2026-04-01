import mongoose, { Schema, Document, Model } from 'mongoose'

export interface InvoiceItem {
  id: string
  name: string
  description?: string
  quantity: number
  unitPrice: number
  taxRate: number
  total: number
}

export interface IInvoice extends Document {
  userId: mongoose.Types.ObjectId
  invoiceNumber: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  template: 'minimal' | 'modern' | 'bold'
  brandColor: string
  currency: string
  // Sender
  senderName: string
  senderEmail: string
  senderAddress?: string
  senderPhone?: string
  senderLogo?: string
  // Client
  clientName: string
  clientEmail: string
  clientAddress?: string
  clientPhone?: string
  clientCompany?: string
  // Dates
  invoiceDate: Date
  dueDate: Date
  // Items
  items: InvoiceItem[]
  // Financials
  subtotal: number
  taxAmount: number
  discount: number
  total: number
  // Notes
  notes?: string
  footerNote?: string
  // Meta
  createdAt: Date
  updatedAt: Date
}

const InvoiceItemSchema = new Schema<InvoiceItem>({
  id:          { type: String, required: true },
  name:        { type: String, required: true },
  description: String,
  quantity:    { type: Number, required: true, min: 0 },
  unitPrice:   { type: Number, required: true, min: 0 },
  taxRate:     { type: Number, default: 0, min: 0 },
  total:       { type: Number, required: true, min: 0 },
}, { _id: false })

const InvoiceSchema = new Schema<IInvoice>(
  {
    userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    invoiceNumber: { type: String, required: true },
    status:        { type: String, enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], default: 'draft' },
    template:      { type: String, enum: ['minimal', 'modern', 'bold'], default: 'minimal' },
    brandColor:    { type: String, default: '#6366f1' },
    currency:      { type: String, default: 'USD' },
    senderName:    { type: String, required: true },
    senderEmail:   { type: String, required: true },
    senderAddress: String,
    senderPhone:   String,
    senderLogo:    String,
    clientName:    { type: String, required: true },
    clientEmail:   { type: String, required: true },
    clientAddress: String,
    clientPhone:   String,
    clientCompany: String,
    invoiceDate:   { type: Date, required: true },
    dueDate:       { type: Date, required: true },
    items:         { type: [InvoiceItemSchema], default: [] },
    subtotal:      { type: Number, default: 0 },
    taxAmount:     { type: Number, default: 0 },
    discount:      { type: Number, default: 0 },
    total:         { type: Number, default: 0 },
    notes:         String,
    footerNote:    String,
  },
  { timestamps: true }
)

InvoiceSchema.index({ userId: 1, createdAt: -1 })

const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema)
export default Invoice
