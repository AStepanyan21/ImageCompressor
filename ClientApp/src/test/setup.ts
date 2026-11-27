import { afterEach, expect, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
  try {
    localStorage.clear()
  } catch {
    // storage may be unavailable in some environments
  }
})

// jsdom does not implement object URLs, which are used for local image previews.
if (!URL.createObjectURL) {
  URL.createObjectURL = vi.fn(() => 'blob:preview')
  URL.revokeObjectURL = vi.fn()
}
