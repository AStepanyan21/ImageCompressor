import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadService } from '../services/api';

export function Result() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'complete' | 'error'>('checking');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    try {
      // In a real app, this would poll an API endpoint to check compression status
      // For now, simulate success with a delay
      setStatus('complete');
      setResultUrl('http://localhost:5114/images/compressed-image.jpg');
    } catch (err: any) {
      setError(err.message || 'Failed to check status');
      setStatus('error');
    }
  };

  const handleCheckStatus = () => {
    setStatus('checking');
    setError(null);
    setTimeout(checkStatus, 1000);
  };

  const handleUploadAnother = () => {
    navigate('/upload');
  };

  return (
    <div className="result-container">
      <div className="result-card">
        <h2>Compression Result</h2>

        {status === 'checking' && (
          <div className="status-checking">
            <p>Checking compression status...</p>
            <button onClick={handleCheckStatus} className="btn-primary">
              Check Status
            </button>
          </div>
        )}

        {status === 'complete' && resultUrl && (
          <div className="result-success">
            <h3>Image compressed successfully!</h3>
            <div className="preview-container">
              <img src={resultUrl} alt="Compressed" className="preview-image" />
            </div>
            <div className="result-actions">
              <a href={resultUrl} className="btn-primary" download>
                Download
              </a>
              <button onClick={handleUploadAnother} className="btn-secondary">
                Upload Another
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="status-error">
            <p className="error-message">{error}</p>
            <button onClick={handleCheckStatus} className="btn-primary">
              Try Again
            </button>
          </div>
        )}

        <p className="result-hint">
          Note: In this demo, the status check simulates completion after 1 second.
          In production, this would poll your API endpoint for actual status.
        </p>
      </div>
    </div>
  );
}
