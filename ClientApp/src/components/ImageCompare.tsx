import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { useI18n } from '../i18n/I18nContext'

interface ImageCompareProps {
  beforeSrc: string
  afterSrc: string
  beforeLabel: string
  afterLabel: string
  /** Initial divider position in percent (0 = all "after", 100 = all "before"). */
  initialPosition?: number
}

const KEYBOARD_STEP = 5

const clamp = (value: number) => Math.min(100, Math.max(0, value))

/**
 * Before/after comparison slider: the "before" image is shown left of the divider,
 * the "after" image right of it. The divider can be dragged with mouse/touch or moved with the keyboard.
 */
export function ImageCompare({ beforeSrc, afterSrc, beforeLabel, afterLabel, initialPosition = 50 }: ImageCompareProps) {
  const { t } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(clamp(initialPosition))
  const [isDragging, setIsDragging] = useState(false)

  const updateFromPointer = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    setPosition(clamp(((clientX - rect.left) / rect.width) * 100))
  }

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    // Keep receiving moves even when the pointer leaves the image while dragging.
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setIsDragging(true)
    updateFromPointer(e.clientX)
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (isDragging) updateFromPointer(e.clientX)
  }

  const stopDragging = () => setIsDragging(false)

  const handleKeyDown = (e: KeyboardEvent) => {
    const next: Record<string, number> = {
      ArrowLeft: position - KEYBOARD_STEP,
      ArrowDown: position - KEYBOARD_STEP,
      ArrowRight: position + KEYBOARD_STEP,
      ArrowUp: position + KEYBOARD_STEP,
      Home: 0,
      End: 100,
    }
    if (e.key in next) {
      e.preventDefault()
      setPosition(clamp(next[e.key]))
    }
  }

  return (
    <div
      ref={containerRef}
      className={`image-compare${isDragging ? ' dragging' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      data-testid="image-compare"
    >
      {/* The "after" image defines the box size; "before" is laid exactly on top of it. */}
      <img src={afterSrc} alt={afterLabel} className="image-compare-img" draggable={false} />
      <img
        src={beforeSrc}
        alt={beforeLabel}
        className="image-compare-img image-compare-before"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        draggable={false}
      />

      <span className="image-compare-label image-compare-label-before" aria-hidden="true">{beforeLabel}</span>
      <span className="image-compare-label image-compare-label-after" aria-hidden="true">{afterLabel}</span>

      <div
        className="image-compare-handle"
        style={{ left: `${position}%` }}
        role="slider"
        tabIndex={0}
        aria-label={t('compare.label')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-valuetext={t('compare.valueText', { percent: Math.round(position) })}
        onKeyDown={handleKeyDown}
      >
        <span className="image-compare-knob" aria-hidden="true">‹ ›</span>
      </div>
    </div>
  )
}
