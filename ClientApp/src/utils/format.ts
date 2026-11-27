import type { Language } from '../i18n/translations'
import type { TranslateFn } from '../i18n/I18nContext'

const UNITS = ['units.b', 'units.kb', 'units.mb', 'units.gb'] as const

export function formatBytes(bytes: number, language: Language, t: TranslateFn): string {
  let value = Math.max(0, bytes)
  let unit = 0
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024
    unit++
  }
  const number = new Intl.NumberFormat(language, { maximumFractionDigits: unit === 0 ? 0 : 1 }).format(value)
  return `${number} ${t(UNITS[unit])}`
}

/** Share of bytes saved, from 0 to 1. Returns null when sizes are unknown. */
export function savingsRatio(originalSize: number, compressedSize: number): number | null {
  if (originalSize <= 0) return null
  return Math.max(0, 1 - compressedSize / originalSize)
}

export function formatPercent(ratio: number, language: Language): string {
  return new Intl.NumberFormat(language, { style: 'percent', maximumFractionDigits: 0 }).format(ratio)
}

export function formatDate(iso: string, language: Language): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
