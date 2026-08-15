import { MEDIA } from '@/constants';
import { pickErrorMessage } from '@/lib/utils';

export interface DownloadedFile {
  blob: Blob;
  filename: string;
}

const FILENAME_RE = /filename="?([^";]+)"?/i;

/** Pulls the download name out of a Content-Disposition header. */
export const filenameFromDisposition = (disposition: unknown, fallback: string): string => {
  if (typeof disposition !== 'string') return fallback;
  return FILENAME_RE.exec(disposition)?.[1]?.trim() || fallback;
};

/** Hands the blob to the browser as a file save, then releases the object URL. */
export const saveBlob = ({ blob, filename }: DownloadedFile): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || MEDIA.DEFAULT_DOWNLOAD_FILENAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * Error message for a failed blob request. Responses to `responseType: 'blob'`
 * requests arrive as blobs even when the server returned a JSON error, so the
 * body has to be read back before the API's message can be surfaced.
 */
export const pickBlobErrorMessage = async (err: unknown, fallback: string): Promise<string> => {
  const data = (err as { response?: { data?: unknown } })?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      if (parsed?.error?.message) return parsed.error.message as string;
    } catch {
      // Not JSON (or unreadable) — fall through to the generic message.
    }
  }
  return pickErrorMessage(err, fallback);
};
