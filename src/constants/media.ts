import { TEMPLATE_HEADER_FORMAT, type TemplateHeaderFormat } from './templates';

// Attachment constants. Scope is a single file per message — a PDF document or a
// JPEG/PNG image — mirroring the backend `MEDIA` constants.
export const MEDIA = {
  PDF_MIME_TYPE: 'application/pdf',
  IMAGE_MIME_TYPES: ['image/jpeg', 'image/png'] as string[],
  // Browsers occasionally report JPEGs as the unregistered `image/jpg`.
  JPG_MIME_ALIAS: 'image/jpg',
  // `accept` attributes for the <input type="file"> control.
  ACCEPT_PDF: 'application/pdf,.pdf',
  ACCEPT_IMAGE: 'image/jpeg,image/png,.jpg,.jpeg,.png',
  MAX_DOCUMENT_SIZE_BYTES: 10 * 1024 * 1024,
  MAX_DOCUMENT_SIZE_LABEL: '10 MB',
  MAX_IMAGE_SIZE_BYTES: 1 * 1024 * 1024,
  MAX_IMAGE_SIZE_LABEL: '1 MB',
  // Multipart field name expected by the upload endpoints.
  UPLOAD_FIELD_NAME: 'file',
  // Parameter types a sent message's header component may carry when the
  // template has a media header (mirrors Meta's parameter object keys).
  MEDIA_HEADER_PARAM_TYPES: ['image', 'document', 'video'] as string[],
  // Fallback name for a downloaded attachment whose name we don't know.
  DEFAULT_DOWNLOAD_FILENAME: 'attachment',
} as const;

// Template header formats a company can fill by uploading a file.
export const UPLOADABLE_HEADER_FORMATS = [
  TEMPLATE_HEADER_FORMAT.DOCUMENT,
  TEMPLATE_HEADER_FORMAT.IMAGE,
] as const;

export type UploadableHeaderFormat = (typeof UPLOADABLE_HEADER_FORMATS)[number];

export const isUploadableHeaderFormat = (
  format: TemplateHeaderFormat | undefined | null,
): format is UploadableHeaderFormat =>
  !!format && (UPLOADABLE_HEADER_FORMATS as readonly TemplateHeaderFormat[]).includes(format);

const normalizeMimeType = (type: string) =>
  type.trim().toLowerCase() === MEDIA.JPG_MIME_ALIAS ? 'image/jpeg' : type.trim().toLowerCase();

// Per-format upload rules, keyed by the template header format the file fills.
export const MEDIA_RULES: Record<
  UploadableHeaderFormat,
  { accept: string; mimeTypes: string[]; maxBytes: number; maxLabel: string }
> = {
  [TEMPLATE_HEADER_FORMAT.DOCUMENT]: {
    accept: MEDIA.ACCEPT_PDF,
    mimeTypes: [MEDIA.PDF_MIME_TYPE],
    maxBytes: MEDIA.MAX_DOCUMENT_SIZE_BYTES,
    maxLabel: MEDIA.MAX_DOCUMENT_SIZE_LABEL,
  },
  [TEMPLATE_HEADER_FORMAT.IMAGE]: {
    accept: MEDIA.ACCEPT_IMAGE,
    mimeTypes: MEDIA.IMAGE_MIME_TYPES,
    maxBytes: MEDIA.MAX_IMAGE_SIZE_BYTES,
    maxLabel: MEDIA.MAX_IMAGE_SIZE_LABEL,
  },
};

export const MEDIA_MESSAGES = {
  INVALID_TYPE: {
    DOCUMENT: 'Only PDF files are allowed.',
    IMAGE: 'Only JPEG and PNG images are allowed.',
  },
  TOO_LARGE: (maxLabel: string) => `File must be ${maxLabel} or smaller.`,
  UPLOADING: 'Uploading…',
  UPLOAD_FAILED: 'Failed to upload the file. Please try again.',
  REQUIRED: {
    DOCUMENT: 'Please attach a PDF document.',
    IMAGE: 'Please attach a JPEG or PNG image.',
  },
  REMOVE: 'Remove',
  CHOOSE_FILE: {
    DOCUMENT: 'Choose PDF',
    IMAGE: 'Choose image',
  },
  HINT: {
    DOCUMENT: `PDF only, up to ${MEDIA.MAX_DOCUMENT_SIZE_LABEL}.`,
    IMAGE: `JPEG or PNG, up to ${MEDIA.MAX_IMAGE_SIZE_LABEL}.`,
  },
} as const;

// Client-side guard mirroring the backend validation so users get instant feedback.
export const validateMediaFile = (file: File, format: UploadableHeaderFormat): string | null => {
  const rules = MEDIA_RULES[format];
  if (!rules.mimeTypes.includes(normalizeMimeType(file.type))) {
    return MEDIA_MESSAGES.INVALID_TYPE[format];
  }
  if (file.size > rules.maxBytes) return MEDIA_MESSAGES.TOO_LARGE(rules.maxLabel);
  return null;
};
