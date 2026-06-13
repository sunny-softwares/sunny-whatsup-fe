export const TEMPLATE_CATEGORY = {
  MARKETING: 'marketing',
  UTILITY: 'utility',
  AUTHENTICATION: 'authentication',
} as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORY)[keyof typeof TEMPLATE_CATEGORY];

export const TEMPLATE_CATEGORY_VALUES: TemplateCategory[] = Object.values(TEMPLATE_CATEGORY);

export const TEMPLATE_CATEGORY_LABEL: Record<TemplateCategory, string> = {
  marketing: 'Marketing',
  utility: 'Utility',
  authentication: 'Authentication',
};

export const TEMPLATE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FLAGGED: 'flagged',
  PAUSED: 'paused',
  DISABLED: 'disabled',
  IN_APPEAL: 'in_appeal',
  PENDING_DELETION: 'pending_deletion',
  DELETED: 'deleted',
  LIMIT_EXCEEDED: 'limit_exceeded',
} as const;
export type TemplateStatus = (typeof TEMPLATE_STATUS)[keyof typeof TEMPLATE_STATUS];

export const TEMPLATE_HEADER_FORMAT = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  DOCUMENT: 'DOCUMENT',
  LOCATION: 'LOCATION',
} as const;
export type TemplateHeaderFormat = (typeof TEMPLATE_HEADER_FORMAT)[keyof typeof TEMPLATE_HEADER_FORMAT];

export const TEMPLATE_HEADER_FORMAT_LABEL: Record<TemplateHeaderFormat, string> = {
  TEXT: 'Text',
  IMAGE: 'Image',
  VIDEO: 'Video',
  DOCUMENT: 'Document (PDF)',
  LOCATION: 'Location',
};

// Header formats currently offered in the template builder.
export const SUPPORTED_HEADER_FORMATS: TemplateHeaderFormat[] = [
  TEMPLATE_HEADER_FORMAT.TEXT,
  TEMPLATE_HEADER_FORMAT.DOCUMENT,
];

export const TEMPLATE_BUTTON_TYPE = {
  QUICK_REPLY: 'QUICK_REPLY',
  URL: 'URL',
  PHONE_NUMBER: 'PHONE_NUMBER',
  COPY_CODE: 'COPY_CODE',
} as const;
export type TemplateButtonType = (typeof TEMPLATE_BUTTON_TYPE)[keyof typeof TEMPLATE_BUTTON_TYPE];

export const TEMPLATE_LANGUAGES = [
  { code: 'en_US', label: 'English (US)' },
  { code: 'en_GB', label: 'English (UK)' },
  { code: 'hi', label: 'Hindi' },
  { code: 'es', label: 'Spanish' },
  { code: 'pt_BR', label: 'Portuguese (BR)' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ar', label: 'Arabic' },
  { code: 'id', label: 'Indonesian' },
  { code: 'ja', label: 'Japanese' },
] as const;

export const DEFAULT_TEMPLATE_LANGUAGE = 'en_US';
