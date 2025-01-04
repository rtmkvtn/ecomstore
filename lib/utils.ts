import { type ClassValue, clsx } from 'clsx'
import { json } from 'node:stream/consumers'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert prisma obj into regular ts obj
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}
