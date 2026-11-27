import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import type { CompressedImage } from '../services/api'
import { formatBytes, formatDate, formatPercent, savingsRatio } from '../utils/format'
import { ImageViewer } from './ImageViewer'

export type HistoryStatus = 'loading' | 'ready' | 'error'

interface ImageHistoryProps {
  images: CompressedImage[]
  status: HistoryStatus
  onRetry: () => void
}

export function ImageHistory({ images, status, onRetry }: ImageHistoryProps) {
  const { t, language } = useI18n()
  // Track by id, not index: a new upload is prepended and would shift indexes.
  const [viewedId, setViewedId] = useState<number | null>(null)
  const viewedIndex = viewedId === null ? -1 : images.findIndex((image) => image.id === viewedId)

  return (
    <section className="card history-card" aria-labelledby="history-title">
      <h2 id="history-title">{t('history.title')}</h2>

      {status === 'loading' && (
        <p className="muted" role="status">
          <span className="spinner spinner-small" aria-hidden="true" /> {t('common.loading')}
        </p>
      )}

      {status === 'error' && (
        <div className="error-message" role="alert">
          {t('history.loadError')}{' '}
          <button type="button" className="btn-link" onClick={onRetry}>
            {t('history.retry')}
          </button>
        </div>
      )}

      {status === 'ready' && images.length === 0 && <p className="muted">{t('history.empty')}</p>}

      {images.length > 0 && (
        <ul className="history-list">
          {images.map((image) => {
            const ratio = savingsRatio(image.originalSize, image.compressedSize)
            const name = image.originalFileName || t('history.untitled')
            return (
              <li key={image.id} className="history-item">
                <button
                  type="button"
                  className="history-open"
                  onClick={() => setViewedId(image.id)}
                  aria-label={t('history.open', { name })}
                >
                  <img src={image.url} alt="" className="history-thumb" loading="lazy" />
                </button>
                <div className="history-info">
                  <button
                    type="button"
                    className="history-name"
                    title={name}
                    onClick={() => setViewedId(image.id)}
                  >
                    {name}
                  </button>
                  <span className="history-meta">
                    {image.originalSize > 0 && <>{formatBytes(image.originalSize, language, t)} → </>}
                    {formatBytes(image.compressedSize, language, t)}
                    {ratio !== null && ratio > 0 && <span className="history-saved"> −{formatPercent(ratio, language)}</span>}
                  </span>
                  <span className="history-meta muted">
                    {formatDate(image.createdAt, language)}
                    {image.quality > 0 && <> · {t('history.quality', { quality: image.quality })}</>}
                  </span>
                </div>
                <a href={image.downloadUrl} className="btn-secondary btn-small" download>
                  {t('result.download')}
                </a>
              </li>
            )
          })}
        </ul>
      )}

      {viewedIndex >= 0 && (
        <ImageViewer
          images={images}
          index={viewedIndex}
          onNavigate={(index) => setViewedId(images[index].id)}
          onClose={() => setViewedId(null)}
        />
      )}
    </section>
  )
}
