import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { useObjectUrl } from '../hooks'
import { ImageService, type CompressedImage } from '../services/api'
import { getErrorMessage, isUnauthorized } from '../utils/errors'
import { formatBytes } from '../utils/format'

export const DEFAULT_QUALITY = 75

interface UploadFormProps {
  onCompressed: (image: CompressedImage, originalFile: File) => void
}

export function UploadForm({ onCompressed }: UploadFormProps) {
  const { t, language } = useI18n()
  const { handleUnauthorized } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState(DEFAULT_QUALITY)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const preview = useObjectUrl(file)

  const selectFile = (selected: File | undefined) => {
    if (!selected) return
    if (!selected.type.startsWith('image/')) {
      setError(t('upload.invalidType'))
      return
    }
    setError(null)
    setFile(selected)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    selectFile(e.target.files?.[0])
    // Reset so that picking the same file again still triggers onChange.
    e.target.value = ''
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    if (!isLoading) setIsDragging(true)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (!isLoading) selectFile(e.dataTransfer.files?.[0])
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) return

    setError(null)
    setIsLoading(true)
    try {
      const image = await ImageService.upload(file, quality)
      onCompressed(image, file)
    } catch (err) {
      if (isUnauthorized(err)) {
        handleUnauthorized()
        return
      }
      setError(getErrorMessage(err, t, { 400: 'upload.unsupported' }))
    } finally {
      setIsLoading(false)
    }
  }

  const openFilePicker = () => fileInputRef.current?.click()

  return (
    <div className="card upload-card">
      <h2>{t('upload.title')}</h2>
      <p className="card-subtitle">{t('app.tagline')}</p>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          disabled={isLoading}
          className="visually-hidden"
          data-testid="file-input"
          tabIndex={-1}
        />

        <div
          className={`dropzone${isDragging ? ' dragging' : ''}${file ? ' has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {file && preview ? (
            <div className="dropzone-preview">
              <img src={preview} alt={t('upload.preview')} className="preview-image" />
              <div className="file-info">
                <span className="file-name" title={file.name}>{file.name}</span>
                <span className="file-size">{formatBytes(file.size, language, t)}</span>
              </div>
              <div className="file-actions">
                <button type="button" onClick={openFilePicker} className="btn-secondary btn-small" disabled={isLoading}>
                  {t('upload.change')}
                </button>
                <button type="button" onClick={() => setFile(null)} className="btn-link" disabled={isLoading}>
                  {t('upload.remove')}
                </button>
              </div>
            </div>
          ) : (
            <div className="dropzone-empty">
              <span className="dropzone-icon" aria-hidden="true">⇪</span>
              <p>{t('upload.drop')}</p>
              <p className="muted">{t('upload.or')}</p>
              <button type="button" onClick={openFilePicker} className="btn-secondary" disabled={isLoading}>
                {t('upload.choose')}
              </button>
              <p className="hint">{t('upload.formats')}</p>
            </div>
          )}
        </div>

        <div className="quality-control">
          <div className="quality-header">
            <label htmlFor="quality">{t('upload.quality')}</label>
            <output htmlFor="quality" className="quality-value">{quality}</output>
          </div>
          <input
            id="quality"
            type="range"
            min={1}
            max={100}
            step={1}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            disabled={isLoading}
          />
          <p className="hint">{t('upload.qualityHint')}</p>
        </div>

        <button type="submit" disabled={!file || isLoading} className="btn-primary btn-block">
          {isLoading ? (
            <>
              <span className="spinner spinner-small" aria-hidden="true" /> {t('upload.submitting')}
            </>
          ) : (
            t('upload.submit')
          )}
        </button>
      </form>
    </div>
  )
}
