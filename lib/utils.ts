import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
]

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol ?? code
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM dd, yyyy')
}

export function formatDateRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function generateInvoiceNumber(): string {
  const year  = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const rand  = Math.floor(Math.random() * 9000) + 1000
  return `INV-${year}${month}-${rand}`
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    draft:     'badge-muted',
    sent:      'badge-info',
    paid:      'badge-success',
    overdue:   'badge-danger',
    cancelled: 'badge-muted',
  }
  return map[status] ?? 'badge-muted'
}

export function calcInvoiceTotals(items: Array<{ quantity: number; unitPrice: number; taxRate: number }>, discount = 0) {
  const subtotal  = items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0)
  const taxAmount = items.reduce((acc, i) => acc + (i.quantity * i.unitPrice) * (i.taxRate / 100), 0)
  const total     = subtotal + taxAmount - discount
  return { subtotal, taxAmount, total: Math.max(total, 0) }
}

export const LANGS = {
  en: {
    invoice: 'Invoice',
    from: 'From',
    to: 'Bill To',
    invoiceNumber: 'Invoice #',
    date: 'Date',
    dueDate: 'Due Date',
    description: 'Description',
    qty: 'Qty',
    unitPrice: 'Unit Price',
    tax: 'Tax',
    amount: 'Amount',
    subtotal: 'Subtotal',
    taxTotal: 'Tax',
    discount: 'Discount',
    total: 'Total',
    notes: 'Notes',
    thankYou: 'Thank you for your business!',
  },
  bn: {
    invoice: 'চালান',
    from: 'প্রেরক',
    to: 'প্রাপক',
    invoiceNumber: 'চালান নং',
    date: 'তারিখ',
    dueDate: 'দেয় তারিখ',
    description: 'বিবরণ',
    qty: 'পরিমাণ',
    unitPrice: 'একক মূল্য',
    tax: 'কর',
    amount: 'মোট',
    subtotal: 'উপমোট',
    taxTotal: 'কর মোট',
    discount: 'ছাড়',
    total: 'সর্বমোট',
    notes: 'নোট',
    thankYou: 'আপনার ব্যবসার জন্য ধন্যবাদ!',
  },
}
