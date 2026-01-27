import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDaysDifference(dateString: string | null): number | null {
  if (!dateString) return null
  return differenceInDays(parseISO(dateString), new Date())
}

export function getSubscriptionStatusColor(days: number | null): string {
  if (days === null) return "text-gray-500" // Unknown
  if (days < 0) return "text-red-600" // Expired
  if (days < 3) return "text-red-600" // Critical
  if (days < 15) return "text-orange-600" // Warning
  return "text-green-600" // Good
}

export function getSubscriptionBadgeColor(days: number | null): string {
  if (days === null) return "bg-gray-100 text-gray-800"
  if (days < 0) return "bg-red-100 text-red-800"
  if (days < 3) return "bg-red-100 text-red-800"
  if (days < 15) return "bg-orange-100 text-orange-800"
  return "bg-green-100 text-green-800"
}
