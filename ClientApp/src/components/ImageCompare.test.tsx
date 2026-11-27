import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ImageCompare } from './ImageCompare'

function renderCompare() {
  render(<ImageCompare beforeSrc="blob:original" afterSrc="/api/image/1/content" beforeLabel="Original" afterLabel="Compressed" />)
  const container = screen.getByTestId('image-compare')
  // jsdom has no layout: pretend the widget is 200px wide starting at x=100.
  vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
    left: 100, width: 200, top: 0, height: 100, right: 300, bottom: 100, x: 100, y: 0, toJSON: () => ({}),
  } as DOMRect)
  return { container, slider: screen.getByRole('slider'), before: screen.getByAltText('Original') }
}

describe('ImageCompare', () => {
  it('shows original over compressed, split in the middle by default', () => {
    const { slider, before } = renderCompare()
    expect(screen.getByAltText('Compressed')).toHaveAttribute('src', '/api/image/1/content')
    expect(before).toHaveAttribute('src', 'blob:original')
    expect(slider).toHaveAttribute('aria-valuenow', '50')
    expect(before.style.clipPath).toBe('inset(0 50% 0 0)')
  })

  it('moves the divider while dragging with the mouse and stops after release', () => {
    const { container, slider, before } = renderCompare()

    fireEvent.pointerDown(container, { button: 0, clientX: 150, pointerId: 1 })
    expect(slider).toHaveAttribute('aria-valuenow', '25')

    fireEvent.pointerMove(container, { clientX: 250, pointerId: 1 })
    expect(slider).toHaveAttribute('aria-valuenow', '75')
    expect(before.style.clipPath).toBe('inset(0 25% 0 0)')

    // Dragging past the edges is clamped.
    fireEvent.pointerMove(container, { clientX: 1000, pointerId: 1 })
    expect(slider).toHaveAttribute('aria-valuenow', '100')

    fireEvent.pointerUp(container, { pointerId: 1 })
    fireEvent.pointerMove(container, { clientX: 120, pointerId: 1 })
    expect(slider).toHaveAttribute('aria-valuenow', '100')
  })

  it('ignores moves without a pressed pointer', () => {
    const { container, slider } = renderCompare()
    fireEvent.pointerMove(container, { clientX: 120 })
    expect(slider).toHaveAttribute('aria-valuenow', '50')
  })

  it('can be moved with the keyboard', () => {
    const { slider } = renderCompare()
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(slider).toHaveAttribute('aria-valuenow', '55')
    fireEvent.keyDown(slider, { key: 'ArrowLeft' })
    fireEvent.keyDown(slider, { key: 'ArrowLeft' })
    expect(slider).toHaveAttribute('aria-valuenow', '45')
    fireEvent.keyDown(slider, { key: 'End' })
    expect(slider).toHaveAttribute('aria-valuenow', '100')
    fireEvent.keyDown(slider, { key: 'Home' })
    expect(slider).toHaveAttribute('aria-valuenow', '0')
    fireEvent.keyDown(slider, { key: 'ArrowLeft' })
    expect(slider).toHaveAttribute('aria-valuenow', '0')
  })
})
