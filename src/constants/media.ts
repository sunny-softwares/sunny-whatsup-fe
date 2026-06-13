// Document attachment constants. Scope is limited to a single PDF per message,
// up to 10 MB, mirroring the backend `MEDIA` constants.
export const MEDIA = {
  PDF_MIME_TYPE: 'application/pdf',
  // `accept` attribute for the <input type="file"> control.
  ACCEPT_PDF: 'application/pdf,.pdf',
  MAX_DOCUMENT_SIZE_BYTES: 10 * 1024 * 1024,
  MAX_DOCUMENT_SIZE_LABEL: '10 MB',
  // Multipart field name expected by the upload endpoints.
  UPLOAD_FIELD_NAME: 'file',
} as const;

export const MEDIA_MESSAGES = {
  INVALID_TYPE: 'Only PDF files are allowed.',
  TOO_LARGE: `File must be ${MEDIA.MAX_DOCUMENT_SIZE_LABEL} or smaller.`,
  UPLOADING: 'Uploading…',
  UPLOAD_FAILED: 'Failed to upload the document. Please try again.',
  REQUIRED: 'Please attach a PDF document.',
  REMOVE: 'Remove',
  REPLACE: 'Replace file',
  CHOOSE_FILE: 'Choose PDF',
  HINT: `PDF only, up to ${MEDIA.MAX_DOCUMENT_SIZE_LABEL}.`,
} as const;

// Client-side guard mirroring the backend validation so users get instant feedback.
export const validatePdfFile = (file: File): string | null => {
  if (file.type !== MEDIA.PDF_MIME_TYPE) return MEDIA_MESSAGES.INVALID_TYPE;
  if (file.size > MEDIA.MAX_DOCUMENT_SIZE_BYTES) return MEDIA_MESSAGES.TOO_LARGE;
  return null;
};
