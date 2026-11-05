import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

interface LogoUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ value, onChange, error }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(value);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [value]);

  const handleFileSelect = (file: File | undefined) => {
    if (file) onChange(file);
  };

  return (
    <div className="form-field">
      <label className="form-label">Team Logo</label>

      <div className="logo-upload">
        <button
          type="button"
          className="logo-upload__dropzone"
          onClick={() => inputRef.current?.click()}
          aria-label="Upload team logo"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Team logo preview"
              className="logo-upload__preview"
            />
          ) : (
            <ImagePlus size={22} />
          )}
        </button>

        <div className="logo-upload__meta">
          <p className="text-sm text-secondary">
            • Max size: 2 MB<br />• Accepted formats: PNG, JPG<br />• Square aspect ratio recommended
          </p>

          {value && (
            <button
              type="button"
              className="logo-upload__remove"
              onClick={() => {
                onChange(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
            >
              <X size={14} />
              Remove
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          hidden
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />
      </div>

      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default LogoUpload;