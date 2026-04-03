import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function formatCurrencyExact(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export function formatRate(rate: number): string {
  return `${rate.toFixed(2)}%`
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

export function getRateColor(rate: number, benchmark = 2.9): string {
  if (rate > benchmark + 0.3) return 'text-red-500'
  if (rate > benchmark + 0.1) return 'text-yellow-500'
  return 'text-emerald-500'
}

export function getRateBadgeClass(rate: number, benchmark = 2.9): string {
  if (rate > benchmark + 0.3) return 'bg-red-50 text-red-700 border border-red-200'
  if (rate > benchmark + 0.1) return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
  return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
}

export function brandColor(brand: string): string {
  const colors: Record<string, string> = {
    visa: '#1A1F71',
    mastercard: '#EB001B',
    amex: '#007B40',
    discover: '#FF6600',
    unknown: '#94A3B8',
  }
  return colors[brand.toLowerCase()] ?? '#94A3B8'
}

export function brandLabel(brand: string): string {
  const labels: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'Amex',
    discover: 'Discover',
    unknown: 'Other',
  }
  return labels[brand.toLowerCase()] ?? brand
}

export function currentMonthBucket(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
