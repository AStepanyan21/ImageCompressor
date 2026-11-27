import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { CompressionResult } from '../components/CompressionResult'
import { ImageHistory, type HistoryStatus } from '../components/ImageHistory'
import { UploadForm } from '../components/UploadForm'
import { ImageService, type CompressedImage } from '../services/api'
import { isUnauthorized } from '../utils/errors'

interface LastResult {
  image: CompressedImage
  originalFile: File
}

export function Upload() {
  const { handleUnauthorized } = useAuth()
  const [history, setHistory] = useState<CompressedImage[]>([])
  const [historyStatus, setHistoryStatus] = useState<HistoryStatus>('loading')
  const [lastResult, setLastResult] = useState<LastResult | null>(null)

  // State is only updated after the request settles (initial status is already 'loading').
  const fetchHistory = useCallback(async () => {
    try {
      setHistory(await ImageService.list())
      setHistoryStatus('ready')
    } catch (err) {
      if (isUnauthorized(err)) {
        handleUnauthorized()
        return
      }
      setHistoryStatus('error')
    }
  }, [handleUnauthorized])

  useEffect(() => {
    // False positive: fetchHistory only sets state after the request resolves.
    // oxlint-disable-next-line react/set-state-in-effect
    fetchHistory()
  }, [fetchHistory])

  const retryHistory = () => {
    setHistoryStatus('loading')
    fetchHistory()
  }

  const handleCompressed = (image: CompressedImage, originalFile: File) => {
    setLastResult({ image, originalFile })
    setHistory((prev) => [image, ...prev.filter((item) => item.id !== image.id)])
  }

  return (
    <div className="upload-page">
      <div className="upload-grid">
        <UploadForm onCompressed={handleCompressed} />
        {lastResult && <CompressionResult image={lastResult.image} originalFile={lastResult.originalFile} />}
      </div>
      <ImageHistory images={history} status={historyStatus} onRetry={retryHistory} />
    </div>
  )
}
