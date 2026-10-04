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
  IMAGE: 'Image (JPEG/PNG)',
  VIDEO: 'Video',
  DOCUMENT: 'Document (PDF)',
  LOCATION: 'Location',
};

// Header formats currently offered in the template builder.
export const SUPPORTED_HEADER_FORMATS: TemplateHeaderFormat[] = [
  TEMPLATE_HEADER_FORMAT.TEXT,
  TEMPLATE_HEADER_FORMAT.DOCUMENT,
  TEMPLATE_HEADER_FORMAT.IMAGE,
];

export const TEMPLATE_BUTTON_TYPE = {
  QUICK_REPLY: 'QUICK_REPLY',
  URL: 'URL',
  PHONE_NUMBER: 'PHONE_NUMBER',
  COPY_CODE: 'COPY_CODE',
} as const;
export type TemplateButtonType = (typeof TEMPLATE_BUTTON_TYPE)[keyof typeof TEMPLATE_BUTTON_TYPE];

// Authentication templates carry one OTP button and Meta's preset body text
// instead of a free-form header/body/footer/buttons layout.
export const TEMPLATE_OTP_BUTTON_TYPE = 'OTP';

export const TEMPLATE_OTP_TYPE = {
  ZERO_TAP: 'ZERO_TAP',
  ONE_TAP: 'ONE_TAP',
  COPY_CODE: 'COPY_CODE',
} as const;
export type TemplateOtpType = (typeof TEMPLATE_OTP_TYPE)[keyof typeof TEMPLATE_OTP_TYPE];

export const TEMPLATE_OTP_TYPE_VALUES: TemplateOtpType[] = Object.values(TEMPLATE_OTP_TYPE);

export const TEMPLATE_OTP_TYPE_LABEL: Record<TemplateOtpType, string> = {
  ZERO_TAP: 'Zero-tap autofill',
  ONE_TAP: 'One-tap autofill',
  COPY_CODE: 'Copy code',
};

export const TEMPLATE_OTP_TYPE_DESCRIPTION: Record<TemplateOtpType, string> = {
  ZERO_TAP:
    'The code is sent straight to your Android app with no tap needed. If zero-tap isn’t possible, WhatsApp falls back to an autofill or copy code message.',
  ONE_TAP:
    'The code goes to your Android app when the customer taps the button. If autofill isn’t possible, a copy code message is sent instead.',
  COPY_CODE: 'Basic setup. Customers copy the code and paste it into your app or website.',
};

// OTP types that hand the code to an Android app and so need app details.
export const isAutofillOtpType = (type: TemplateOtpType) =>
  type === TEMPLATE_OTP_TYPE.ONE_TAP || type === TEMPLATE_OTP_TYPE.ZERO_TAP;

// Limits Meta enforces on authentication templates.
export const AUTH_TEMPLATE_LIMITS = {
  CODE_EXPIRATION_MIN_MINUTES: 1,
  CODE_EXPIRATION_MAX_MINUTES: 90,
  DEFAULT_CODE_EXPIRATION_MINUTES: 10,
  MAX_SUPPORTED_APPS: 5,
  BUTTON_TEXT_MAX: 25,
  PACKAGE_NAME_MAX: 224,
  SIGNATURE_HASH_LENGTH: 11,
  OTP_CODE_MAX: 15,
} as const;

export const AUTH_PACKAGE_NAME_RE = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/;
export const AUTH_SIGNATURE_HASH_RE = /^[A-Za-z0-9+/=]{11}$/;

// Message validity period choices (Meta allows 30 seconds to 15 minutes).
export const AUTH_TEMPLATE_TTL_OPTIONS = [
  { seconds: 30, label: '30 seconds' },
  { seconds: 60, label: '1 minute' },
  { seconds: 120, label: '2 minutes' },
  { seconds: 180, label: '3 minutes' },
  { seconds: 300, label: '5 minutes' },
  { seconds: 600, label: '10 minutes' },
  { seconds: 900, label: '15 minutes' },
] as const;

export const DEFAULT_AUTH_TEMPLATE_TTL_SECONDS = 600;

// English renderings of Meta's preset authentication content, used for
// previews. Meta localizes the real message to the template language.
export const AUTH_TEMPLATE_TEXT = {
  BODY: '{{1}} is your verification code.',
  SECURITY_RECOMMENDATION: 'For your security, do not share this code.',
  FOOTER: (minutes: number) => `This code expires in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
  COPY_CODE_BUTTON: 'Copy code',
  AUTOFILL_BUTTON: 'Autofill',
} as const;

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
