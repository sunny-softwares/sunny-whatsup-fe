'use client';

import { useRef, useState } from 'react';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import { MEDIA, MEDIA_MESSAGES, validatePdfFile } from '@/constants';
import { pickErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PdfUploadProps<T> {
  // Name of the currently-uploaded file, or null when nothing is attached.
  fileName: string | null;
  disabled?: boolean;
  // Uploads the chosen file and resolves with the endpoint-specific result
  // (e.g. a header_handle or a media_id) which is handed back via onChange.
  upload: (file: File) => Promise<T>;
  onChange: (next: { fileName: string; result: T } | null) => void;
}

export function PdfUpload<T>({ fileName, disabled, upload, onChange }: PdfUploadProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const validationError = validatePdfFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setUploading(true);
    try {
      const result = await upload(file);
      onChange({ fileName: file.name, result });
    } catch (err) {
      setError(pickErrorMessage(err, MEDIA_MESSAGES.UPLOAD_FAILED));
    } finally {
      setUploading(false);
      // Reset so selecting the same file again re-triggers onChange.
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={MEDIA.ACCEPT_PDF}
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => handleSelect(e.target.files?.[0])}
      />

      {fileName ? (
        <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{fileName}</span>
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            disabled={disabled || uploading}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">{MEDIA_MESSAGES.REMOVE}</span>
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          ) : (
            <Upload className="mr-2 h-3 w-3" />
          )}
          {uploading ? MEDIA_MESSAGES.UPLOADING : MEDIA_MESSAGES.CHOOSE_FILE}
        </Button>
      )}

      <p className="text-xs text-muted-foreground">{MEDIA_MESSAGES.HINT}</p>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
