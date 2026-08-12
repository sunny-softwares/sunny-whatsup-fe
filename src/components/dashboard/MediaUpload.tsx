'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, ImageIcon, Loader2, Upload, X } from 'lucide-react';
import {
  MEDIA_MESSAGES,
  MEDIA_RULES,
  TEMPLATE_HEADER_FORMAT,
  validateMediaFile,
  type UploadableHeaderFormat,
} from '@/constants';
import { pickErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface MediaUploadValue<T> {
  fileName: string;
  // Object URL for image previews; null for documents.
  previewUrl: string | null;
  result: T;
}

interface MediaUploadProps<T> {
  // Which header format the file fills — drives the accepted types and limits.
  format: UploadableHeaderFormat;
  // Name of the currently-uploaded file, or null when nothing is attached.
  fileName: string | null;
  disabled?: boolean;
  // Uploads the chosen file and resolves with the endpoint-specific result
  // (e.g. a header_handle or a media_id) which is handed back via onChange.
  upload: (file: File) => Promise<T>;
  onChange: (next: MediaUploadValue<T> | null) => void;
}

export function MediaUpload<T>({
  format,
  fileName,
  disabled,
  upload,
  onChange,
}: MediaUploadProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Object URLs are owned here so they can be revoked when replaced or unmounted.
  const previewUrlRef = useRef<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isImage = format === TEMPLATE_HEADER_FORMAT.IMAGE;
  const rules = MEDIA_RULES[format];

  const releasePreview = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
  };

  useEffect(() => releasePreview, []);

  const handleSelect = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const validationError = validateMediaFile(file, format);
    if (validationError) {
      setError(validationError);
      return;
    }
    setUploading(true);
    try {
      const result = await upload(file);
      releasePreview();
      previewUrlRef.current = isImage ? URL.createObjectURL(file) : null;
      onChange({ fileName: file.name, previewUrl: previewUrlRef.current, result });
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
    releasePreview();
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={rules.accept}
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => handleSelect(e.target.files?.[0])}
      />

      {fileName ? (
        <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            {isImage ? (
              <ImageIcon className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <FileText className="h-4 w-4 shrink-0 text-primary" />
            )}
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
          {uploading ? MEDIA_MESSAGES.UPLOADING : MEDIA_MESSAGES.CHOOSE_FILE[format]}
        </Button>
      )}

      <p className="text-xs text-muted-foreground">{MEDIA_MESSAGES.HINT[format]}</p>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
