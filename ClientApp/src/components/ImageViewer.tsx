import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent } from 'react'
import { useI18n } from '../i18n/I18nContext'
import type { CompressedImage } from '../services/api'
import { formatBytes, formatDate, formatPercent, savingsRatio } from '../utils/format'

interface ImageViewerProps {
  images: CompressedImage[]
  index: number
  onNavigate: (index: number) => void
  onClose: () => void
}

/** Full-size modal viewer for compressed images with keyboard navigation. */
export function ImageViewer({ images, index, onNavigate, onClose }: ImageViewerProps) {
  const { t, language } = useI18n()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const image = images[index]
  const hasPrevious = index > 0
  const hasNext = index < images.length - 1

  // Keep the latest handlers in a ref so the document listener is registered only once.
  const handlersRef = useRef({ onClose, onNavigate, index, hasPrevious, hasNext })
  useLayoutEffect(() => {
    handlersRef.current = { onClose, onNavigate, index, hasPrevious, hasNext }
  })

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      const h = handlersRef.current
      if (e.key === 'Escape') {
        e.preventDefault()
        h.onClose()
      } else if (e.key === 'ArrowLeft' && h.hasPrevious) {
        e.preventDefault()
        h.onNavigate(h.index - 1)
      } else if (e.key === 'ArrowRight' && h.hasNext) {
        e.preventDefault()
        h.onNavigate(h.index + 1)
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      // Return focus to the history item that opened the viewer.
      previouslyFocused?.focus?.()
    }
  }, [])

  // Simple focus trap: Tab cycles through the dialog's controls only.
  const handleTrapKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]')
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!image) return null

  const name = image.originalFileName || t('history.untitled')
  const ratio = savingsRatio(image.originalSize, image.compressedSize)

  return (
    <div className="viewer-backdrop" onClick={handleBackdropClick} data-testid="viewer-backdrop">
      <div
        ref={dialogRef}
        className="viewer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="viewer-title"
        onKeyDown={handleTrapKeyDown}
      >
        <header className="viewer-header">
          <div className="viewer-title-block">
            <h3 id="viewer-title" className="viewer-title" title={name}>{name}</h3>
            {images.length > 1 && (
              <span className="viewer-counter">
                {t('viewer.counter', { current: index + 1, total: images.length })}
              </span>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="viewer-icon-button"
            onClick={onClose}
            aria-label={t('viewer.close')}
          >
            ✕
          </button>
        </header>

        <div className="viewer-stage">
          {hasPrevious && (
            <button
              type="button"
              className="viewer-nav viewer-nav-prev"
              onClick={() => onNavigate(index - 1)}
              aria-label={t('viewer.previous')}
            >
              ‹
            </button>
          )}
          {/* key resets loading state when switching images */}
          <ViewerImage key={image.id} src={image.url} alt={name} />
          {hasNext && (
            <button
              type="button"
              className="viewer-nav viewer-nav-next"
              onClick={() => onNavigate(index + 1)}
              aria-label={t('viewer.next')}
            >
              ›
            </button>
          )}
        </div>

        <footer className="viewer-footer">
          <div className="viewer-meta">
            <span>
              {image.originalSize > 0 && <>{formatBytes(image.originalSize, language, t)} → </>}
              <strong>{formatBytes(image.compressedSize, language, t)}</strong>
              {ratio !== null && ratio > 0 && <span className="history-saved"> −{formatPercent(ratio, language)}</span>}
            </span>
            <span className="muted">
              {formatDate(image.createdAt, language)}
              {image.quality > 0 && <> · {t('history.quality', { quality: image.quality })}</>}
            </span>
          </div>
          <a href={image.downloadUrl} className="btn-primary btn-small" download>
            {t('result.download')}
          </a>
        </footer>
      </div>
    </div>
  )
}

function ViewerImage({ src, alt }: { src: string; alt: string }) {
  const { t } = useI18n()
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div className="viewer-image-wrapper">
      {state === 'loading' && <span className="spinner viewer-spinner" role="status" aria-label={t('common.loading')} />}
      {state === 'error' ? (
        <p className="error-message" role="alert">{t('viewer.loadError')}</p>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`viewer-image${state === 'loaded' ? ' loaded' : ''}`}
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
        />
      )}
    </div>
  )
}
