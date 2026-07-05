export const COMPANY_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const;
export type CompanyStatus = (typeof COMPANY_STATUS)[keyof typeof COMPANY_STATUS];

export const WABA_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
} as const;
export type WabaStatus = (typeof WABA_STATUS)[keyof typeof WABA_STATUS];

// Meta-reported ownership-verification state of a business phone number.
export const PHONE_CODE_VERIFICATION_STATUS = {
  VERIFIED: 'VERIFIED',
  NOT_VERIFIED: 'NOT_VERIFIED',
  EXPIRED: 'EXPIRED',
} as const;
export type PhoneCodeVerificationStatus =
  (typeof PHONE_CODE_VERIFICATION_STATUS)[keyof typeof PHONE_CODE_VERIFICATION_STATUS];

// Meta-reported messaging platform the number is registered on. A number is
// usable with the Cloud API only once its platform_type is CLOUD_API.
export const PHONE_PLATFORM_TYPE = {
  CLOUD_API: 'CLOUD_API',
  ON_PREMISE: 'ON_PREMISE',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
} as const;
export type PhonePlatformType = (typeof PHONE_PLATFORM_TYPE)[keyof typeof PHONE_PLATFORM_TYPE];

// Delivery channels Meta supports for the ownership-verification code.
export const PHONE_CODE_METHOD = {
  SMS: 'SMS',
  VOICE: 'VOICE',
} as const;
export type PhoneCodeMethod = (typeof PHONE_CODE_METHOD)[keyof typeof PHONE_CODE_METHOD];

export const PHONE_CODE_METHOD_LABEL: Record<PhoneCodeMethod, string> = {
  [PHONE_CODE_METHOD.SMS]: 'SMS',
  [PHONE_CODE_METHOD.VOICE]: 'Voice call',
};

// Length of both the verification code and the two-step verification PIN.
export const PHONE_PIN_LENGTH = 6;

export const MESSAGE_STATUS = {
  QUEUED: 'queued',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
} as const;
export type MessageStatus = (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS];
