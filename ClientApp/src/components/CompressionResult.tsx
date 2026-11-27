import { useI18n } from '../i18n/I18nContext'
import { useObjectUrl } from '../hooks'
import type { CompressedImage } from '../services/api'
import { formatBytes, formatPercent, savingsRatio } from '../utils/format'
import { ImageCompare } from './ImageCompare'

interface CompressionResultProps {
  image: CompressedImage
  originalFile: File
}

export function CompressionResult({ image, originalFile }: CompressionResultProps) {
  const { t, language } = useI18n()
  const originalPreview = useObjectUrl(originalFile)
  const ratio = savingsRatio(image.originalSize, image.compressedSize)
  const isSmaller = ratio !== null && image.compressedSize < image.originalSize

  return (
    <section className="card result-card" aria-live="polite">
      <div className="result-header">
        <h2>{t('result.title')}</h2>
        {isSmaller && <span className="badge badge-success">{t('result.saved', { percent: formatPercent(ratio, language) })}</span>}
      </div>

      {!isSmaller && <p className="hint">{t('result.notSmaller')}</p>}

      {originalPreview && (
        <ImageCompare
          beforeSrc={originalPreview}
          afterSrc={image.url}
          beforeLabel={t('result.original')}
          afterLabel={t('result.compressed')}
        />
      )}

      <div className="comparison-sizes">
        <span>
          {t('result.original')}: <strong>{formatBytes(image.originalSize, language, t)}</strong>
        </span>
        <span className="hint">{t('compare.hint')}</span>
        <span>
          {t('result.compressed')}: <strong>{formatBytes(image.compressedSize, language, t)}</strong>
        </span>
      </div>

      <a href={image.downloadUrl} className="btn-primary btn-block" download>
        {t('result.download')}
      </a>
    </section>
  )
}
