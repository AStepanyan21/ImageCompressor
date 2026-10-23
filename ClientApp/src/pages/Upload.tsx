import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadService } from '../services/api';

export function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsLoading(true);

    try {
      await UploadService.uploadImage(file);
      navigate('/result');
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setError(null);
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Upload Image</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-input-wrapper">
            <input
              type="file"
              id="fileInput"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
              className="hidden-file-input"
            />
            <button type="button" onClick={handleSelectClick} className="btn-primary">
              {file ? 'Change File' : 'Select Image'}
            </button>
          </div>

          {preview && (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
              <div className="preview-info">
                <span>{file?.name}</span>
                <button type="button" onClick={handleClear} className="btn-link">
                  Remove
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Uploading...' : 'Upload & Wait'}
          </button>
        </form>

        <p className="upload-hint">
          Supported formats: JPG, PNG, GIF, WEBP
        </p>
      </div>
    </div>
  );
}
