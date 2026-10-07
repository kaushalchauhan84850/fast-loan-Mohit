import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MAX_DOC_SIZE_MB,
  ACCEPTED_DOC_TYPES,
  validateDocumentFile,
} from '../../services/kycService.js';
import { IconUpload, IconFileText, IconX, IconCheckCircle, IconRefresh } from '../ui/Icons.jsx';

const EXTENSIONS = '.jpg,.jpeg,.png,.pdf';

/**
 * Single-file drop zone with type/size validation, image thumbnail or PDF
 * chip preview, and replace/remove. The File object stays in memory only —
 * it is never serialized into localStorage.
 */
export default function FileUploadCard({ id, title, hint, file, onChange, disabled = false }) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);

  // Revoke object URLs to avoid leaks
  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
    return undefined;
  }, [file]);

  const accept = (picked) => {
    if (!picked) return;
    try {
      validateDocumentFile(picked, title);
      setError(null);
      onChange(picked);
    } catch (err) {
      setError(err.message);
      onChange(null);
    }
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={EXTENSIONS}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => accept(e.target.files?.[0])}
        aria-label={`${title} upload`}
      />

      {file ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={`${title} preview`}
              className="h-16 w-16 rounded-xl border border-navy-100 object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-navy-950 text-emerald-400">
              <IconFileText size={26} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
              <IconCheckCircle size={15} className="text-emerald-600" aria-hidden="true" />
              {file.name}
            </p>
            <p className="mt-0.5 text-xs text-navy-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type === 'application/pdf' ? 'PDF' : 'Image'}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={openPicker}
              disabled={disabled}
              aria-label={`Replace ${title} file`}
              className="rounded-lg p-2 text-navy-500 transition-colors hover:bg-white hover:text-navy-800"
            >
              <IconRefresh size={17} />
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              disabled={disabled}
              aria-label={`Remove ${title} file`}
              className="rounded-lg p-2 text-red-500 transition-colors hover:bg-white hover:text-red-600"
            >
              <IconX size={17} />
            </button>
          </div>
        </motion.div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            accept(e.dataTransfer.files?.[0]);
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragOver
              ? 'border-emerald-500 bg-emerald-50'
              : error
                ? 'border-red-300 bg-red-50/40'
                : 'border-navy-200 bg-navy-50/50 hover:border-emerald-400 hover:bg-emerald-50/40'
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-950 text-emerald-400">
            <IconUpload size={20} />
          </span>
          <span className="text-sm font-semibold text-navy-800">
            Upload {title} <span className="text-red-500" aria-hidden="true">*</span>
          </span>
          <span className="text-xs text-navy-500">{hint ?? `JPG, PNG or PDF · max ${MAX_DOC_SIZE_MB}MB`}</span>
        </button>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
