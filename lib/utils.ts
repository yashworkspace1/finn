import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format a number as Indian Rupees with ₹ prefix and commas */
export function formatINR(amount: number): string {
  if (!amount && amount !== 0) return '₹0'
  return '₹' + Math.round(amount).toLocaleString('en-IN')
}

/** Compact format: 1.2L, 3.5Cr, 12K, etc. */
export function formatINRCompact(amount: number): string {
  if (!amount && amount !== 0) return '₹0'
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)}Cr`
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`
  return `₹${Math.round(amount)}`
}
